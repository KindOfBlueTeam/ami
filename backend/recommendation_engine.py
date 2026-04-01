"""
Deterministic recommendation engine for Ami.

Rules are based on user-entered data only — no live quota/usage API access.
Eco estimates use published approximate values for consumer AI workloads.
"""
from __future__ import annotations

from datetime import date
from typing import NamedTuple, Optional

from sqlmodel import Session, select

from models import (
    Subscription, Provider, Plan, Recommendation, AppSetting
)

# ── Environmental impact constants ────────────────────────────────────────────
# Sources: various published estimates on LLM inference energy use.
# These are rough averages — disclosed as estimates in the UI.
CO2E_KG_PER_KWH = 0.386  # US average grid (EPA 2023)

# kWh per month by category and intensity
ECO_ESTIMATES = {
    "chat": {
        # ~0.003 kWh per message × N messages/month
        "light":    0.45,   # ~150 messages
        "moderate": 1.80,   # ~600 messages
        "heavy":    5.40,   # ~1,800 messages
    },
    "image": {
        # ~0.02 kWh per image × N images/month
        "light":    0.60,   # ~30 images
        "moderate": 3.00,   # ~150 images
        "heavy":   10.00,   # ~500 images
    },
    "audio": {
        # ~0.005 kWh per minute × N minutes/month
        "light":    0.15,   # ~30 min
        "moderate": 0.60,   # ~120 min
        "heavy":    1.50,   # ~300 min
    },
    "video": {
        "light":    0.50,
        "moderate": 2.00,
        "heavy":    6.00,
    },
    "coding": {
        "light":    0.30,
        "moderate": 1.20,
        "heavy":    3.60,
    },
    "writing": {
        "light":    0.30,
        "moderate": 1.20,
        "heavy":    3.60,
    },
}

# Category overlap pairs — subscriptions in these groups compete for same use
OVERLAP_CATEGORIES = {"chat", "coding", "writing"}

# Minimum monthly savings worth an annual-switch recommendation
MIN_ANNUAL_SAVINGS = 5.0


class RecResult(NamedTuple):
    subscription_id: int
    rec_type: str
    reason: str
    detail: Optional[str]
    potential_savings_annual: Optional[float]
    estimated_kwh_change: Optional[float]
    estimated_co2e_change: Optional[float]
    priority: str


def estimate_kwh(category: str, intensity: str) -> float:
    cat = ECO_ESTIMATES.get(category, ECO_ESTIMATES["chat"])
    return cat.get(intensity, cat["moderate"])


def get_setting(session: Session, key: str, default: str = "") -> str:
    row = session.exec(select(AppSetting).where(AppSetting.key == key)).first()
    return row.value if row else default


