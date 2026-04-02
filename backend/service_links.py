"""
Static service links catalog — keyed by provider name.
Add or update entries here; the providers router attaches
them to every ProviderRead response automatically.
"""
from typing import Optional

SERVICE_LINKS: dict[str, dict[str, Optional[str]]] = {
    "ChatGPT": {
        "account_url": "https://chat.openai.com/",
        "billing_url": "https://platform.openai.com/account/billing/overview",
        "link_notes": "Billing may be managed via Apple or Google subscriptions if purchased via mobile",
    },
    "Claude": {
        "account_url": "https://claude.ai/",
        "billing_url": "https://claude.ai/settings/billing",
        "link_notes": "Login may be via Google; billing managed in-app",
    },
    "MidJourney": {
        "account_url": "https://www.midjourney.com/account/",
        "billing_url": "https://www.midjourney.com/account/",
        "link_notes": "Also accessible via Discord /subscribe",
    },
    "Suno": {
        "account_url": "https://suno.com/account",
        "billing_url": "https://suno.com/account",
        "link_notes": "Credits and subscription managed in account page",
    },
    "Perplexity": {
        "account_url": "https://www.perplexity.ai/settings",
        "billing_url": "https://www.perplexity.ai/settings/billing",
        "link_notes": "Pro subscription managed via web or mobile store",
    },
    "Cursor": {
        "account_url": "https://cursor.sh/settings",
        "billing_url": "https://cursor.sh/settings/billing",
        "link_notes": "Billing tied to Cursor account",
    },
    "GitHub Copilot": {
        "account_url": "https://github.com/settings/copilot",
        "billing_url": "https://github.com/settings/billing",
        "link_notes": "Managed through GitHub billing settings",
    },
    "Runway": {
        "account_url": "https://app.runwayml.com/account",
        "billing_url": "https://app.runwayml.com/account",
        "link_notes": "Credits and subscription managed in dashboard",
    },
    "ElevenLabs": {
        "account_url": "https://elevenlabs.io/subscription",
        "billing_url": "https://elevenlabs.io/subscription",
        "link_notes": "Usage and billing managed in subscription page",
    },
    "Stability AI": {
        "account_url": "https://dreamstudio.ai/account",
        "billing_url": "https://dreamstudio.ai/account",
        "link_notes": "Pay-as-you-go credits system",
    },
    "Leonardo AI": {
        "account_url": "https://app.leonardo.ai/account",
        "billing_url": "https://app.leonardo.ai/account",
        "link_notes": "Credits and subscription managed in app",
    },
    "Pika": {
        "account_url": "https://pika.art/account",
        "billing_url": "https://pika.art/account",
        "link_notes": "Video generation credits and subscription",
    },
    "Luma AI": {
        "account_url": "https://lumalabs.ai/account",
        "billing_url": "https://lumalabs.ai/account",
        "link_notes": "Billing tied to account dashboard",
    },
    "Replit": {
        "account_url": "https://replit.com/account",
        "billing_url": "https://replit.com/account/billing",
        "link_notes": "Part of Replit subscription (includes Ghostwriter)",
    },
}

_EMPTY: dict[str, Optional[str]] = {
    "account_url": None,
    "billing_url": None,
    "link_notes": None,
}


def get_service_links(provider_name: str) -> dict[str, Optional[str]]:
    """Return link data for a provider, or nulls if not catalogued."""
    return SERVICE_LINKS.get(provider_name, _EMPTY)
