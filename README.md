# Ami

**A local-first AI subscription tracker for people, not enterprises.**

Ami helps you track what you spend on consumer AI services, how much you actually use them, and their estimated environmental footprint — all stored on your own machine with no accounts, no cloud sync, and no external API calls required.

---

## What Ami is

- A personal finance tool for your AI subscriptions
- Local-first: your data never leaves your device
- Single-user, no authentication required
- A deterministic recommendation engine — no LLM logic, no black boxes
- 🇬🇧 Metric and 🇺🇸 Imperial unit support throughout

## What Ami is not

- A tracker for API platform usage (OpenAI API, Anthropic API, etc.) — V1 is consumer subscriptions only
- A cloud service or SaaS product
- Connected to any billing system or AI provider

---

## Features

- **Onboarding wizard** — conversational multi-step flow that pre-fills known plan pricing and asks you to confirm or correct it
- **Dashboard** — monthly spend, yearly estimate, next renewal, ecological impact (energy, CO₂, water), and real-world "In Perspective" equivalences
- **Services** — full CRUD for your subscriptions with plan catalog and price verification
- **Recommendations** — deterministic rules: annual billing savings, overlap detection, downgrade opportunities, eco footprint alerts
- **Settings** — eco priority, optimization style, grid carbon intensity
- **Units** — toggle between 🇬🇧 Metric and 🇺🇸 Imperial across all ecological displays

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
| Stability AI | Free · Starter · Pro · Max |

### 🎬 Video generation

| Service | Plans |
|---|---|
| Luma AI | Free · Plus · Pro · Premier |
| Pika | Free · Basic · Pro · Unlimited |
| Runway | Free · Standard · Pro · Unlimited |

### 🎵 Audio generation

| Service | Plans |
|---|---|
| ElevenLabs | Free · Starter · Creator · Pro · Scale |
| Suno | Free · Pro · Premier |
| Udio | Free · Standard · Pro |

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

API available at **http://127.0.0.1:8000**
Interactive docs at **http://127.0.0.1:8000/docs**

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
│   ├── seed.py                   # Orchestrates provider + plan seeding
│   ├── requirements.txt
│   ├── app/
│   │   ├── migrate.py            # SQL migration runner (schema_migrations table)
│   │   ├── migrations/           # Numbered .sql migration files
│   │   ├── provider_catalog.py   # Canonical provider definitions
│   │   ├── seed_providers.py     # Idempotent provider upsert (slug-keyed)
│   │   └── seed_plans.py         # Idempotent plan upsert (slug + billing_interval)
│   └── routers/
│       ├── providers.py          # GET /api/providers, /api/providers/{id}/plans
│       ├── subscriptions.py      # CRUD /api/subscriptions
│       ├── recommendations.py    # List, generate, dismiss
│       ├── settings.py           # App settings
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
        ├── contexts/             # UnitSystemContext (metric / imperial)
        ├── utils/
        │   ├── ecoMetrics.ts     # kWh, CO₂, water conversion helpers
        │   └── ecoReferences.ts  # "In Perspective" tile generators
        ├── components/
        │   ├── NavBar.tsx
        │   ├── ServiceCard.tsx
        │   ├── UnitSystemToggle.tsx
        │   └── eco/              # PowerImpactTile, Co2ImpactTile, WaterImpactTile, InPerspective, …
        └── pages/
            ├── Onboarding.tsx    # Conversational setup wizard
            ├── Dashboard.tsx     # Spend + eco overview
            ├── Services.tsx      # Subscription management
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
| `overlap` | 2+ chat, coding, or image subscriptions → flag redundancy |
| `eco` | Heavy usage + high eco priority setting → suggest reducing use |
| `keep` | High value + moderate or heavy usage → confirm no changes needed |

Ami cannot see your actual usage against plan limits — consumer AI apps do not provide public billing or usage APIs. All recommendations are based on data you enter.

---

## Environmental estimates

CO₂e figures are rough approximations based on published research, not precise measurements. They are intended to give a directional sense of footprint, not an audit-grade number.

Ecological data is shown in 🇬🇧 Metric (kWh, kg, L) or 🇺🇸 Imperial (kWh, lbs, gal) based on your selection.

| Metric | Estimate used |
|---|---|
| Energy per chat message | ~0.003 kWh |
| Energy per image generated | ~0.020 kWh |
| Energy per minute of audio | ~0.005 kWh |
| Cooling water ratio | ~1.8 L per kWh |
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
