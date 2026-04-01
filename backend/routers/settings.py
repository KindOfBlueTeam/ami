from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import AppSetting

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=dict[str, str])
def get_settings(session: Session = Depends(get_session)):
    rows = session.exec(select(AppSetting)).all()
    return {r.key: r.value for r in rows}


@router.put("/settings", response_model=dict[str, str])
def update_settings(data: dict[str, str], session: Session = Depends(get_session)):
    for key, value in data.items():
        existing = session.exec(
            select(AppSetting).where(AppSetting.key == key)
        ).first()
        if existing:
            existing.value = value
            session.add(existing)
        else:
            session.add(AppSetting(key=key, value=value))
    session.commit()
    rows = session.exec(select(AppSetting)).all()
    return {r.key: r.value for r in rows}
