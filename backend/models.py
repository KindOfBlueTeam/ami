from typing import Optional
from datetime import date, datetime
from sqlmodel import Field, SQLModel


# ── Providers ──────────────────────────────────────────────────────────────────

class Provider(SQLModel, table=True):
    __tablename__ = "providers"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    website: Optional[str] = None
    category: str  # chat, image, audio, video, coding, writing
    logo_color: str = "#6B7280"  # fallback hex for avatar display
    is_consumer: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProviderRead(SQLModel):
    id: int
    name: str
    website: Optional[str]
    category: str
    logo_color: str
    is_consumer: bool


# ── Plans ──────────────────────────────────────────────────────────────────────

class Plan(SQLModel, table=True):
    __tablename__ = "plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="providers.id")
    name: str
    price_monthly: float  # monthly price (use 0 for free)
    price_annual_total: Optional[float] = None  # total annual price if billed yearly
    is_free: bool = False
    notes: Optional[str] = None


class PlanRead(SQLModel):
    id: int
    provider_id: int
    name: str
    price_monthly: float
    price_annual_total: Optional[float]
    is_free: bool
    notes: Optional[str]


# ── Plan Allowances ────────────────────────────────────────────────────────────

class PlanAllowance(SQLModel, table=True):
    __tablename__ = "plan_allowances"
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plans.id")
    allowance_type: str   # messages | images | minutes | tokens | storage | requests | credits
    amount: Optional[float] = None   # None = unlimited or unknown
    unit: str             # messages, images, minutes, GB, credits, etc.
    is_approximate: bool = True      # consumer plans rarely publish exact quotas
    notes: Optional[str] = None


class PlanAllowanceCreate(SQLModel):
    plan_id: int
    allowance_type: str
    amount: Optional[float] = None
    unit: str
    is_approximate: bool = True
    notes: Optional[str] = None


class PlanAllowanceRead(SQLModel):
    id: int
    plan_id: int
    allowance_type: str
    amount: Optional[float]
    unit: str
    is_approximate: bool
    notes: Optional[str]


# ── Subscriptions ──────────────────────────────────────────────────────────────

class Subscription(SQLModel, table=True):
    __tablename__ = "subscriptions"
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="providers.id")
    plan_id: Optional[int] = Field(default=None, foreign_key="plans.id")
    custom_plan_name: Optional[str] = None  # if plan not in DB
    cost: float  # user-confirmed actual price per billing cycle
    catalog_price_usd: Optional[float] = None  # default price from Ami's catalog at setup time
    price_differs_from_catalog: bool = False   # True if user changed the pre-filled price
    billing_interval: str  # monthly | annual
    renewal_date: date
    status: str = "active"  # active | paused | cancelled
    usage_estimate: str = "moderate"  # light | moderate | heavy
    perceived_value: str = "medium"  # low | medium | high
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SubscriptionCreate(SQLModel):
    provider_id: int
    plan_id: Optional[int] = None
    custom_plan_name: Optional[str] = None
    cost: float
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: bool = False
    billing_interval: str = "monthly"
    renewal_date: date
    status: str = "active"
    usage_estimate: str = "moderate"
    perceived_value: str = "medium"
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionUpdate(SQLModel):
    plan_id: Optional[int] = None
    custom_plan_name: Optional[str] = None
    cost: Optional[float] = None
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: Optional[bool] = None
    billing_interval: Optional[str] = None
    renewal_date: Optional[date] = None
    status: Optional[str] = None
    usage_estimate: Optional[str] = None
    perceived_value: Optional[str] = None
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionRead(SQLModel):
    id: int
    provider_id: int
    plan_id: Optional[int]
    custom_plan_name: Optional[str]
    cost: float
    catalog_price_usd: Optional[float]
    price_differs_from_catalog: bool
    billing_interval: str
    renewal_date: date
    status: str
    usage_estimate: str
    perceived_value: str
    primary_use_case: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    # Joined fields
    provider: Optional[ProviderRead] = None
    plan: Optional[PlanRead] = None
    monthly_cost: Optional[float] = None
    estimated_kwh_monthly: Optional[float] = None
    estimated_co2e_kg_monthly: Optional[float] = None


