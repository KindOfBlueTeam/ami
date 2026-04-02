import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_active_user_id, get_session
from models import (
    AppSetting,
    OnboardingComplete,
    Subscription,
    SubscriptionRead,
    User,
)
from recommendation_engine import save_recommendations
from routers.subscriptions import _enrich

logger = logging.getLogger(__name__)

router = APIRouter(tags=["onboarding"])


@router.get("/onboarding/status")
def onboarding_status(session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    user = session.get(User, user_id)
    complete = user.onboarding_complete if user else False
    return {"complete": complete, "user_id": user_id}


@router.post("/onboarding/complete", response_model=list[SubscriptionRead])
def complete_onboarding(
    data: OnboardingComplete,
    session: Session = Depends(get_session),
):
    user_id = get_active_user_id(session)
    logger.info(f"Completing onboarding for user_id={user_id} with {len(data.subscriptions)} subs")

    # Non-destructive upsert: match existing subs by provider_id for this user.
    # Update if exists, create if not.
    existing_by_provider: dict[int, Subscription] = {
        s.provider_id: s
        for s in session.exec(
            select(Subscription).where(Subscription.user_id == user_id)
        ).all()
    }

    touched_ids: set[int] = set()
    upserted: list[Subscription] = []

    for s in data.subscriptions:
        fields = s.model_dump()
        # Convert enum values to plain strings for the table model
        fields["billing_interval"] = str(fields["billing_interval"].value) if hasattr(fields["billing_interval"], "value") else str(fields["billing_interval"])
        fields["usage_estimate"] = str(fields["usage_estimate"].value) if hasattr(fields["usage_estimate"], "value") else str(fields["usage_estimate"])
        fields["perceived_value"] = str(fields["perceived_value"].value) if hasattr(fields["perceived_value"], "value") else str(fields["perceived_value"])

        existing = existing_by_provider.get(s.provider_id)
        if existing:
            for k, v in fields.items():
                setattr(existing, k, v)
            existing.user_id = user_id
            existing.updated_at = datetime.utcnow()
            session.add(existing)
            session.flush()
            touched_ids.add(existing.id)
            upserted.append(existing)
        else:
            sub = Subscription(
                **fields,
                user_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(sub)
            session.flush()
            touched_ids.add(sub.id)
            upserted.append(sub)

    # Persist settings
    settings_to_save = {
        "eco_priority": str(data.eco_priority.value) if hasattr(data.eco_priority, "value") else str(data.eco_priority),
        "optimization_style": str(data.optimization_style.value) if hasattr(data.optimization_style, "value") else str(data.optimization_style),
        "eco_tradeoff": str(data.eco_tradeoff.value) if hasattr(data.eco_tradeoff, "value") else str(data.eco_tradeoff),
    }
    for key, value in settings_to_save.items():
        row = session.exec(select(AppSetting).where(AppSetting.key == key)).first()
        if row:
            row.value = value
            session.add(row)
        else:
            session.add(AppSetting(key=key, value=value))

    # Mark user onboarding complete
    user = session.get(User, user_id)
    if user:
        user.onboarding_complete = True
        session.add(user)
        # Also keep legacy app_settings key for backward compat
        ob_row = session.exec(select(AppSetting).where(AppSetting.key == "onboarding_complete")).first()
        if ob_row:
            ob_row.value = "true"
            session.add(ob_row)
        else:
            session.add(AppSetting(key="onboarding_complete", value="true"))

    session.commit()
    for sub in upserted:
        session.refresh(sub)

    # Auto-generate initial recommendations
    save_recommendations(session, user_id=user_id)

    logger.info(f"Onboarding complete for user_id={user_id}: {len(upserted)} subs upserted")
    return [_enrich(s, session) for s in upserted]


@router.post("/onboarding/reset", response_model=dict)
def reset_onboarding(session: Session = Depends(get_session)):
    """
    Explicitly reset onboarding for the active user.
    Deletes all their subscriptions and recommendations, clears onboarding flag.
    """
    user_id = get_active_user_id(session)
    logger.info(f"Resetting onboarding for user_id={user_id}")

    # Delete recommendations first (FK constraint)
    from models import Recommendation
    recs = session.exec(
        select(Recommendation).where(Recommendation.user_id == user_id)
    ).all()
    for rec in recs:
        session.delete(rec)

    # Delete subscriptions
    subs = session.exec(
        select(Subscription).where(Subscription.user_id == user_id)
    ).all()
    sub_count = len(subs)
    for sub in subs:
        session.delete(sub)

    # Clear onboarding flag on user
    user = session.get(User, user_id)
    if user:
        user.onboarding_complete = False
        session.add(user)

    # Clear legacy app_settings key
    ob_row = session.exec(select(AppSetting).where(AppSetting.key == "onboarding_complete")).first()
    if ob_row:
        ob_row.value = "false"
        session.add(ob_row)

    session.commit()
    logger.info(f"Reset complete for user_id={user_id}: deleted {sub_count} subs")
    return {"reset": True, "user_id": user_id, "subscriptions_deleted": sub_count}
