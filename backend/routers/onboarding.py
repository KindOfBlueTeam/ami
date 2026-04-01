from datetime import datetime

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import AppSetting, OnboardingComplete, Subscription, SubscriptionRead
from routers.subscriptions import _enrich
from recommendation_engine import save_recommendations

router = APIRouter(tags=["onboarding"])


@router.get("/onboarding/status")
def onboarding_status(session: Session = Depends(get_session)):
    row = session.exec(
        select(AppSetting).where(AppSetting.key == "onboarding_complete")
    ).first()
    complete = row.value == "true" if row else False
    return {"complete": complete}


@router.post("/onboarding/complete", response_model=list[SubscriptionRead])
def complete_onboarding(data: OnboardingComplete, session: Session = Depends(get_session)):
    # Clear any pre-existing subscriptions (e.g. from seed --with-subs)
    # Onboarding is the source of truth for initial setup.
    existing_subs = session.exec(select(Subscription)).all()
    for sub in existing_subs:
        session.delete(sub)
    session.flush()

    # Persist subscriptions
    created: list[Subscription] = []
    for s in data.subscriptions:
        sub = Subscription(
            **s.model_dump(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(sub)
        session.flush()
        created.append(sub)

    # Save profile settings
    profile_settings = {
        "eco_priority": data.eco_priority,
        "optimization_style": data.optimization_style,
        "eco_tradeoff": data.eco_tradeoff,
        "onboarding_complete": "true",
    }
    for key, value in profile_settings.items():
        existing = session.exec(
            select(AppSetting).where(AppSetting.key == key)
        ).first()
        if existing:
            existing.value = value
            session.add(existing)
        else:
            session.add(AppSetting(key=key, value=value))

    session.commit()
    for sub in created:
        session.refresh(sub)

    # Auto-generate initial recommendations
    save_recommendations(session)

    return [_enrich(s, session) for s in created]
