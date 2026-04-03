# Ami

**A local-first AI subscription tracker — for people, not enterprises.**

Ami helps you see what you're spending on AI services, how much you actually use them, and their estimated environmental footprint. Everything is stored in a local SQLite file on your own machine. No accounts, no cloud, no data leaving your device.

<img width="1272" height="743" alt="Ami-Dashboard" src="https://github.com/user-attachments/assets/da6167c3-cc16-4e1c-a98d-8e9f329f6b1c" />

---

## Quick start

```bash
git clone https://github.com/KindOfBlueTeam/ami.git
cd ami
./install-ami.sh   # installs everything and seeds the service catalog (~1 min)
./run-ami.sh       # starts Ami and opens it in your browser
```

That's it. Ami opens at **http://127.0.0.1:8000**.

To stop Ami, press `Ctrl+C` in the terminal.

## Screenshots
<img width="856" height="515" alt="Ami-ServiceCard" src="https://github.com/user-attachments/assets/c8c9a427-de83-4bf3-871c-b7498aa85c6a" />

<img width="895" height="453" alt="Ami-Recomendations 1" src="https://github.com/user-attachments/assets/fddabaaa-386e-4753-8aa1-0b96e301b389" />

<img width="922" height="465" alt="Ami-Recomendations 2" src="https://github.com/user-attachments/assets/d119097e-b1ed-42a6-a27b-18ead588a873" />

<img width="868" height="459" alt="Ami-Settings" src="https://github.com/user-attachments/assets/3b5a28e8-af0e-4404-893d-e4f37115dd95" />




---

## Requirements

| Requirement | Minimum version | Download |
|---|---|---|
| Python | 3.10 | https://www.python.org/downloads/ |
| Node.js | 18 | https://nodejs.org |

`pip` and `npm` are included with Python and Node.js respectively.

