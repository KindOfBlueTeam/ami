from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import (
    UsagePeriod, UsagePeriodCreate, UsagePeriodRead,
    UsageEntry, UsageEntryCreate, UsageEntryRead,
    Subscription,
)

router = APIRouter(tags=["usage"])

# kWh per unit by activity type
KWH_RATES = {
    "message": 0.003,
    "image": 0.020,
    "audio_min": 0.005,
    "video_min": 0.015,
    "session": 0.030,
}
CO2E_PER_KWH = 0.386


def _calc_eco(activity_type: str, quantity: float):
    rate = KWH_RATES.get(activity_type, 0.003)
    kwh = round(rate * quantity, 4)
    co2e = round(kwh * CO2E_PER_KWH, 4)
    return kwh, co2e


# ── Periods ────────────────────────────────────────────────────────────────────

@router.get("/usage/periods", response_model=list[UsagePeriodRead])
def list_periods(
    subscription_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    q = select(UsagePeriod)
    if subscription_id:
        q = q.where(UsagePeriod.subscription_id == subscription_id)
    return session.exec(q.order_by(UsagePeriod.period_start.desc())).all()


@router.post("/usage/periods", response_model=UsagePeriodRead, status_code=201)
def create_period(data: UsagePeriodCreate, session: Session = Depends(get_session)):
    sub = session.get(Subscription, data.subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    period = UsagePeriod(**data.model_dump())
    session.add(period)
    session.commit()
    session.refresh(period)
    return period


@router.get("/usage/periods/{period_id}", response_model=UsagePeriodRead)
def get_period(period_id: int, session: Session = Depends(get_session)):
    p = session.get(UsagePeriod, period_id)
    if not p:
        raise HTTPException(status_code=404, detail="Period not found")
    return p


@router.delete("/usage/periods/{period_id}", status_code=204)
def delete_period(period_id: int, session: Session = Depends(get_session)):
    p = session.get(UsagePeriod, period_id)
    if not p:
        raise HTTPException(status_code=404, detail="Period not found")
    entries = session.exec(
        select(UsageEntry).where(UsageEntry.period_id == period_id)
    ).all()
    for e in entries:
        session.delete(e)
    session.delete(p)
    session.commit()


# ── Entries ────────────────────────────────────────────────────────────────────

@router.get("/usage/periods/{period_id}/entries", response_model=list[UsageEntryRead])
def list_entries(period_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(UsageEntry)
        .where(UsageEntry.period_id == period_id)
        .order_by(UsageEntry.entry_date.desc())
    ).all()


@router.post("/usage/entries", response_model=UsageEntryRead, status_code=201)
def create_entry(data: UsageEntryCreate, session: Session = Depends(get_session)):
    entry = UsageEntry(**data.model_dump())
    if entry.estimated_kwh is None:
        kwh, co2e = _calc_eco(entry.activity_type, entry.quantity)
        entry.estimated_kwh = kwh
        entry.estimated_co2e_kg = co2e
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.delete("/usage/entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int, session: Session = Depends(get_session)):
    e = session.get(UsageEntry, entry_id)
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    session.delete(e)
    session.commit()
