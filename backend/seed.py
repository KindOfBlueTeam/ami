"""
Seed script — populates providers, plans, and optional sample subscriptions.

Usage:
  python seed.py                  # seed providers + plans only
  python seed.py --with-subs      # also add 4 sample subscriptions
  python seed.py --reset          # drop and recreate all data
"""
import sys
from datetime import date, timedelta

from sqlmodel import Session, select

from database import create_db_and_tables, ensure_default_user, run_migrations
from models import AppSetting, Plan, PlanAllowance, Provider, Subscription, User

PROVIDERS = [
    dict(name="ChatGPT",       website="https://chat.openai.com",              category="chat",   logo_color="#10A37F"),
    dict(name="Claude",        website="https://claude.ai",                     category="chat",   logo_color="#D97706"),
    dict(name="Gemini",        website="https://gemini.google.com",             category="chat",   logo_color="#4285F4"),
    dict(name="Perplexity",    website="https://perplexity.ai",                 category="chat",   logo_color="#20808D"),
    dict(name="MidJourney",    website="https://midjourney.com",                category="image",  logo_color="#7C3AED"),
    dict(name="Adobe Firefly", website="https://firefly.adobe.com",             category="image",  logo_color="#FF0000"),
    dict(name="Suno",          website="https://suno.com",                      category="audio",  logo_color="#EC4899"),
    dict(name="Udio",          website="https://udio.com",                      category="audio",  logo_color="#8B5CF6"),
    dict(name="GitHub Copilot",website="https://github.com/features/copilot",  category="coding", logo_color="#24292E"),
    dict(name="Cursor",        website="https://cursor.sh",                     category="coding", logo_color="#1A1A1A"),
    dict(name="Runway",        website="https://runwayml.com",                  category="video",  logo_color="#000000"),
    dict(name="Pika",          website="https://pika.art",                      category="video",  logo_color="#6366F1"),
    dict(name="Luma AI",       website="https://lumalabs.ai",                   category="video",  logo_color="#0EA5E9"),
    dict(name="ElevenLabs",    website="https://elevenlabs.io",                 category="audio",  logo_color="#F97316"),
    dict(name="Stability AI",  website="https://dreamstudio.ai",                category="image",  logo_color="#6D28D9"),
    dict(name="Leonardo AI",   website="https://app.leonardo.ai",               category="image",  logo_color="#92400E"),
    dict(name="Replit",        website="https://replit.com",                    category="coding", logo_color="#F55F27"),
]

