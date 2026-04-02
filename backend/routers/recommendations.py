import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_active_user_id, get_session
from models import (
    Provider,
    ProviderRead,
    Recommendation,
    RecommendationRead,
    Subscription,
)
from recommendation_engine import save_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recommendations"])


def _enrich(rec: Recommendation, session: Session) -> RecommendationRead:
    sub = session.get(Subscription, rec.subscription_id)
    provider = session.get(Provider, sub.provider_id) if sub else None
    return RecommendationRead(
        **rec.model_dump(),
        provider=ProviderRead.model_validate(provider.model_dump()) if provider else None,
    )


@router.get("/recommendations", response_model=list[RecommendationRead])
def list_recommendations(
    include_dismissed: bool = False,
    session: Session = Depends(get_session),
):
    user_id = get_active_user_id(session)
    q = select(Recommendation).where(Recommendation.user_id == user_id)
    if not include_dismissed:
        q = q.where(Recommendation.dismissed == False)  # noqa: E712
    recs = session.exec(
        q.order_by(Recommendation.priority_score.desc(), Recommendation.created_at.desc())
    ).all()
    return [_enrich(r, session) for r in recs]


@router.post("/recommendations/generate", response_model=dict)
def generate_recommendations(session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    logger.info(f"Manual rec generation triggered for user_id={user_id}")
    count = save_recommendations(session, user_id=user_id)
    return {"generated": count}


@router.put("/recommendations/{rec_id}/dismiss", response_model=RecommendationRead)
def dismiss_recommendation(rec_id: int, session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    rec = session.get(Recommendation, rec_id)
    if not rec or rec.user_id != user_id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.dismissed = True
    session.add(rec)
    session.commit()
    session.refresh(rec)
    return _enrich(rec, session)


@router.delete("/recommendations/{rec_id}", status_code=204)
def delete_recommendation(rec_id: int, session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    rec = session.get(Recommendation, rec_id)
    if not rec or rec.user_id != user_id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    session.delete(rec)
    session.commit()
