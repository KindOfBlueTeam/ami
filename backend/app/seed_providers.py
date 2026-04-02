"""
Idempotent provider seed script.

Upserts all providers from the canonical catalog (app/provider_catalog.py):
  - Creates providers that do not exist (matched by slug, then name)
  - Updates metadata fields on existing providers
  - Never deletes providers or any user subscription data

Usage:
    cd ami/backend
    python -m app.seed_providers
"""
import sys
from pathlib import Path

# Ensure the backend root is importable regardless of invocation method
_BACKEND_DIR = Path(__file__).parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from sqlmodel import Session, select  # noqa: E402

from database import create_db_and_tables, engine, run_migrations  # noqa: E402
from models import Provider  # noqa: E402
from app.migrate import run as run_file_migrations  # noqa: E402
from app.provider_catalog import PROVIDER_CATALOG  # noqa: E402

# Metadata fields that are safe to overwrite on every run.
# id, created_at, is_consumer are intentionally excluded.
_UPDATE_FIELDS = (
    "slug", "category", "website", "logo_color",
    "logo_path", "account_url", "billing_url", "link_notes", "is_active",
)


def seed_providers() -> None:
    # Bring schema up to date before touching data
    create_db_and_tables()
    run_migrations()
    run_file_migrations()

    created = 0
    updated = 0

    with Session(engine) as session:
        for entry in PROVIDER_CATALOG:
            slug = entry["slug"]
            name = entry["name"]

            # 1. Look up by slug (canonical key)
            provider: Provider | None = session.exec(
                select(Provider).where(Provider.slug == slug)
            ).first()

            # 2. Fall back to name lookup (handles rows seeded before slug existed)
            if provider is None:
                provider = session.exec(
                    select(Provider).where(Provider.name == name)
                ).first()

            if provider is None:
                # Create — map catalog's website_url to model's website field
                provider = Provider(
                    name=name,
                    slug=slug,
                    category=entry["category"],
                    website=entry.get("website_url"),
                    logo_color=entry.get("logo_color", "#6B7280"),
                    logo_path=entry.get("logo_path"),
                    account_url=entry.get("account_url"),
                    billing_url=entry.get("billing_url"),
                    link_notes=entry.get("link_notes"),
                    is_active=entry.get("is_active", True),
                )
                session.add(provider)
                created += 1
            else:
                # Update metadata — never touch id, created_at, is_consumer
                provider.slug        = slug
                provider.category    = entry["category"]
                provider.website     = entry.get("website_url", provider.website)
                provider.logo_color  = entry.get("logo_color", provider.logo_color)
                provider.logo_path   = entry.get("logo_path")
                provider.account_url = entry.get("account_url")
                provider.billing_url = entry.get("billing_url")
                provider.link_notes  = entry.get("link_notes")
                provider.is_active   = entry.get("is_active", True)
                session.add(provider)
                updated += 1

        session.commit()

    print(f"Providers — {created} created, {updated} updated.")


if __name__ == "__main__":
    print("Seeding Ami provider catalog…")
    seed_providers()
    print("Done.")
