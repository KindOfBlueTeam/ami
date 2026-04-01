# Ami

**A local-first AI subscription tracker for people, not enterprises.**

Ami helps you track what you spend on consumer AI services, how much you actually use them, and their estimated environmental footprint — all stored on your own machine with no accounts, no cloud sync, and no external API calls required.

---

## What Ami is

- A personal finance tool for your AI subscriptions (ChatGPT, Claude, MidJourney, Suno, etc.)
- Local-first: your data never leaves your device
- Single-user, no authentication
- A deterministic recommendation engine — no LLM logic, no black boxes

## What Ami is not

- A tracker for API platform usage (OpenAI API, Anthropic API, etc.) — V1 is consumer subscriptions only
- A cloud service or SaaS product
- Connected to any billing system or AI provider

---

## Features

- **Onboarding wizard** — conversational multi-step flow that pre-fills known plan pricing and asks you to confirm or correct it
- **Dashboard** — monthly spend, yearly estimate, next renewal, CO₂e estimate, overlap warnings
- **Services** — full CRUD for your subscriptions with plan catalog and price verification
- **Usage tracking** — log messages, images, audio, and other activity with automatic eco estimates
- **Recommendations** — deterministic rules: annual billing savings, overlap detection, downgrade opportunities, eco footprint alerts
- **Settings** — eco priority, optimization style, grid carbon intensity

---

## Supported services (V1 catalog)

| Service | Plans |
|---|---|
| ChatGPT | Free, Plus, Pro, Business |
| Claude | Free, Pro, Max 5x, Max 20x, Team Standard, Team Premium |
| MidJourney | Basic, Standard, Pro, Mega |
| Suno | Free, Pro, Premier |
| Gemini | Free, Advanced |
| Perplexity | Free, Pro |
| Adobe Firefly | Free, Premium |
| Udio | Free, Standard, Pro |
| GitHub Copilot | Free, Individual, Business |
| Cursor | Hobby, Pro, Business |

---

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Python · FastAPI · SQLModel · SQLite · Uvicorn |
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| Runtime | Local only · bound to 127.0.0.1 |

---

## Requirements

- Python 3.9+
- Node.js 18+
- pip

---

## Running locally

### Option A — Frontend only (no backend needed)

Uses an in-memory mock with realistic seed data. Good for exploring the UI.

```bash
cd frontend
echo "VITE_USE_MOCK=true" > .env.local
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

> State resets on page refresh in mock mode.

---

### Option B — Full stack (backend + frontend)

**Terminal 1 — Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python3 seed.py                 # initialize DB and seed provider/plan catalog
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

API is available at **http://127.0.0.1:8000**
Interactive API docs at **http://127.0.0.1:8000/docs**

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

---

### Option C — Production mode (single process)

Builds the frontend and serves it from the FastAPI backend.

```bash
cd frontend && npm install && npm run build
cd ../backend
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

Open **http://127.0.0.1:8000**

---

## Seed script

```bash
cd backend
source .venv/bin/activate

python3 seed.py                  # providers + plan catalog only (recommended)
python3 seed.py --with-subs      # also add 4 sample subscriptions
python3 seed.py --reset          # clear all data and re-seed
```

> **Note:** If you run `--with-subs` and then complete onboarding, you will end up with duplicate subscriptions. Use `--with-subs` only for UI testing before running onboarding.

---

## Database

SQLite file at `backend/ami.db`. To start fresh:

```bash
rm backend/ami.db
cd backend && python3 seed.py
```

---

## Project structure

```
ami/
├── backend/
│   ├── main.py                   # FastAPI app, CORS, static file serving
│   ├── database.py               # SQLite engine + session factory
│   ├── models.py                 # SQLModel table definitions and schemas
│   ├── recommendation_engine.py  # Deterministic recommendation rules
│   ├── seed.py                   # Provider/plan catalog seed data
│   ├── requirements.txt
│   └── routers/
│       ├── providers.py          # GET /api/providers, /api/providers/{id}/plans
│       ├── plan_allowances.py    # Plan quota data
│       ├── subscriptions.py      # CRUD /api/subscriptions
│       ├── usage.py              # Usage periods and entries
│       ├── recommendations.py    # List, generate, dismiss
│       ├── settings.py           # App settings key/value store
│       ├── onboarding.py         # Onboarding status and completion
│       └── dashboard.py          # GET /api/dashboard summary
└── frontend/
    ├── index.html
    ├── vite.config.ts            # Dev proxy: /api → 127.0.0.1:8000
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── api/
        │   ├── client.ts         # Switches between real and mock based on VITE_USE_MOCK
        │   ├── real.ts           # Axios client wired to FastAPI
        │   └── mock.ts           # In-memory mock for frontend-only dev
        ├── types/index.ts        # Shared TypeScript types
        ├── components/
        │   ├── Layout.tsx
        │   ├── NavBar.tsx
        │   ├── StatCard.tsx
        │   ├── ServiceCard.tsx
        │   └── RecommendationCard.tsx
        └── pages/
            ├── Onboarding.tsx    # Conversational setup wizard
            ├── Dashboard.tsx     # Spend + eco overview
            ├── Services.tsx      # Subscription management
            ├── Usage.tsx         # Activity log
            ├── Recommendations.tsx
            └── Settings.tsx
```

---

## Recommendation engine

Rules are deterministic — no LLM calls, no external requests.

| Type | Trigger |
|---|---|
| `annual` | Monthly billing + annual plan available → show potential savings |
| `cancel` | Perceived value = low → suggest cancelling |
| `downgrade` | Light usage + free tier available → suggest downgrading |
| `overlap` | 2+ chat, coding, or writing subscriptions → flag redundancy |
| `eco` | Heavy usage + high eco priority setting → suggest reducing use |
| `keep` | High value + moderate or heavy usage → confirm no changes needed |

Ami cannot see your actual usage against plan limits — consumer AI apps do not provide public billing or usage APIs. All recommendations are based on data you enter.

---

## Environmental estimates

CO₂e figures are rough approximations based on published research, not precise measurements. They are intended to give a directional sense of footprint, not an audit-grade number.

| Activity | Estimate used |
|---|---|
| Chat message | ~0.003 kWh |
| Image generation | ~0.020 kWh |
| Audio (per minute) | ~0.005 kWh |
| Grid carbon intensity | 0.386 kg CO₂e/kWh (US average, EPA 2023) |

The carbon intensity figure is configurable in Settings.

---

## Scope — V1

**In scope**
- Consumer AI subscriptions billed monthly or annually
- Single user, local machine only

**Out of scope**
- OpenAI API / Anthropic API / other developer API billing
- Team or enterprise seat management
- Cloud hosting or remote access
- Automatic billing import (no consumer AI app offers a public billing API)
- Multi-currency (USD only in V1)
