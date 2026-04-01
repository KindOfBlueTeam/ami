from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, SQLModel

from database import get_session
from models import Provider, Recommendation, Subscription
from recommendation_engine import estimate_kwh, CO2E_KG_PER_KWH

router = APIRouter(tags=["dashboard"])


class SubscriptionSummary(SQLModel):
    id: int
    provider_name: str
    provider_category: str
    logo_color: str
    plan_name: Optional[str]
    monthly_cost: float
    billing_interval: str
    renewal_date: date
    days_until_renewal: int
    usage_estimate: str
    perceived_value: str
    estimated_kwh_monthly: float
    estimated_co2e_kg_monthly: float


class DashboardSummary(SQLModel):
    total_monthly_cost: float
    total_annual_cost_estimate: float
    total_estimated_kwh_monthly: float
    total_estimated_co2e_kg_monthly: float
    active_subscription_count: int
    next_renewal_days: Optional[int]
    next_renewal_provider: Optional[str]
    next_renewal_date: Optional[date]
    open_recommendation_count: int
    overlap_categories: list[str]
    subscriptions: list[SubscriptionSummary]


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(session: Session = Depends(get_session)):
    from models import Plan

    subs = session.exec(
        select(Subscription).where(Subscription.status == "active")
    ).all()

    today = date.today()
    summaries: list[SubscriptionSummary] = []

    for sub in subs:
        provider = session.get(Provider, sub.provider_id)
        plan = session.get(Plan, sub.plan_id) if sub.plan_id else None

        monthly_cost = sub.cost / 12 if sub.billing_interval == "annual" else sub.cost
        category = provider.category if provider else "chat"
        kwh = estimate_kwh(category, sub.usage_estimate)
        co2e = round(kwh * CO2E_KG_PER_KWH, 4)
        renewal = sub.renewal_date
        days = (renewal - today).days

        summaries.append(SubscriptionSummary(
            id=sub.id,
            provider_name=provider.name if provider else "Unknown",
            provider_category=category,
            logo_color=provider.logo_color if provider else "#6B7280",
            plan_name=plan.name if plan else sub.custom_plan_name,
            monthly_cost=round(monthly_cost, 2),
            billing_interval=sub.billing_interval,
            renewal_date=renewal,
            days_until_renewal=days,
            usage_estimate=sub.usage_estimate,
            perceived_value=sub.perceived_value,
            estimated_kwh_monthly=round(kwh, 3),
            estimated_co2e_kg_monthly=co2e,
        ))

    # Totals
    total_monthly = round(sum(s.monthly_cost for s in summaries), 2)
    total_kwh = round(sum(s.estimated_kwh_monthly for s in summaries), 3)
    total_co2e = round(sum(s.estimated_co2e_kg_monthly for s in summaries), 4)

    # Next renewal
    upcoming = sorted(
        [s for s in summaries if s.days_until_renewal >= 0],
        key=lambda s: s.days_until_renewal,
    )
    next_renewal = upcoming[0] if upcoming else None

    # Overlap detection (categories with 2+ subscriptions)
    from collections import Counter
    category_counts = Counter(s.provider_category for s in summaries)
    overlap_categories = [cat for cat, count in category_counts.items() if count > 1]

    # Open recommendations
    open_recs = session.exec(
        select(Recommendation).where(Recommendation.dismissed == False)  # noqa: E712
    ).all()

    return DashboardSummary(
        total_monthly_cost=total_monthly,
        total_annual_cost_estimate=round(total_monthly * 12, 2),
        total_estimated_kwh_monthly=total_kwh,
        total_estimated_co2e_kg_monthly=total_co2e,
        active_subscription_count=len(summaries),
        next_renewal_days=next_renewal.days_until_renewal if next_renewal else None,
        next_renewal_provider=next_renewal.provider_name if next_renewal else None,
        next_renewal_date=next_renewal.renewal_date if next_renewal else None,
        open_recommendation_count=len(open_recs),
        overlap_categories=overlap_categories,
        subscriptions=summaries,
    )
