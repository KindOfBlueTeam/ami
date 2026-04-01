from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import PlanAllowance, PlanAllowanceCreate, PlanAllowanceRead, Plan

router = APIRouter(tags=["plan_allowances"])


@router.get("/plans/{plan_id}/allowances", response_model=list[PlanAllowanceRead])
def list_allowances(plan_id: int, session: Session = Depends(get_session)):
    plan = session.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return session.exec(
        select(PlanAllowance).where(PlanAllowance.plan_id == plan_id)
    ).all()


@router.post("/plans/{plan_id}/allowances", response_model=PlanAllowanceRead, status_code=201)
def create_allowance(
    plan_id: int,
    data: PlanAllowanceCreate,
    session: Session = Depends(get_session),
):
    plan = session.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    allowance = PlanAllowance(**data.model_dump())
    session.add(allowance)
    session.commit()
    session.refresh(allowance)
    return allowance


@router.delete("/plan_allowances/{allowance_id}", status_code=204)
def delete_allowance(allowance_id: int, session: Session = Depends(get_session)):
    a = session.get(PlanAllowance, allowance_id)
    if not a:
        raise HTTPException(status_code=404, detail="Allowance not found")
    session.delete(a)
    session.commit()
