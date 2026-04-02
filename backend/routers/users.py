import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_active_user_id, get_session
from models import User, UserCreate, UserRead

logger = logging.getLogger(__name__)

router = APIRouter(tags=["users"])


@router.get("/users", response_model=list[UserRead])
def list_users(session: Session = Depends(get_session)):
    return session.exec(select(User).order_by(User.created_at)).all()


@router.post("/users", response_model=UserRead, status_code=201)
def create_user(data: UserCreate, session: Session = Depends(get_session)):
    user = User(name=data.name, is_active=False, onboarding_complete=False)
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"Created user id={user.id} name={user.name!r}")
    return user


@router.get("/users/active", response_model=UserRead)
def get_active_user(session: Session = Depends(get_session)):
    user_id = get_active_user_id(session)
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="No active user found")
    return user


@router.post("/users/{user_id}/activate", response_model=UserRead)
def activate_user(user_id: int, session: Session = Depends(get_session)):
    """Switch the active local profile."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Deactivate all others
    all_users = session.exec(select(User)).all()
    for u in all_users:
        if u.id != user_id and u.is_active:
            u.is_active = False
            session.add(u)

    user.is_active = True
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"Switched active user to id={user_id} name={user.name!r}")
    return user


@router.put("/users/{user_id}", response_model=UserRead)
def rename_user(user_id: int, data: UserCreate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.name = data.name
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/users/me/delete", response_model=dict)
def delete_current_user(session: Session = Depends(get_session)):
    """
    Delete the active user and all their data.

    - If other users exist: activates the next user, deletes the current one.
      Returns { deleted: true, new_active_user_id: <id> }.
    - If this is the only user: clears all their data and resets onboarding
      without deleting the user record (there must always be one user).
      Returns { deleted: false, reset: true, new_active_user_id: <id> }.
    """
    from models import Recommendation, Subscription

    active_user_id = get_active_user_id(session)
    all_users = session.exec(select(User).order_by(User.created_at)).all()
    others = [u for u in all_users if u.id != active_user_id]

    # Delete all subscriptions and recommendations belonging to this user
    recs = session.exec(
        select(Recommendation).where(Recommendation.user_id == active_user_id)
    ).all()
    for rec in recs:
        session.delete(rec)

    subs = session.exec(
        select(Subscription).where(Subscription.user_id == active_user_id)
    ).all()
    for sub in subs:
        session.delete(sub)

    if others:
        # Activate the first other user and delete this one
        new_active = others[0]
        for u in all_users:
            u.is_active = (u.id == new_active.id)
            session.add(u)

        active_user = session.get(User, active_user_id)
        if active_user:
            session.delete(active_user)
        session.commit()
        logger.info(f"Deleted user id={active_user_id}, switched to id={new_active.id}")
        return {"deleted": True, "new_active_user_id": new_active.id}
    else:
        # Only user — reset instead of delete so there's always at least one user
        user = session.get(User, active_user_id)
        if user:
            user.onboarding_complete = False
            session.add(user)
        from models import AppSetting
        ob_row = session.exec(
            select(AppSetting).where(AppSetting.key == "onboarding_complete")
        ).first()
        if ob_row:
            ob_row.value = "false"
            session.add(ob_row)
        session.commit()
        logger.info(f"Reset only user id={active_user_id} (no delete)")
        return {"deleted": False, "reset": True, "new_active_user_id": active_user_id}


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    active_user_id = get_active_user_id(session)
    if user_id == active_user_id:
        raise HTTPException(status_code=400, detail="Cannot delete the active user")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete all data belonging to this user
    from models import Recommendation, Subscription
    recs = session.exec(
        select(Recommendation).where(Recommendation.user_id == user_id)
    ).all()
    for rec in recs:
        session.delete(rec)

    subs = session.exec(
        select(Subscription).where(Subscription.user_id == user_id)
    ).all()
    for sub in subs:
        session.delete(sub)

    session.delete(user)
    session.commit()
    logger.info(f"Deleted user id={user_id}")