PLANS = {
    "ChatGPT": [
        dict(name="Free",     price_monthly=0.0,   price_annual_total=None,   is_free=True),
        dict(name="Plus",     price_monthly=20.0,  price_annual_total=None,   is_free=False,
             notes="GPT-4o, DALL·E, Advanced Data Analysis. No annual option."),
        dict(name="Pro",      price_monthly=200.0, price_annual_total=None,   is_free=False,
             notes="Highest usage limits, o1 pro mode. No annual option."),
        dict(name="Business", price_monthly=30.0,  price_annual_total=300.0,  is_free=False,
             notes="Per user/month ($25/user/month billed annually = $300/yr)."),
    ],
    "Claude": [
        dict(name="Free",          price_monthly=0.0,   price_annual_total=None,    is_free=True),
        dict(name="Pro",           price_monthly=20.0,  price_annual_total=200.0,   is_free=False,
             notes="Priority access, extended context, Projects. $200/year if billed annually."),
        dict(name="Max 5x",        price_monthly=100.0, price_annual_total=None,    is_free=False,
             notes="5× the usage limits of Pro. No annual option published."),
        dict(name="Max 20x",       price_monthly=200.0, price_annual_total=None,    is_free=False,
             notes="20× the usage limits of Pro. No annual option published."),
        dict(name="Team Standard", price_monthly=25.0,  price_annual_total=240.0,   is_free=False,
             notes="Per member/month ($20/member/month billed annually = $240/yr)."),
        dict(name="Team Premium",  price_monthly=125.0, price_annual_total=1200.0,  is_free=False,
             notes="Per member/month ($100/member/month billed annually = $1,200/yr)."),
    ],
    "Gemini": [
        dict(name="Free",     price_monthly=0.0,   price_annual_total=None, is_free=True),
        dict(name="Advanced", price_monthly=19.99, price_annual_total=None, is_free=False,
             notes="Gemini Ultra model, 2TB storage, included in Google One AI Premium"),
    ],
    "Perplexity": [
        dict(name="Free", price_monthly=0.0,  price_annual_total=None,  is_free=True),
        dict(name="Pro",  price_monthly=20.0, price_annual_total=200.0, is_free=False,
             notes="Unlimited Pro search, image generation, file uploads"),
    ],
    "MidJourney": [
        dict(name="Basic",    price_monthly=10.0,  price_annual_total=96.0,   is_free=False,
             notes="~200 fast image generations/month (~3.3 hr fast GPU)"),
        dict(name="Standard", price_monthly=30.0,  price_annual_total=288.0,  is_free=False,
             notes="15 hr fast GPU time + unlimited relaxed"),
        dict(name="Pro",      price_monthly=60.0,  price_annual_total=576.0,  is_free=False,
             notes="30 hr fast GPU, stealth mode"),
        dict(name="Mega",     price_monthly=120.0, price_annual_total=1152.0, is_free=False,
             notes="60 hr fast GPU"),
    ],
    "Adobe Firefly": [
        dict(name="Free",    price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="25 generative credits/month"),
        dict(name="Premium", price_monthly=4.99, price_annual_total=49.99, is_free=False,
             notes="100 generative credits/month"),
    ],
    "Suno": [
        dict(name="Free",    price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="~50 credits/day, non-commercial"),
        dict(name="Pro",     price_monthly=8.0,  price_annual_total=96.0,  is_free=False,
             notes="2,500 credits/month, commercial use. Annual inferred ($8×12=$96)."),
        dict(name="Premier", price_monthly=30.0, price_annual_total=288.0, is_free=False,
             notes="10,000 credits/month. Annual inferred ($30×12=$288 — verify with Suno)."),
    ],
    "Udio": [
        dict(name="Free",     price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="~100 credits/month"),
        dict(name="Standard", price_monthly=6.0,  price_annual_total=60.0,  is_free=False,
             notes="1,200 credits/month"),
        dict(name="Pro",      price_monthly=14.0, price_annual_total=140.0, is_free=False,
             notes="4,800 credits/month"),
    ],
    "GitHub Copilot": [
        dict(name="Free",       price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="2,000 code completions/month, 50 chat messages"),
        dict(name="Individual", price_monthly=10.0, price_annual_total=100.0, is_free=False,
             notes="Unlimited completions and chat"),
        dict(name="Business",   price_monthly=19.0, price_annual_total=None,  is_free=False,
             notes="Per seat, org features"),
    ],
    "Cursor": [
        dict(name="Hobby",    price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="2,000 completions, 50 slow requests"),
        dict(name="Pro",      price_monthly=20.0, price_annual_total=192.0, is_free=False,
             notes="Unlimited completions, 500 fast requests"),
        dict(name="Business", price_monthly=40.0, price_annual_total=None,  is_free=False,
             notes="Per seat, privacy mode, SAML"),
    ],
    "Runway": [
        dict(name="Basic",    price_monthly=0.0,  price_annual_total=None,   is_free=True,
             notes="125 credits/month"),
        dict(name="Standard", price_monthly=15.0, price_annual_total=144.0,  is_free=False,
             notes="625 credits/month"),
        dict(name="Pro",      price_monthly=35.0, price_annual_total=336.0,  is_free=False,
             notes="2,250 credits/month"),
        dict(name="Unlimited",price_monthly=95.0, price_annual_total=912.0,  is_free=False,
             notes="Unlimited video generations (fair use)"),
    ],
    "Pika": [
        dict(name="Free",  price_monthly=0.0,  price_annual_total=None,  is_free=True,
             notes="250 credits/month"),
        dict(name="Basic", price_monthly=8.0,  price_annual_total=70.0,  is_free=False,
             notes="700 credits/month"),
        dict(name="Pro",   price_monthly=28.0, price_annual_total=239.0, is_free=False,
             notes="2,000 credits/month"),
    ],
    "Luma AI": [
        dict(name="Free",     price_monthly=0.0,   price_annual_total=None,    is_free=True,
             notes="30 generations/month"),
        dict(name="Standard", price_monthly=29.99, price_annual_total=287.88,  is_free=False,
             notes="120 generations/month"),
        dict(name="Pro",      price_monthly=99.99, price_annual_total=959.88,  is_free=False,
             notes="400 generations/month"),
    ],
    "ElevenLabs": [
        dict(name="Free",       price_monthly=0.0,   price_annual_total=None,    is_free=True,
             notes="10,000 characters/month"),
        dict(name="Starter",    price_monthly=5.0,   price_annual_total=None,    is_free=False,
             notes="30,000 characters/month"),
        dict(name="Creator",    price_monthly=22.0,  price_annual_total=None,    is_free=False,
             notes="100,000 characters/month"),
        dict(name="Pro",        price_monthly=99.0,  price_annual_total=None,    is_free=False,
             notes="500,000 characters/month"),
    ],
    "Stability AI": [
        dict(name="Free",  price_monthly=0.0,  price_annual_total=None, is_free=True,
             notes="25 free credits/month on DreamStudio"),
        dict(name="Pay-as-you-go", price_monthly=10.0, price_annual_total=None, is_free=False,
             notes="Approx. $10/1,000 credits; no subscription required"),
    ],
    "Leonardo AI": [
        dict(name="Free",       price_monthly=0.0,  price_annual_total=None,   is_free=True,
             notes="150 tokens/day"),
        dict(name="Apprentice", price_monthly=12.0, price_annual_total=96.0,   is_free=False,
             notes="8,500 tokens/month"),
        dict(name="Artisan",    price_monthly=30.0, price_annual_total=240.0,  is_free=False,
             notes="25,000 tokens/month"),
        dict(name="Maestro",    price_monthly=60.0, price_annual_total=480.0,  is_free=False,
             notes="60,000 tokens/month"),
    ],
    "Replit": [
        dict(name="Free",     price_monthly=0.0,  price_annual_total=None,   is_free=True,
             notes="Basic IDE, limited AI features"),
        dict(name="Core",     price_monthly=20.0, price_annual_total=180.0,  is_free=False,
             notes="Full AI coding assistant (Ghostwriter), unlimited storage"),
        dict(name="Teams",    price_monthly=40.0, price_annual_total=None,   is_free=False,
             notes="Per seat; team features and org controls"),
    ],
}

