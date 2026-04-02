#!/usr/bin/env bash

# ─────────────────────────────────────────────
#  Ami — Reset Script
#  Removes all installed files and local data.
#  Run install-ami.sh again to start fresh.
# ─────────────────────────────────────────────

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
warn() { echo -e "  ${YELLOW}!${RESET}  $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "  ${BOLD}${RED}Resetting Ami…${RESET}"
echo ""
warn "This will delete your local database and all Ami data."
echo ""
printf "  Are you sure? (y/N) "
read -r CONFIRM
echo ""

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo -e "  Cancelled. Nothing was changed."
  echo ""
  exit 0
fi

# ── Remove installed files ─────────────────────────────────────────────────────

if [ -d "backend/.venv" ]; then
  rm -rf backend/.venv
  ok "Removed backend/.venv"
fi

if [ -d "frontend/node_modules" ]; then
  rm -rf frontend/node_modules
  ok "Removed frontend/node_modules"
fi

if [ -d "frontend/dist" ]; then
  rm -rf frontend/dist
  ok "Removed frontend/dist"
fi

if [ -f "backend/ami.db" ]; then
  rm -f backend/ami.db
  ok "Removed backend/ami.db (all data deleted)"
fi

# ── Done ───────────────────────────────────────────────────────────────────────

echo ""
echo -e "  ${BOLD}Ami has been reset.${RESET}"
echo -e "  Run ${BOLD}./install-ami.sh${RESET} to install again."
echo ""
