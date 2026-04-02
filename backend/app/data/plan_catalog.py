"""
Canonical plan catalog for Ami.

Each entry in PLAN_CATALOG corresponds to one row in the plans table,
identified by (provider_slug, slug, billing_interval).

Rules:
  - Monthly-only plans have a single entry with billing_interval="monthly".
  - Plans that offer both monthly and annual billing have two entries, one per
    billing_interval. The annual entry carries default_price_usd = the annual
    charge and monthly_equivalent_usd = annual / 12.
  - Free plans are always billing_interval="monthly".
  - notes are optional human-readable context, not shown in the UI.
"""

PLAN_CATALOG: list[dict] = [

    # ── ChatGPT ────────────────────────────────────────────────────────────────
    {
        "provider_slug": "chatgpt",
        "plans": [
            dict(name="Free",     slug="free",     billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="Limited GPT-4o access; exact cap unpublished"),
            dict(name="Plus",     slug="plus",     billing_interval="monthly",
                 default_price_usd=20.0,  monthly_equivalent_usd=20.0,  is_free=False,
                 notes="GPT-4o, DALL·E, Advanced Data Analysis. No annual option."),
            dict(name="Pro",      slug="pro",      billing_interval="monthly",
                 default_price_usd=200.0, monthly_equivalent_usd=200.0, is_free=False,
                 notes="Highest usage limits, o1 pro mode. No annual option."),
            dict(name="Business", slug="business", billing_interval="monthly",
                 default_price_usd=30.0,  monthly_equivalent_usd=30.0,  is_free=False,
                 notes="Per user/month, billed monthly."),
            dict(name="Business", slug="business", billing_interval="annual",
                 default_price_usd=300.0, monthly_equivalent_usd=25.0,  is_free=False,
                 notes="$300/year per user ($25/mo equivalent)."),
        ],
    },

    # ── Claude ─────────────────────────────────────────────────────────────────
    {
        "provider_slug": "claude",
        "plans": [
            dict(name="Free",         slug="free",          billing_interval="monthly",
                 default_price_usd=0.0,    monthly_equivalent_usd=0.0,    is_free=True),
            dict(name="Pro",          slug="pro",           billing_interval="monthly",
                 default_price_usd=20.0,   monthly_equivalent_usd=20.0,   is_free=False,
                 notes="Priority access, extended context, Projects."),
            dict(name="Pro",          slug="pro",           billing_interval="annual",
                 default_price_usd=200.0,  monthly_equivalent_usd=16.67,  is_free=False,
                 notes="$200/year ($16.67/mo equivalent)."),
            dict(name="Max 5x",       slug="max-5x",        billing_interval="monthly",
                 default_price_usd=100.0,  monthly_equivalent_usd=100.0,  is_free=False,
                 notes="5× the usage limits of Pro."),
            dict(name="Max 20x",      slug="max-20x",       billing_interval="monthly",
                 default_price_usd=200.0,  monthly_equivalent_usd=200.0,  is_free=False,
                 notes="20× the usage limits of Pro."),
            dict(name="Team Standard", slug="team-standard", billing_interval="monthly",
                 default_price_usd=25.0,   monthly_equivalent_usd=25.0,   is_free=False,
                 notes="Per member/month."),
            dict(name="Team Standard", slug="team-standard", billing_interval="annual",
                 default_price_usd=240.0,  monthly_equivalent_usd=20.0,   is_free=False,
                 notes="$240/year per member ($20/mo equivalent)."),
            dict(name="Team Premium", slug="team-premium",  billing_interval="monthly",
                 default_price_usd=125.0,  monthly_equivalent_usd=125.0,  is_free=False,
                 notes="Per member/month."),
            dict(name="Team Premium", slug="team-premium",  billing_interval="annual",
                 default_price_usd=1200.0, monthly_equivalent_usd=100.0,  is_free=False,
                 notes="$1,200/year per member ($100/mo equivalent)."),
        ],
    },

    # ── Gemini ─────────────────────────────────────────────────────────────────
    {
        "provider_slug": "gemini",
        "plans": [
            dict(name="Free",     slug="free",     billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True),
            dict(name="Advanced", slug="advanced", billing_interval="monthly",
                 default_price_usd=19.99, monthly_equivalent_usd=19.99, is_free=False,
                 notes="Gemini Ultra model, 2TB storage. Included in Google One AI Premium."),
        ],
    },

    # ── Perplexity ─────────────────────────────────────────────────────────────
    {
        "provider_slug": "perplexity",
        "plans": [
            dict(name="Free", slug="free", billing_interval="monthly",
                 default_price_usd=0.0,  monthly_equivalent_usd=0.0,  is_free=True),
            dict(name="Pro",  slug="pro", billing_interval="monthly",
                 default_price_usd=20.0, monthly_equivalent_usd=20.0, is_free=False,
                 notes="Unlimited Pro search, image generation, file uploads."),
            dict(name="Pro",  slug="pro", billing_interval="annual",
                 default_price_usd=200.0, monthly_equivalent_usd=16.67, is_free=False,
                 notes="$200/year ($16.67/mo equivalent)."),
        ],
    },

    # ── MidJourney ─────────────────────────────────────────────────────────────
    {
        "provider_slug": "midjourney",
        "plans": [
            dict(name="Basic",    slug="basic",    billing_interval="monthly",
                 default_price_usd=10.0,  monthly_equivalent_usd=10.0,  is_free=False,
                 notes="~200 fast image generations/month."),
            dict(name="Basic",    slug="basic",    billing_interval="annual",
                 default_price_usd=96.0,  monthly_equivalent_usd=8.0,   is_free=False,
                 notes="$96/year ($8/mo equivalent)."),
            dict(name="Standard", slug="standard", billing_interval="monthly",
                 default_price_usd=30.0,  monthly_equivalent_usd=30.0,  is_free=False,
                 notes="15 hr fast GPU time + unlimited relaxed."),
            dict(name="Standard", slug="standard", billing_interval="annual",
                 default_price_usd=288.0, monthly_equivalent_usd=24.0,  is_free=False,
                 notes="$288/year ($24/mo equivalent)."),
            dict(name="Pro",      slug="pro",      billing_interval="monthly",
                 default_price_usd=60.0,  monthly_equivalent_usd=60.0,  is_free=False,
                 notes="30 hr fast GPU, stealth mode."),
            dict(name="Pro",      slug="pro",      billing_interval="annual",
                 default_price_usd=576.0, monthly_equivalent_usd=48.0,  is_free=False,
                 notes="$576/year ($48/mo equivalent)."),
            dict(name="Mega",     slug="mega",     billing_interval="monthly",
                 default_price_usd=120.0, monthly_equivalent_usd=120.0, is_free=False,
                 notes="60 hr fast GPU."),
            dict(name="Mega",     slug="mega",     billing_interval="annual",
                 default_price_usd=1152.0, monthly_equivalent_usd=96.0, is_free=False,
                 notes="$1,152/year ($96/mo equivalent)."),
        ],
    },

    # ── Adobe Firefly ──────────────────────────────────────────────────────────
    {
        "provider_slug": "adobe-firefly",
        "plans": [
            dict(name="Free",    slug="free",    billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="25 generative credits/month."),
            dict(name="Premium", slug="premium", billing_interval="monthly",
                 default_price_usd=4.99,  monthly_equivalent_usd=4.99,  is_free=False,
                 notes="100 generative credits/month."),
            dict(name="Premium", slug="premium", billing_interval="annual",
                 default_price_usd=49.99, monthly_equivalent_usd=4.17,  is_free=False,
                 notes="$49.99/year ($4.17/mo equivalent)."),
        ],
    },

    # ── Suno ───────────────────────────────────────────────────────────────────
    {
        "provider_slug": "suno",
        "plans": [
            dict(name="Free",    slug="free",    billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="~50 credits/day, non-commercial."),
            dict(name="Pro",     slug="pro",     billing_interval="monthly",
                 default_price_usd=8.0,   monthly_equivalent_usd=8.0,   is_free=False,
                 notes="2,500 credits/month, commercial use."),
            dict(name="Pro",     slug="pro",     billing_interval="annual",
                 default_price_usd=96.0,  monthly_equivalent_usd=8.0,   is_free=False,
                 notes="$96/year ($8/mo equivalent)."),
            dict(name="Premier", slug="premier", billing_interval="monthly",
                 default_price_usd=30.0,  monthly_equivalent_usd=30.0,  is_free=False,
                 notes="10,000 credits/month."),
            dict(name="Premier", slug="premier", billing_interval="annual",
                 default_price_usd=288.0, monthly_equivalent_usd=24.0,  is_free=False,
                 notes="$288/year ($24/mo equivalent)."),
        ],
    },

    # ── Udio ───────────────────────────────────────────────────────────────────
    {
        "provider_slug": "udio",
        "plans": [
            dict(name="Free",     slug="free",     billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="~100 credits/month."),
            dict(name="Standard", slug="standard", billing_interval="monthly",
                 default_price_usd=6.0,   monthly_equivalent_usd=6.0,   is_free=False,
                 notes="1,200 credits/month."),
            dict(name="Standard", slug="standard", billing_interval="annual",
                 default_price_usd=60.0,  monthly_equivalent_usd=5.0,   is_free=False,
                 notes="$60/year ($5/mo equivalent)."),
            dict(name="Pro",      slug="pro",      billing_interval="monthly",
                 default_price_usd=14.0,  monthly_equivalent_usd=14.0,  is_free=False,
                 notes="4,800 credits/month."),
            dict(name="Pro",      slug="pro",      billing_interval="annual",
                 default_price_usd=140.0, monthly_equivalent_usd=11.67, is_free=False,
                 notes="$140/year ($11.67/mo equivalent)."),
        ],
    },

    # ── GitHub Copilot ─────────────────────────────────────────────────────────
    {
        "provider_slug": "github-copilot",
        "plans": [
            dict(name="Free",       slug="free",       billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="2,000 completions/month, 50 chat messages."),
            dict(name="Individual", slug="individual", billing_interval="monthly",
                 default_price_usd=10.0,  monthly_equivalent_usd=10.0,  is_free=False,
                 notes="Unlimited completions and chat."),
            dict(name="Individual", slug="individual", billing_interval="annual",
                 default_price_usd=100.0, monthly_equivalent_usd=8.33,  is_free=False,
                 notes="$100/year ($8.33/mo equivalent)."),
            dict(name="Business",   slug="business",   billing_interval="monthly",
                 default_price_usd=19.0,  monthly_equivalent_usd=19.0,  is_free=False,
                 notes="Per seat, org management features."),
        ],
    },

    # ── Cursor ─────────────────────────────────────────────────────────────────
    {
        "provider_slug": "cursor",
        "plans": [
            dict(name="Hobby",    slug="hobby",    billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="2,000 completions, 50 slow requests."),
            dict(name="Pro",      slug="pro",      billing_interval="monthly",
                 default_price_usd=20.0,  monthly_equivalent_usd=20.0,  is_free=False,
                 notes="Unlimited completions, 500 fast requests."),
            dict(name="Pro",      slug="pro",      billing_interval="annual",
                 default_price_usd=192.0, monthly_equivalent_usd=16.0,  is_free=False,
                 notes="$192/year ($16/mo equivalent)."),
            dict(name="Business", slug="business", billing_interval="monthly",
                 default_price_usd=40.0,  monthly_equivalent_usd=40.0,  is_free=False,
                 notes="Per seat, privacy mode, SAML."),
        ],
    },

    # ── Runway ─────────────────────────────────────────────────────────────────
    {
        "provider_slug": "runway",
        "plans": [
            dict(name="Basic",     slug="basic",     billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="125 credits/month."),
            dict(name="Standard",  slug="standard",  billing_interval="monthly",
                 default_price_usd=15.0,  monthly_equivalent_usd=15.0,  is_free=False,
                 notes="625 credits/month."),
            dict(name="Standard",  slug="standard",  billing_interval="annual",
                 default_price_usd=144.0, monthly_equivalent_usd=12.0,  is_free=False,
                 notes="$144/year ($12/mo equivalent)."),
            dict(name="Pro",       slug="pro",       billing_interval="monthly",
                 default_price_usd=35.0,  monthly_equivalent_usd=35.0,  is_free=False,
                 notes="2,250 credits/month."),
            dict(name="Pro",       slug="pro",       billing_interval="annual",
                 default_price_usd=336.0, monthly_equivalent_usd=28.0,  is_free=False,
                 notes="$336/year ($28/mo equivalent)."),
            dict(name="Unlimited", slug="unlimited", billing_interval="monthly",
                 default_price_usd=95.0,  monthly_equivalent_usd=95.0,  is_free=False,
                 notes="Unlimited video generations (fair use)."),
            dict(name="Unlimited", slug="unlimited", billing_interval="annual",
                 default_price_usd=912.0, monthly_equivalent_usd=76.0,  is_free=False,
                 notes="$912/year ($76/mo equivalent)."),
        ],
    },

    # ── Pika ───────────────────────────────────────────────────────────────────
    {
        "provider_slug": "pika",
        "plans": [
            dict(name="Free",  slug="free",  billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="250 credits/month."),
            dict(name="Basic", slug="basic", billing_interval="monthly",
                 default_price_usd=8.0,   monthly_equivalent_usd=8.0,   is_free=False,
                 notes="700 credits/month."),
            dict(name="Basic", slug="basic", billing_interval="annual",
                 default_price_usd=70.0,  monthly_equivalent_usd=5.83,  is_free=False,
                 notes="$70/year ($5.83/mo equivalent)."),
            dict(name="Pro",   slug="pro",   billing_interval="monthly",
                 default_price_usd=28.0,  monthly_equivalent_usd=28.0,  is_free=False,
                 notes="2,000 credits/month."),
            dict(name="Pro",   slug="pro",   billing_interval="annual",
                 default_price_usd=239.0, monthly_equivalent_usd=19.92, is_free=False,
                 notes="$239/year ($19.92/mo equivalent)."),
        ],
    },

    # ── Luma AI ────────────────────────────────────────────────────────────────
    {
        "provider_slug": "luma-ai",
        "plans": [
            dict(name="Free",     slug="free",     billing_interval="monthly",
                 default_price_usd=0.0,    monthly_equivalent_usd=0.0,    is_free=True,
                 notes="30 generations/month."),
            dict(name="Standard", slug="standard", billing_interval="monthly",
                 default_price_usd=29.99,  monthly_equivalent_usd=29.99,  is_free=False,
                 notes="120 generations/month."),
            dict(name="Standard", slug="standard", billing_interval="annual",
                 default_price_usd=287.88, monthly_equivalent_usd=23.99,  is_free=False,
                 notes="$287.88/year ($23.99/mo equivalent)."),
            dict(name="Pro",      slug="pro",      billing_interval="monthly",
                 default_price_usd=99.99,  monthly_equivalent_usd=99.99,  is_free=False,
                 notes="400 generations/month."),
            dict(name="Pro",      slug="pro",      billing_interval="annual",
                 default_price_usd=959.88, monthly_equivalent_usd=79.99,  is_free=False,
                 notes="$959.88/year ($79.99/mo equivalent)."),
        ],
    },

    # ── ElevenLabs ─────────────────────────────────────────────────────────────
    {
        "provider_slug": "elevenlabs",
        "plans": [
            dict(name="Free",    slug="free",    billing_interval="monthly",
                 default_price_usd=0.0,  monthly_equivalent_usd=0.0,  is_free=True,
                 notes="10,000 characters/month."),
            dict(name="Starter", slug="starter", billing_interval="monthly",
                 default_price_usd=5.0,  monthly_equivalent_usd=5.0,  is_free=False,
                 notes="30,000 characters/month."),
            dict(name="Creator", slug="creator", billing_interval="monthly",
                 default_price_usd=22.0, monthly_equivalent_usd=22.0, is_free=False,
                 notes="100,000 characters/month."),
            dict(name="Pro",     slug="pro",     billing_interval="monthly",
                 default_price_usd=99.0, monthly_equivalent_usd=99.0, is_free=False,
                 notes="500,000 characters/month."),
        ],
    },

    # ── Stability AI ───────────────────────────────────────────────────────────
    {
        "provider_slug": "stability-ai",
        "plans": [
            dict(name="Free",           slug="free",           billing_interval="monthly",
                 default_price_usd=0.0,  monthly_equivalent_usd=0.0,  is_free=True,
                 notes="25 free credits/month on DreamStudio."),
            dict(name="Pay-as-you-go",  slug="pay-as-you-go",  billing_interval="monthly",
                 default_price_usd=10.0, monthly_equivalent_usd=10.0, is_free=False,
                 notes="~$10/1,000 credits; no fixed subscription."),
        ],
    },

    # ── Leonardo AI ────────────────────────────────────────────────────────────
    {
        "provider_slug": "leonardo-ai",
        "plans": [
            dict(name="Free",       slug="free",       billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="150 tokens/day."),
            dict(name="Apprentice", slug="apprentice", billing_interval="monthly",
                 default_price_usd=12.0,  monthly_equivalent_usd=12.0,  is_free=False,
                 notes="8,500 tokens/month."),
            dict(name="Apprentice", slug="apprentice", billing_interval="annual",
                 default_price_usd=96.0,  monthly_equivalent_usd=8.0,   is_free=False,
                 notes="$96/year ($8/mo equivalent)."),
            dict(name="Artisan",    slug="artisan",    billing_interval="monthly",
                 default_price_usd=30.0,  monthly_equivalent_usd=30.0,  is_free=False,
                 notes="25,000 tokens/month."),
            dict(name="Artisan",    slug="artisan",    billing_interval="annual",
                 default_price_usd=240.0, monthly_equivalent_usd=20.0,  is_free=False,
                 notes="$240/year ($20/mo equivalent)."),
            dict(name="Maestro",    slug="maestro",    billing_interval="monthly",
                 default_price_usd=60.0,  monthly_equivalent_usd=60.0,  is_free=False,
                 notes="60,000 tokens/month."),
            dict(name="Maestro",    slug="maestro",    billing_interval="annual",
                 default_price_usd=480.0, monthly_equivalent_usd=40.0,  is_free=False,
                 notes="$480/year ($40/mo equivalent)."),
        ],
    },

    # ── Replit ─────────────────────────────────────────────────────────────────
    {
        "provider_slug": "replit",
        "plans": [
            dict(name="Free",  slug="free",  billing_interval="monthly",
                 default_price_usd=0.0,   monthly_equivalent_usd=0.0,   is_free=True,
                 notes="Basic IDE, limited AI features."),
            dict(name="Core",  slug="core",  billing_interval="monthly",
                 default_price_usd=20.0,  monthly_equivalent_usd=20.0,  is_free=False,
                 notes="Full AI coding assistant (Ghostwriter), unlimited storage."),
            dict(name="Core",  slug="core",  billing_interval="annual",
                 default_price_usd=180.0, monthly_equivalent_usd=15.0,  is_free=False,
                 notes="$180/year ($15/mo equivalent)."),
            dict(name="Teams", slug="teams", billing_interval="monthly",
                 default_price_usd=40.0,  monthly_equivalent_usd=40.0,  is_free=False,
                 notes="Per seat; team features and org controls."),
        ],
    },
]