DEFAULT_SETTINGS = {
    "onboarding_complete": "false",
    "currency": "USD",
    "eco_priority": "medium",
    "optimization_style": "balanced",
    "eco_tradeoff": "maybe",
    "carbon_intensity_kwh": "0.386",
}

SAMPLE_SUBSCRIPTIONS = [
    dict(
        provider_name="ChatGPT",
        plan_name="Plus",
        cost=20.0,
        billing_interval="monthly",
        renewal_date=date.today() + timedelta(days=12),
        usage_estimate="heavy",
        perceived_value="high",
        primary_use_case="Research, writing, and daily Q&A",
    ),
    dict(
        provider_name="Claude",
        plan_name="Pro",
        cost=20.0,
        billing_interval="monthly",
        renewal_date=date.today() + timedelta(days=5),
        usage_estimate="moderate",
        perceived_value="high",
        primary_use_case="Long document analysis and coding help",
    ),
    dict(
        provider_name="MidJourney",
        plan_name="Standard",
        cost=30.0,
        billing_interval="monthly",
        renewal_date=date.today() + timedelta(days=21),
        usage_estimate="moderate",
        perceived_value="medium",
        primary_use_case="Concept art and social media visuals",
    ),
    dict(
        provider_name="Suno",
        plan_name="Pro",
        cost=8.0,
        billing_interval="monthly",
        renewal_date=date.today() + timedelta(days=18),
        usage_estimate="light",
        perceived_value="medium",
        primary_use_case="Background music for videos",
    ),
]


