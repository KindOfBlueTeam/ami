import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_active_user_id, get_session
from models import (
    Plan,
    PlanRead,
    Provider,
    ProviderRead,
    Subscription,
    SubscriptionCreate,
    SubscriptionRead,
    SubscriptionUpdate,
)
from recommendation_engine import CO2E_KG_PER_KWH, estimate_kwh
from service_links import get_service_links

logger = logging.getLogger(__name__)

router = APIRouter(tags=["subscriptions"])


def _monthly_cost(sub: Subscription) -> float:
    if sub.billing_interval == "annual":
        return round(sub.cost / 12, 2)
    return sub.cost


def _provider_read(p: Provider) -> ProviderRead:
    return ProviderRead(
        id=p.id, name=p.name, website=p.website,
        category=p.category, logo_color=p.logo_color, is_consumer=p.is_consumer,
        **get_service_links(p.name),
    )


def _enrich(sub: Subscription, session: Session) -> SubscriptionRead:
    provider = session.get(Provider, sub.provider_id)
    plan = session.get(Plan, sub.plan_id) if sub.plan_id else None

    CO2E_KG_PER_MILE = 0.404

    category = provider.category if provider else "chat"
    kwh = estimate_kwh(category, sub.usage_estimate)
    co2e = round(kwh * CO2E_KG_PER_KWH, 4)
    miles = round(co2e / CO2E_KG_PER_MILE)

    return SubscriptionRead(
        **sub.model_dump(),
        provider=_provider_read(provider) if provider else None,
        plan=PlanRead.model_validate(plan.model_dump()) if plan else None,
        monthly_cost=_monthly_cost(sub),
        estimated_kwh_monthly=round(kwh, 3),
        estimated_co2e_kg_monthly=co2e,
        co2_miles_equivalent_monthly=miles,
    )


@router.get("/subscriptions", response_model=list[SubscriptionRead])
def list_subscriptions(session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    subs = session.exec(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .order_by(Subscription.renewal_date)
    ).all()
    return [_enrich(s, session) for s in subs]


@router.post("/subscriptions", response_model=SubscriptionRead, status_code=201)
def create_subscription(
    data: SubscriptionCreate,
    session: Session = Depends(get_session),
):
    user_id = get_active_user_id(session)
    fields = data.model_dump()
    # Normalise enum values to plain strings for the table model
    for key in ("billing_interval", "status", "usage_estimate", "perceived_value"):
        if hasattr(fields[key], "value"):
            fields[key] = fields[key].value
    sub = Subscription(**fields, user_id=user_id)
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich(sub, session)


@router.get("/subscriptions/{sub_id}", response_model=SubscriptionRead)
def get_subscription(sub_id: int, session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    sub = session.get(Subscription, sub_id)
    if not sub or sub.user_id != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return _enrich(sub, session)


@router.put("/subscriptions/{sub_id}", response_model=SubscriptionRead)
def update_subscription(
    sub_id: int,
    data: SubscriptionUpdate,
    session: Session = Depends(get_session),
):
    user_id = get_active_user_id(session)
    sub = session.get(Subscription, sub_id)
    if not sub or sub.user_id != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(sub, k, v.value if hasattr(v, "value") else v)
    sub.updated_at = datetime.utcnow()
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich(sub, session)


@router.delete("/subscriptions/{sub_id}", status_code=204)
def delete_subscription(sub_id: int, session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    sub = session.get(Subscription, sub_id)
    if not sub or sub.user_id != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    session.delete(sub)
    session.commit()
