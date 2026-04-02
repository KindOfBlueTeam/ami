"""
Combined seed entry point — runs providers then plans in dependency order.

Usage:
    cd ami/backend
    python -m app.seed
"""
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.seed_providers import seed_providers  # noqa: E402
from app.seed_plans import seed_plans          # noqa: E402


def main() -> None:
    print("── Seeding providers ──")
    seed_providers()
    print("── Seeding plans ──")
    seed_plans()
    print("── Done ──")


if __name__ == "__main__":
    main()
