"""
Idempotent plan seed script.

Upserts all plans from the canonical catalog (app/data/plan_catalog.py):
  - Looks up each plan by (provider_id, slug, billing_interval) — exact match
  - Falls back to (provider_id, name, slug=NULL) for legacy rows seeded before
    this migration, but only for the "monthly" billing_interval variant
  - Creates plans that do not exist
  - Updates name, default_price_usd, monthly_equivalent_usd, is_active on existing rows
  - Also keeps legacy price_monthly in sync for backward compatibility
  - Never deletes plans or modifies user subscription data

Usage:
    cd ami/backend
    python -m app.seed_plans
"""
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from sqlmodel import Session, select  # noqa: E402

from database import create_db_and_tables, engine, run_migrations  # noqa: E402
from models import Plan, Provider  # noqa: E402
from app.migrate import run as run_file_migrations  # noqa: E402
from app.data.plan_catalog import PLAN_CATALOG  # noqa: E402


def seed_plans() -> None:
    # Ensure schema is up to date before touching data
    create_db_and_tables()
    run_migrations()
    run_file_migrations()

    created = 0
    updated = 0
    skipped = 0

    with Session(engine) as session:
        # Build a slug→provider map once for efficiency
        providers: dict[str, Provider] = {
            p.slug: p
            for p in session.exec(select(Provider)).all()
            if p.slug
        }

        for provider_block in PLAN_CATALOG:
            provider_slug = provider_block["provider_slug"]
            provider = providers.get(provider_slug)

            if provider is None:
                print(f"  [warn] Provider not found: {provider_slug!r} — skipping its plans.")
                skipped += len(provider_block["plans"])
                continue

            for entry in provider_block["plans"]:
                plan_slug        = entry["slug"]
                billing_interval = entry["billing_interval"]
                plan_name        = entry["name"]

                # ── Lookup 1: exact match by (provider_id, slug, billing_interval)
                plan: Plan | None = session.exec(
                    select(Plan).where(
                        Plan.provider_id == provider.id,
                        Plan.slug == plan_slug,
                        Plan.billing_interval == billing_interval,
                    )
                ).first()

                # ── Lookup 2: legacy row — no slug yet, match by name.
                #    Only claim a legacy row for the "monthly" variant so that the
                #    annual sibling (same name, different billing_interval) gets its
                #    own new row rather than stealing the old one.
                if plan is None and billing_interval == "monthly":
                    plan = session.exec(
                        select(Plan).where(
                            Plan.provider_id == provider.id,
                            Plan.name == plan_name,
                            Plan.slug == None,  # noqa: E711  (SQLAlchemy IS NULL)
                        )
                    ).first()

                if plan is None:
                    # ── Create new plan row
                    plan = Plan(
                        provider_id=provider.id,
                        name=plan_name,
                        slug=plan_slug,
                        billing_interval=billing_interval,
                        default_price_usd=entry["default_price_usd"],
                        monthly_equivalent_usd=entry["monthly_equivalent_usd"],
                        is_active=entry.get("is_active", True),
                        notes=entry.get("notes"),
                        # Keep legacy fields in sync
                        price_monthly=entry["monthly_equivalent_usd"],
                        price_annual_total=(
                            entry["default_price_usd"]
                            if billing_interval == "annual"
                            else None
                        ),
                        is_free=entry.get("is_free", False),
                    )
                    session.add(plan)
                    created += 1
                else:
                    # ── Update metadata — never touch user subscription data
                    plan.name                  = plan_name
                    plan.slug                  = plan_slug
                    plan.billing_interval      = billing_interval
                    plan.default_price_usd     = entry["default_price_usd"]
                    plan.monthly_equivalent_usd = entry["monthly_equivalent_usd"]
                    plan.is_active             = entry.get("is_active", True)
                    plan.notes                 = entry.get("notes", plan.notes)
                    plan.is_free               = entry.get("is_free", plan.is_free)
                    # Keep legacy price_monthly in sync for existing API consumers
                    plan.price_monthly = entry["monthly_equivalent_usd"]
                    if billing_interval == "annual":
                        plan.price_annual_total = entry["default_price_usd"]
                    session.add(plan)
                    updated += 1

        session.commit()

    print(f"Plans — {created} created, {updated} updated, {skipped} skipped.")


if __name__ == "__main__":
    print("Seeding Ami plan catalog…")
    seed_plans()
    print("Done.")
