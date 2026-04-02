import logging
import sqlite3
from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine, select

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent / "ami.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def _column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    cursor = conn.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def _table_exists(conn: sqlite3.Connection, table: str) -> bool:
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    )
    return cursor.fetchone() is not None


def run_migrations():
    """
    Apply safe ALTER TABLE migrations for new columns added after initial schema.
    Must be called after create_db_and_tables() so all tables exist.
    """
    conn = sqlite3.connect(DB_PATH)
    try:
        # subscriptions.user_id
        if _table_exists(conn, "subscriptions") and not _column_exists(conn, "subscriptions", "user_id"):
            conn.execute("ALTER TABLE subscriptions ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.info("Migration: added subscriptions.user_id")

        # recommendations.user_id
        if _table_exists(conn, "recommendations") and not _column_exists(conn, "recommendations", "user_id"):
            conn.execute("ALTER TABLE recommendations ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.info("Migration: added recommendations.user_id")

        # recommendations.priority_score
        if _table_exists(conn, "recommendations") and not _column_exists(conn, "recommendations", "priority_score"):
            conn.execute("ALTER TABLE recommendations ADD COLUMN priority_score INTEGER NOT NULL DEFAULT 2")
            # Back-fill based on existing priority strings
            conn.execute("""
                UPDATE recommendations SET priority_score = CASE
                    WHEN priority = 'high' THEN 3
                    WHEN priority = 'medium' THEN 2
                    ELSE 1
                END
            """)
            logger.info("Migration: added recommendations.priority_score")

        # users.onboarding_complete (in case table was created before this column)
        if _table_exists(conn, "users") and not _column_exists(conn, "users", "onboarding_complete"):
            conn.execute("ALTER TABLE users ADD COLUMN onboarding_complete INTEGER NOT NULL DEFAULT 0")
            logger.info("Migration: added users.onboarding_complete")

        conn.commit()
    finally:
        conn.close()


def ensure_default_user():
    """
    Create the default local user if none exists, and migrate any unscoped
    data (user_id IS NULL) to belong to that user.
    """
    from models import User, AppSetting  # avoid circular import at module level

    with Session(engine) as session:
        existing = session.exec(select(User)).first()
        if not existing:
            default_user = User(name="Default", is_active=True, onboarding_complete=False)
            session.add(default_user)
            session.commit()
            session.refresh(default_user)
            user_id = default_user.id
            logger.info(f"Created default user id={user_id}")
        else:
            # Ensure exactly one user is active
            users = session.exec(select(User)).all()
            active = [u for u in users if u.is_active]
            if not active:
                users[0].is_active = True
                session.add(users[0])
                session.commit()
                session.refresh(users[0])
            user_id = next(u.id for u in users if u.is_active)

        # Migrate onboarding_complete from app_settings to active user
        ob_setting = session.exec(
            select(AppSetting).where(AppSetting.key == "onboarding_complete")
        ).first()
        if ob_setting:
            user = session.get(User, user_id)
            if user and not user.onboarding_complete:
                user.onboarding_complete = ob_setting.value == "true"
                session.add(user)
                session.commit()

    # Migrate null user_id rows to default user via raw SQL
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("UPDATE subscriptions SET user_id = ? WHERE user_id IS NULL", (user_id,))
        conn.execute("UPDATE recommendations SET user_id = ? WHERE user_id IS NULL", (user_id,))
        conn.commit()
        logger.info(f"Migrated unscoped rows to user_id={user_id}")
    finally:
        conn.close()


def get_active_user_id(session: Session) -> int:
    """Return the active user's id. Falls back to 1 if no active user found."""
    from models import User
    user = session.exec(select(User).where(User.is_active == True)).first()  # noqa: E712
    return user.id if user else 1


def get_session():
    with Session(engine) as session:
        yield session
