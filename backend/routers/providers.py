from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Plan, PlanRead, Provider, ProviderRead

router = APIRouter(tags=["providers"])


@router.get("/providers", response_model=list[ProviderRead])
def list_providers(session: Session = Depends(get_session)):
    return session.exec(select(Provider).order_by(Provider.name)).all()


@router.get("/providers/{provider_id}", response_model=ProviderRead)
def get_provider(provider_id: int, session: Session = Depends(get_session)):
    p = session.get(Provider, provider_id)
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    return p


@router.get("/providers/{provider_id}/plans", response_model=list[PlanRead])
def list_plans_for_provider(provider_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(Plan)
        .where(Plan.provider_id == provider_id)
        .order_by(Plan.price_monthly)
    ).all()
