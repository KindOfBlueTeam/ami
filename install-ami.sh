#!/usr/bin/env bash
set -e

# ─────────────────────────────────────────────
#  Ami — Install Script
#  Installs dependencies and builds the app.
#  Run once. After this, use ./run-ami.sh
# ─────────────────────────────────────────────

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

ok()   { echo -e "  ${GREEN}✓${RESET}  $1"; }
info() { echo -e "  ${BOLD}→${RESET}  $1"; }
fail() { echo -e "\n  ${RED}✗  Error:${RESET} $1\n"; exit 1; }
warn() { echo -e "  ${YELLOW}!${RESET}  $1"; }

# Locate the project root (directory this script lives in)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}  Installing Ami…${RESET}"
echo ""

# ── 1. Check dependencies ──────────────────────────────────────────────────────

info "Checking dependencies…"

# Python 3.10+
if ! command -v python3 &>/dev/null; then
  fail "python3 is not installed.\n     Download it at https://www.python.org/downloads/"
fi
PY_VER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]; }; then
  fail "Python 3.10 or newer is required (you have $PY_VER).\n     Download it at https://www.python.org/downloads/"
fi
ok "Python $PY_VER"

# pip
if ! python3 -m pip --version &>/dev/null; then
  fail "pip is not available.\n     Try: python3 -m ensurepip --upgrade"
fi
ok "pip"

# Node 18+
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed.\n     Download it at https://nodejs.org"
fi
NODE_VER=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js 18 or newer is required (you have $NODE_VER).\n     Download it at https://nodejs.org"
fi
ok "Node $NODE_VER"

# npm
if ! command -v npm &>/dev/null; then
  fail "npm is not installed. It normally comes with Node.js.\n     Download Node at https://nodejs.org"
fi
ok "npm"

echo ""

# ── 2. Python virtual environment ─────────────────────────────────────────────

info "Creating Python virtual environment…"
python3 -m venv backend/.venv
ok "Virtual environment created at backend/.venv"

# ── 3. Backend dependencies ────────────────────────────────────────────────────

info "Installing backend dependencies…"
backend/.venv/bin/pip install --quiet --upgrade pip
backend/.venv/bin/pip install --quiet -r backend/requirements.txt
ok "Backend dependencies installed"

# ── 4. Initialize database ────────────────────────────────────────────────────

info "Initializing database and seeding service catalog…"
cd backend
.venv/bin/python seed.py
cd ..
ok "Database initialized"

# ── 5. Frontend dependencies ───────────────────────────────────────────────────

info "Installing frontend dependencies…"
npm install --prefix frontend --silent
ok "Frontend dependencies installed"

# ── 6. Build frontend ──────────────────────────────────────────────────────────

info "Building frontend…"
npm run build --prefix frontend --silent
ok "Frontend built"

# ── Done ───────────────────────────────────────────────────────────────────────

echo ""
echo -e "  ${GREEN}${BOLD}Ami is installed.${RESET}"
echo -e "  Run ${BOLD}./run-ami.sh${RESET} to start."
echo ""