def seed(with_subs: bool = False, reset: bool = False):
    create_db_and_tables()
    run_migrations()
    ensure_default_user()

    with Session(__import__("database").engine) as session:
        if reset:
            for model in [Subscription, PlanAllowance, Plan, Provider, AppSetting]:
                rows = session.exec(select(model)).all()
                for row in rows:
                    session.delete(row)
            session.commit()
            print("Reset: all data cleared.")

        # Skip if providers already seeded
        existing = session.exec(select(Provider)).first()
        if existing and not reset:
            print("Providers already seeded. Use --reset to re-seed.")
            if with_subs:
                default_user = session.exec(select(User).where(User.is_active == True)).first()  # noqa: E712
                _seed_subscriptions(session, user_id=default_user.id if default_user else 1)
            return

        # Seed providers
        provider_records: dict[str, Provider] = {}
        for p in PROVIDERS:
            prov = Provider(**p)
            session.add(prov)
            session.flush()
            provider_records[p["name"]] = prov

        # Seed plans
        plan_records: dict[tuple[str, str], Plan] = {}
        for pname, plans in PLANS.items():
            prov = provider_records.get(pname)
            if not prov:
                continue
            for pl in plans:
                plan = Plan(provider_id=prov.id, **pl)
                session.add(plan)
                session.flush()
                plan_records[(pname, pl["name"])] = plan

        # Seed plan allowances
        allowance_count = _seed_allowances(session, plan_records)

        # Seed default settings (skip keys that already exist)
        for key, value in DEFAULT_SETTINGS.items():
            existing_setting = session.exec(
                select(AppSetting).where(AppSetting.key == key)
            ).first()
            if not existing_setting:
                session.add(AppSetting(key=key, value=value))

        session.commit()
        print(f"Seeded {len(provider_records)} providers, {len(plan_records)} plans, {allowance_count} allowances.")

        if with_subs:
            default_user = session.exec(select(User).where(User.is_active == True)).first()  # noqa: E712
            _seed_subscriptions(session, user_id=default_user.id if default_user else 1)