> **macOS tip:** if `python3` is not found, install it via [python.org](https://www.python.org/downloads/) or Homebrew (`brew install python`). The macOS system Python is too old.


---

## What `install-ami.sh` does

Run once after cloning. It will:

1. Check that Python 3.10+ and Node 18+ are installed
2. Create a Python virtual environment at `backend/.venv`
3. Install Python dependencies from `backend/requirements.txt`
4. Initialize the SQLite database and seed the service catalog (17 providers, 80+ plans)
5. Install frontend Node.js dependencies
6. Build the frontend

If any step fails, the script exits with a clear error message telling you what to fix.

---

## What `run-ami.sh` does

Run every time you want to use Ami:

- Verifies that `install-ami.sh` has been run
- Starts the FastAPI backend (serves both the API and the built frontend)
- Opens **http://127.0.0.1:8000** in your browser automatically
- Press `Ctrl+C` to stop


---

## Resetting Ami

```bash
./reset-ami.sh
```

Interactively confirms before deleting anything. Removes:
- `backend/.venv` (Python environment)
- `frontend/node_modules`
- `frontend/dist` (built frontend)
- `backend/ami.db` (**all your data**)

After resetting, run `./install-ami.sh` again to start fresh.


---

## Explore without a backend (mock mode)

If you just want to explore the UI without setting up a backend, the frontend can run against an in-memory mock with realistic sample data:

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and set: VITE_USE_MOCK=true
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

> Data resets on every page refresh in mock mode. This mode is for UI exploration only — nothing is saved.

---

## What Ami is

- Track every AI subscription you have, what it costs, when it renews, and how you feel about its value
- See your total monthly and annual AI spend at a glance
- Get deterministic recommendations: switch to annual billing, cancel unused services, flag overlapping subscriptions
- View your estimated ecological footprint (energy, CO₂, water) across all your AI services, with real-world "In Perspective" comparisons
- Toggle between 🇬🇧 Metric and 🇺🇸 Imperial units throughout

## What Ami is not

- A tracker for developer API usage (OpenAI API, Anthropic API, etc.) — V1 covers consumer subscriptions only
- A cloud service — everything runs on your machine
- Connected to any billing system — there are no public billing APIs for consumer AI apps, so you enter data manually

---

## Supported services

### 💬 Chat & assistants

| Service | Plans |
|---|---|
| ChatGPT | Free · Plus · Pro · Business |
| Claude | Free · Pro · Max 5x · Max 20x · Team Standard · Team Premium |
| Gemini | Free · Advanced |
| Perplexity | Free · Pro |

### 💻 Coding

| Service | Plans |
|---|---|
| Cursor | Hobby · Pro · Business |
| GitHub Copilot | Free · Individual · Business |
| Replit | Free · Core · Teams |

### 🎨 Image generation

| Service | Plans |
|---|---|
| Adobe Firefly | Free · Premium |
| Leonardo AI | Free · Apprentice · Artisan · Maestro |
| MidJourney | Basic · Standard · Pro · Mega |
| Stability AI | Free · Pay-as-you-go |

### 🎬 Video generation

| Service | Plans |
|---|---|
| Luma AI | Free · Standard · Pro |
| Pika | Free · Basic · Pro |
| Runway | Basic · Standard · Pro · Unlimited |

### 🎵 Audio generation

| Service | Plans |
|---|---|
| ElevenLabs | Free · Starter · Creator · Pro |
| Suno | Free · Pro · Premier |
| Udio | Free · Standard · Pro |

---

## Recommendations

Ami's recommendation engine is fully deterministic — no LLM calls, no external requests.

| Type | When it fires |
|---|---|
| `annual` | You're billed monthly and an annual plan would save you money |
| `cancel` | You rated this service low value |
| `downgrade` | Light usage and a free or cheaper tier exists |
| `overlap` | You have 2+ subscriptions in the same category (chat, coding, image) |
| `eco` | Heavy usage and you've set eco as a high priority |
| `keep` | High value and moderate or heavy usage — no action recommended |

---

## Ecological estimates

CO₂e, energy, and water figures are rough order-of-magnitude estimates based on published research. They are meant to give directional context, not audit-grade measurements.

| Factor | Value used |
|---|---|
| Energy per chat message | ~0.003 kWh |
| Energy per image generated | ~0.020 kWh |
| Energy per minute of audio | ~0.005 kWh |
| Cooling water per kWh | ~1.8 L |
| Grid carbon intensity | 0.386 kg CO₂e/kWh (US average, EPA 2023) |

The carbon intensity figure is adjustable in Settings.

---

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Python 3.10+ · FastAPI · SQLModel · SQLite · Uvicorn |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Data | Local SQLite file at `backend/ami.db` |
| Runtime | Local only · bound to 127.0.0.1 |

---

## Manual setup (for developers)

If you prefer to run the backend and frontend separately (e.g. for hot-reload development):

**Terminal 1 — Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                     # initialize DB and seed service catalog
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

API: **http://127.0.0.1:8000**
Interactive API docs: **http://127.0.0.1:8000/docs**

**Terminal 2 — Frontend (dev server with hot reload)**

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://127.0.0.1:5173**

> In dev mode, the Vite dev server proxies all `/api` requests to the backend at port 8000. Both must be running at the same time.

**Re-seed the service catalog (after updating catalog data)**

```bash
cd backend
source .venv/bin/activate
python seed.py
```

**Start fresh**

```bash
rm backend/ami.db
cd backend && python seed.py
```

---

## Project structure

```
ami/
├── install-ami.sh             # One-time installer
├── run-ami.sh                 # Start Ami
├── reset-ami.sh               # Wipe everything and start over
│
├── backend/
│   ├── main.py                # FastAPI app entry point
│   ├── database.py            # SQLite engine, migrations, default user setup
│   ├── models.py              # SQLModel table and schema definitions
│   ├── seed.py                # Seed providers, plans, and sample data
│   ├── recommendation_engine.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── migrate.py         # SQL file migration runner
│   │   ├── migrations/        # Numbered .sql schema migrations
│   │   ├── provider_catalog.py
│   │   ├── seed_providers.py  # Idempotent provider upsert (slug-based)
│   │   └── seed_plans.py      # Idempotent plan upsert
│   └── routers/
│       ├── providers.py
│       ├── subscriptions.py
│       ├── recommendations.py
│       ├── settings.py
│       ├── onboarding.py
│       ├── dashboard.py
│       └── users.py
│
└── frontend/
    ├── index.html
    ├── vite.config.ts         # Dev proxy: /api → 127.0.0.1:8000
    ├── .env.example           # Copy to .env.local for mock mode
    └── src/
        ├── api/
        │   ├── client.ts      # Switches between real and mock
        │   ├── real.ts        # Axios client → FastAPI
        │   └── mock.ts        # In-memory mock for UI exploration
        ├── contexts/
        │   └── UnitSystemContext.tsx
        ├── utils/
        │   ├── ecoMetrics.ts
        │   └── ecoReferences.ts  # "In Perspective" comparisons
        ├── components/
        │   ├── NavBar.tsx
        │   ├── ServiceCard.tsx
        │   ├── UnitSystemToggle.tsx
        │   └── eco/           # PowerImpactTile, Co2ImpactTile, WaterImpactTile, …
        └── pages/
            ├── Onboarding.tsx
            ├── Dashboard.tsx
            ├── Services.tsx
            ├── Recommendations.tsx
            └── Settings.tsx
```

---

## Scope

**In scope for V1**
- Consumer AI subscriptions billed monthly or annually
- Single user, local machine

**Out of scope**
- Developer API billing (OpenAI API, Anthropic API, etc.)
- Team / enterprise seat management
- Cloud hosting or multi-device sync
- Automatic billing import
- Multi-currency (USD only in V1)