# ── Usage ──────────────────────────────────────────────────────────────────────

class UsagePeriod(SQLModel, table=True):
    __tablename__ = "usage_periods"
    id: Optional[int] = Field(default=None, primary_key=True)
    subscription_id: int = Field(foreign_key="subscriptions.id")
    period_start: date
    period_end: date
    notes: Optional[str] = None
    estimated_kwh: Optional[float] = None
    estimated_co2e_kg: Optional[float] = None


class UsagePeriodCreate(SQLModel):
    subscription_id: int
    period_start: date
    period_end: date
    notes: Optional[str] = None
    estimated_kwh: Optional[float] = None
    estimated_co2e_kg: Optional[float] = None


class UsagePeriodRead(SQLModel):
    id: int
    subscription_id: int
    period_start: date
    period_end: date
    notes: Optional[str]
    estimated_kwh: Optional[float]
    estimated_co2e_kg: Optional[float]


class UsageEntry(SQLModel, table=True):
    __tablename__ = "usage_entries"
    id: Optional[int] = Field(default=None, primary_key=True)
    period_id: int = Field(foreign_key="usage_periods.id")
    entry_date: date = Field(default_factory=date.today)
    activity_type: str  # message | image | audio_min | video_min | session
    quantity: float
    unit: str  # messages, images, minutes, sessions
    notes: Optional[str] = None
    estimated_kwh: Optional[float] = None
    estimated_co2e_kg: Optional[float] = None


class UsageEntryCreate(SQLModel):
    period_id: int
    entry_date: date
    activity_type: str
    quantity: float
    unit: str
    notes: Optional[str] = None
    estimated_kwh: Optional[float] = None
    estimated_co2e_kg: Optional[float] = None


class UsageEntryRead(SQLModel):
    id: int
    period_id: int
    entry_date: date
    activity_type: str
    quantity: float
    unit: str
    notes: Optional[str]
    estimated_kwh: Optional[float]
    estimated_co2e_kg: Optional[float]


# ── Recommendations ────────────────────────────────────────────────────────────

class Recommendation(SQLModel, table=True):
    __tablename__ = "recommendations"
    id: Optional[int] = Field(default=None, primary_key=True)
    subscription_id: int = Field(foreign_key="subscriptions.id")
    rec_type: str  # upgrade | downgrade | keep | annual | cancel | overlap | eco
    reason: str
    detail: Optional[str] = None
    potential_savings_annual: Optional[float] = None
    estimated_kwh_change: Optional[float] = None
    estimated_co2e_change: Optional[float] = None
    priority: str = "medium"  # low | medium | high
    dismissed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecommendationRead(SQLModel):
    id: int
    subscription_id: int
    rec_type: str
    reason: str
    detail: Optional[str]
    potential_savings_annual: Optional[float]
    estimated_kwh_change: Optional[float]
    estimated_co2e_change: Optional[float]
    priority: str
    dismissed: bool
    created_at: datetime
    provider: Optional[ProviderRead] = None


# ── App Settings ───────────────────────────────────────────────────────────────

class AppSetting(SQLModel, table=True):
    __tablename__ = "app_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    value: str


# ── Onboarding ─────────────────────────────────────────────────────────────────

class OnboardingSubscriptionIn(SQLModel):
    provider_id: int
    plan_id: Optional[int] = None
    custom_plan_name: Optional[str] = None
    cost: float
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: bool = False
    billing_interval: str = "monthly"
    renewal_date: date
    usage_estimate: str = "moderate"
    perceived_value: str = "medium"
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class OnboardingComplete(SQLModel):
    subscriptions: list[OnboardingSubscriptionIn]
    eco_priority: str = "medium"  # low | medium | high
    optimization_style: str = "balanced"  # cost | value | eco | balanced
    eco_tradeoff: str = "maybe"  # yes | maybe | no
