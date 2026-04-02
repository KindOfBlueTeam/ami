#!/usr/bin/env bash
set -e

# ─────────────────────────────────────────────
#  Ami — Run Script
#  Starts the Ami server and opens your browser.
#  Press Ctrl+C to stop.
# ─────────────────────────────────────────────

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
RESET="\033[0m"

ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
info() { echo -e "  ${BOLD}→${RESET}  $1"; }
fail() { echo -e "\n  ${RED}✗  Error:${RESET} $1\n"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

AMI_URL="http://127.0.0.1:8000"

# ── Pre-flight checks ──────────────────────────────────────────────────────────

if [ ! -d "backend/.venv" ]; then
  fail "Ami is not installed yet.\n     Run ${BOLD}./install-ami.sh${RESET} first."
fi

if [ ! -d "frontend/dist" ]; then
  fail "Frontend has not been built.\n     Run ${BOLD}./install-ami.sh${RESET} first."
fi

# ── Open browser after a short delay ──────────────────────────────────────────

open_browser() {
  sleep 1.5
  if command -v open &>/dev/null; then
    open "$AMI_URL"          # macOS
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$AMI_URL"      # Linux
  fi
}

# ── Shutdown handler ───────────────────────────────────────────────────────────

cleanup() {
  echo ""
  echo -e "  ${BOLD}Ami has stopped.${RESET}"
  echo ""
  exit 0
}
trap cleanup INT TERM

# ── Start ──────────────────────────────────────────────────────────────────────

echo ""
echo -e "  ${BOLD}Starting Ami…${RESET}"
echo ""
ok "Backend ready"
ok "Frontend served from backend"
echo ""
echo -e "  ${GREEN}${BOLD}Ami is running at ${AMI_URL}${RESET}"
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop."
echo ""

open_browser &

source backend/.venv/bin/activate
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --log-level warning