# (provider_name, plan_name) -> list of allowance dicts
PLAN_ALLOWANCES = {
    ("ChatGPT", "Free"): [
        dict(allowance_type="messages", amount=None, unit="messages/day", is_approximate=True,
             notes="Limited access to GPT-4o; exact cap unpublished and changes frequently"),
    ],
    ("ChatGPT", "Plus"): [
        dict(allowance_type="messages", amount=None, unit="messages/3h", is_approximate=True,
             notes="Higher rate limit than Free; exact cap unpublished by OpenAI"),
        dict(allowance_type="images", amount=None, unit="images/day", is_approximate=True,
             notes="DALL·E 3 included; no published hard limit"),
    ],
    ("Claude", "Free"): [
        dict(allowance_type="messages", amount=None, unit="messages/day", is_approximate=True,
             notes="Usage limit varies; Anthropic does not publish exact quotas"),
    ],
    ("Claude", "Pro"): [
        dict(allowance_type="messages", amount=None, unit="messages/day", is_approximate=True,
             notes="5× higher limit than Free per Anthropic docs; exact number unpublished"),
    ],
    ("MidJourney", "Basic"): [
        dict(allowance_type="images", amount=200, unit="images/month", is_approximate=True,
             notes="~200 fast GPU image generations (~3.3 hr fast GPU time)"),
    ],
    ("MidJourney", "Standard"): [
        dict(allowance_type="images", amount=None, unit="images/month", is_approximate=False,
             notes="15 hr fast GPU time + unlimited relaxed-mode generations"),
    ],
    ("MidJourney", "Pro"): [
        dict(allowance_type="images", amount=None, unit="images/month", is_approximate=False,
             notes="30 hr fast GPU time + unlimited relaxed + stealth mode"),
    ],
    ("MidJourney", "Mega"): [
        dict(allowance_type="images", amount=None, unit="images/month", is_approximate=False,
             notes="60 hr fast GPU time + unlimited relaxed"),
    ],
    ("Suno", "Free"): [
        dict(allowance_type="credits", amount=50, unit="credits/day", is_approximate=False,
             notes="~10 songs/day; non-commercial use only"),
    ],
    ("Suno", "Pro"): [
        dict(allowance_type="credits", amount=2500, unit="credits/month", is_approximate=False,
             notes="~500 songs/month; commercial use included"),
    ],
    ("Suno", "Premier"): [
        dict(allowance_type="credits", amount=10000, unit="credits/month", is_approximate=False,
             notes="~2,000 songs/month; commercial use included"),
    ],
    ("GitHub Copilot", "Free"): [
        dict(allowance_type="requests", amount=2000, unit="completions/month", is_approximate=False),
        dict(allowance_type="messages", amount=50, unit="chat messages/month", is_approximate=False),
    ],
    ("GitHub Copilot", "Individual"): [
        dict(allowance_type="requests", amount=None, unit="completions/month", is_approximate=False,
             notes="Unlimited completions and chat"),
    ],
    ("Perplexity", "Pro"): [
        dict(allowance_type="requests", amount=300, unit="Pro searches/day", is_approximate=True,
             notes="~300 Pro searches/day; standard searches unlimited"),
    ],
    ("Cursor", "Pro"): [
        dict(allowance_type="requests", amount=500, unit="fast requests/month", is_approximate=False,
             notes="500 fast (GPT-4/Claude) requests; unlimited slow requests"),
    ],
}


def _seed_allowances(session: Session, plan_records: dict) -> int:
    count = 0
    for (provider_name, plan_name), allowances in PLAN_ALLOWANCES.items():
        plan = plan_records.get((provider_name, plan_name))
        if not plan:
            continue
        for a in allowances:
            session.add(PlanAllowance(plan_id=plan.id, **a))
            session.flush()
            count += 1
    return count


def _seed_subscriptions(session: Session, user_id: int = 1):
    existing = session.exec(
        select(Subscription).where(Subscription.user_id == user_id)
    ).first()
    if existing:
        print(f"Subscriptions already exist for user_id={user_id} — skipping sample subs.")
        return

    provider_by_name = {
        p.name: p for p in session.exec(select(Provider)).all()
    }
    plan_by_key = {
        (p.provider_id, p.name): p for p in session.exec(select(Plan)).all()
    }

    count = 0
    for s in SAMPLE_SUBSCRIPTIONS:
        prov = provider_by_name.get(s["provider_name"])
        if not prov:
            continue
        plan = plan_by_key.get((prov.id, s["plan_name"]))
        sub = Subscription(
            user_id=user_id,
            provider_id=prov.id,
            plan_id=plan.id if plan else None,
            cost=s["cost"],
            billing_interval=s["billing_interval"],
            renewal_date=s["renewal_date"],
            usage_estimate=s["usage_estimate"],
            perceived_value=s["perceived_value"],
            primary_use_case=s["primary_use_case"],
        )
        session.add(sub)
        count += 1

    session.commit()
    print(f"Seeded {count} sample subscriptions for user_id={user_id}.")


if __name__ == "__main__":
    args = sys.argv[1:]
    seed(
        with_subs="--with-subs" in args,
        reset="--reset" in args,
    )
