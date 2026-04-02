import logging

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import AppSetting, SettingsRead, SettingsUpdate

logger = logging.getLogger(__name__)

router = APIRouter(tags=["settings"])

SETTINGS_KEYS = {"eco_priority", "optimization_style", "eco_tradeoff", "carbon_intensity_kwh", "currency"}


def _rows_to_dict(session: Session) -> dict[str, str]:
    rows = session.exec(select(AppSetting)).all()
    return {r.key: r.value for r in rows}


def _upsert(session: Session, key: str, value: str):
    row = session.exec(select(AppSetting).where(AppSetting.key == key)).first()
    if row:
        row.value = value
        session.add(row)
    else:
        session.add(AppSetting(key=key, value=value))


@router.get("/settings", response_model=SettingsRead)
def get_settings(session: Session = Depends(get_session)):
    data = _rows_to_dict(session)
    return SettingsRead(
        eco_priority=data.get("eco_priority", "medium"),
        optimization_style=data.get("optimization_style", "balanced"),
        eco_tradeoff=data.get("eco_tradeoff", "maybe"),
        carbon_intensity_kwh=data.get("carbon_intensity_kwh", "0.386"),
        currency=data.get("currency", "USD"),
    )


@router.put("/settings", response_model=SettingsRead)
def update_settings(data: SettingsUpdate, session: Session = Depends(get_session)):
    update = data.model_dump(exclude_unset=True)
    for key, value in update.items():
        v = value.value if hasattr(value, "value") else str(value)
        _upsert(session, key, v)
        logger.info(f"Setting updated: {key}={v}")
    session.commit()
    return get_settings(session)
