"""
Ami database migration runner.

Tracks applied migrations in the `schema_migrations` table and applies
any pending .sql files from app/migrations/ in filename order.

Safe to run repeatedly — already-applied migrations are skipped.

Usage:
    cd ami/backend
    python -m app.migrate
"""
import sqlite3
import sys
from pathlib import Path

# Ensure the backend directory is importable regardless of how this is invoked
_BACKEND_DIR = Path(__file__).parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from database import DB_PATH  # noqa: E402 (after sys.path fixup)

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def _ensure_tracking_table(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL UNIQUE,
            applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()


def _applied_migrations(conn: sqlite3.Connection) -> set[str]:
    rows = conn.execute("SELECT name FROM schema_migrations").fetchall()
    return {row[0] for row in rows}


def _statements(sql: str) -> list[str]:
    """Split a SQL file into individual statements, stripping comment lines first."""
    # Strip -- comment lines before splitting so semicolons inside comments
    # don't confuse the splitter.
    clean_lines = [
        line for line in sql.splitlines()
        if not line.strip().startswith("--")
    ]
    cleaned = "\n".join(clean_lines)
    return [s.strip() for s in cleaned.split(";") if s.strip()]


def run() -> None:
    """Apply all pending migrations. Safe to call repeatedly."""
    if not MIGRATIONS_DIR.exists():
        print("  [migrate] No migrations directory found — skipping.")
        return

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        print("  [migrate] No migration files found — skipping.")
        return

    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_tracking_table(conn)
        already_applied = _applied_migrations(conn)
        applied_count = 0

        for mf in migration_files:
            if mf.name in already_applied:
                continue

            statements = _statements(mf.read_text())
            migration_ok = True

            for stmt in statements:
                try:
                    conn.execute(stmt)
                except sqlite3.OperationalError as exc:
                    msg = str(exc).lower()
                    if "duplicate column name" in msg:
                        # Column already exists (e.g. added by create_all on a
                        # fresh DB before migrations ran) — treat as done.
                        continue
                    # Unexpected error: roll back this migration and report.
                    conn.rollback()
                    print(f"  [migrate] ERROR in {mf.name}: {exc}")
                    migration_ok = False
                    break

            if migration_ok:
                conn.execute(
                    "INSERT INTO schema_migrations (name) VALUES (?)", (mf.name,)
                )
                conn.commit()
                print(f"  [migrate] Applied: {mf.name}")
                applied_count += 1

        pending = [mf for mf in migration_files if mf.name not in already_applied]
        if applied_count == 0 and not pending:
            print("  [migrate] All migrations already applied.")
        elif applied_count == 0:
            print("  [migrate] No migrations applied (check errors above).")
        else:
            print(f"  [migrate] {applied_count} migration(s) applied.")
    finally:
        conn.close()


if __name__ == "__main__":
    print("Running Ami database migrations…")
    run()
    print("Done.")