def run_engine(session: Session) -> list[RecResult]:
    results: list[RecResult] = []

    subs = session.exec(
        select(Subscription).where(Subscription.status == "active")
    ).all()

    if not subs:
        return results

    # Build lookup maps
    provider_map: dict[int, Provider] = {}
    plan_map: dict[int, Plan] = {}

    for sub in subs:
        if sub.provider_id not in provider_map:
            p = session.get(Provider, sub.provider_id)
            if p:
                provider_map[sub.provider_id] = p
        if sub.plan_id and sub.plan_id not in plan_map:
            pl = session.get(Plan, sub.plan_id)
            if pl:
                plan_map[sub.plan_id] = pl

    eco_priority = get_setting(session, "eco_priority", "medium")
    optimization_style = get_setting(session, "optimization_style", "balanced")

    # ── Rule 1: Annual billing savings ──────────────────────────────────────
    for sub in subs:
        if sub.billing_interval != "monthly":
            continue
        if sub.plan_id and sub.plan_id in plan_map:
            plan = plan_map[sub.plan_id]
            if plan.price_annual_total:
                annual_equiv_monthly = plan.price_annual_total / 12
                savings_monthly = sub.cost - annual_equiv_monthly
                savings_annual = savings_monthly * 12
                if savings_annual >= MIN_ANNUAL_SAVINGS:
                    results.append(RecResult(
                        subscription_id=sub.id,
                        rec_type="annual",
                        reason=f"Switch to annual billing and save ~${savings_annual:.0f}/year",
                        detail=(
                            f"You currently pay ${sub.cost:.2f}/month. "
                            f"The annual plan works out to ${annual_equiv_monthly:.2f}/month "
                            f"(${plan.price_annual_total:.0f}/year)."
                        ),
                        potential_savings_annual=savings_annual,
                        estimated_kwh_change=None,
                        estimated_co2e_change=None,
                        priority="high" if savings_annual >= 20 else "medium",
                    ))

    # ── Rule 2: Cancel low-perceived-value subscriptions ────────────────────
    for sub in subs:
        if sub.perceived_value == "low":
            annual_cost = sub.cost * 12 if sub.billing_interval == "monthly" else sub.cost
            provider = provider_map.get(sub.provider_id)
            name = provider.name if provider else "this service"
            results.append(RecResult(
                subscription_id=sub.id,
                rec_type="cancel",
                reason=f"You rated {name} as low value — consider cancelling",
                detail=(
                    f"You're paying ~${annual_cost:.0f}/year for {name} "
                    "but feel it's not worth it. Cancelling would free up that budget."
                ),
                potential_savings_annual=annual_cost,
                estimated_kwh_change=None,
                estimated_co2e_change=None,
                priority="high",
            ))

    # ── Rule 3: Downgrade — light usage, paid plan, free tier exists ────────
    for sub in subs:
        if sub.usage_estimate != "light" or sub.cost == 0:
            continue
        if sub.plan_id and sub.plan_id in plan_map:
            plan = plan_map[sub.plan_id]
            if plan.is_free:
                continue  # already on free
        # Check if provider has a free plan
        provider = provider_map.get(sub.provider_id)
        if not provider:
            continue
        free_plan = session.exec(
            select(Plan).where(
                Plan.provider_id == sub.provider_id,
                Plan.is_free == True,  # noqa: E712
            )
        ).first()
        if free_plan:
            annual_cost = sub.cost * 12 if sub.billing_interval == "monthly" else sub.cost
            results.append(RecResult(
                subscription_id=sub.id,
                rec_type="downgrade",
                reason=f"Light usage — the free tier might cover your {provider.name} needs",
                detail=(
                    f"You've marked your {provider.name} usage as light. "
                    f"A free plan is available that may cover what you actually use, "
                    f"saving you ~${annual_cost:.0f}/year."
                ),
                potential_savings_annual=annual_cost,
                estimated_kwh_change=None,
                estimated_co2e_change=None,
                priority="medium",
            ))

    # ── Rule 4: Overlap detection ────────────────────────────────────────────
    overlap_groups: dict[str, list[Subscription]] = {}
    for sub in subs:
        provider = provider_map.get(sub.provider_id)
        if not provider:
            continue
        if provider.category in OVERLAP_CATEGORIES:
            overlap_groups.setdefault(provider.category, []).append(sub)

    for category, group in overlap_groups.items():
        if len(group) < 2:
            continue
        names = [provider_map[s.provider_id].name for s in group if s.provider_id in provider_map]
        cheapest_cost = min(s.cost for s in group)
        potential_savings = cheapest_cost * 12  # rough: cancel the cheapest duplicate
        for sub in group:
            results.append(RecResult(
                subscription_id=sub.id,
                rec_type="overlap",
                reason=f"You have {len(group)} overlapping {category} AI subscriptions",
                detail=(
                    f"{', '.join(names)} all serve similar purposes. "
                    "Consider which one you rely on most and cancelling the others."
                ),
                potential_savings_annual=potential_savings,
                estimated_kwh_change=None,
                estimated_co2e_change=None,
                priority="medium",
            ))

    # ── Rule 5: Eco — heavy usage, high eco priority ─────────────────────────
    if eco_priority == "high":
        for sub in subs:
            if sub.usage_estimate != "heavy":
                continue
            provider = provider_map.get(sub.provider_id)
            if not provider:
                continue
            kwh = estimate_kwh(provider.category, "heavy")
            kwh_light = estimate_kwh(provider.category, "light")
            kwh_saved = kwh - kwh_light
            co2_saved = kwh_saved * CO2E_KG_PER_KWH
            results.append(RecResult(
                subscription_id=sub.id,
                rec_type="eco",
                reason=f"Heavy {provider.name} use has a meaningful environmental footprint",
                detail=(
                    f"At heavy usage, {provider.name} consumes roughly {kwh:.1f} kWh/month "
                    f"(~{kwh * CO2E_KG_PER_KWH:.2f} kg CO₂e). "
                    f"Reducing to moderate use could save ~{kwh_saved:.1f} kWh/month."
                ),
                potential_savings_annual=None,
                estimated_kwh_change=-kwh_saved,
                estimated_co2e_change=-co2_saved,
                priority="low",
            ))

    # ── Rule 6: Keep — high value, moderate/heavy usage ─────────────────────
    for sub in subs:
        if sub.perceived_value == "high" and sub.usage_estimate in ("moderate", "heavy"):
            provider = provider_map.get(sub.provider_id)
            name = provider.name if provider else "this service"
            results.append(RecResult(
                subscription_id=sub.id,
                rec_type="keep",
                reason=f"{name} looks like a good fit for you",
                detail=(
                    f"You're actively using {name} and find it valuable. "
                    "No changes needed here."
                ),
                potential_savings_annual=None,
                estimated_kwh_change=None,
                estimated_co2e_change=None,
                priority="low",
            ))

    return results


def save_recommendations(session: Session) -> int:
    """Delete existing non-dismissed recs, run engine, persist results."""
    # Remove old non-dismissed recommendations
    old = session.exec(
        select(Recommendation).where(Recommendation.dismissed == False)  # noqa: E712
    ).all()
    for rec in old:
        session.delete(rec)
    session.commit()

    results = run_engine(session)
    for r in results:
        rec = Recommendation(
            subscription_id=r.subscription_id,
            rec_type=r.rec_type,
            reason=r.reason,
            detail=r.detail,
            potential_savings_annual=r.potential_savings_annual,
            estimated_kwh_change=r.estimated_kwh_change,
            estimated_co2e_change=r.estimated_co2e_change,
            priority=r.priority,
        )
        session.add(rec)
    session.commit()
    return len(results)
