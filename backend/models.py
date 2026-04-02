from __future__ import annotations

from enum import Enum
from typing import Optional
from datetime import date, datetime

from sqlmodel import Field, SQLModel


# ── Enums ──────────────────────────────────────────────────────────────────────

class StatusEnum(str, Enum):
    active = "active"
    paused = "paused"
    cancelled = "cancelled"


class BillingIntervalEnum(str, Enum):
    monthly = "monthly"
    annual = "annual"


class UsageEstimateEnum(str, Enum):
    light = "light"
    moderate = "moderate"
    heavy = "heavy"


class PerceivedValueEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class RecTypeEnum(str, Enum):
    upgrade = "upgrade"
    downgrade = "downgrade"
    keep = "keep"
    annual = "annual"
    cancel = "cancel"
    overlap = "overlap"
    eco = "eco"


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class EcoPriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class OptimizationStyleEnum(str, Enum):
    cost = "cost"
    value = "value"
    eco = "eco"
    balanced = "balanced"


class EcoTradeoffEnum(str, Enum):
    yes = "yes"
    maybe = "maybe"
    no = "no"


# ── Users ───────────────────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    is_active: bool = False
    onboarding_complete: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    name: str


class UserRead(SQLModel):
    id: int
    name: str
    is_active: bool
    onboarding_complete: bool
    created_at: datetime


# ── Providers ──────────────────────────────────────────────────────────────────

class Provider(SQLModel, table=True):
    __tablename__ = "providers"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    website: Optional[str] = None
    category: str  # chat | image | audio | video | coding | writing
    logo_color: str = "#6B7280"
    is_consumer: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProviderRead(SQLModel):
    id: int
    name: str
    website: Optional[str]
    category: str
    logo_color: str
    is_consumer: bool
    account_url: Optional[str] = None
    billing_url: Optional[str] = None
    link_notes: Optional[str] = None


# ── Plans ──────────────────────────────────────────────────────────────────────

class Plan(SQLModel, table=True):
    __tablename__ = "plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="providers.id")
    name: str
    price_monthly: float
    price_annual_total: Optional[float] = None
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
    allowance_type: str
    amount: Optional[float] = None
    unit: str
    is_approximate: bool = True
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
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    provider_id: int = Field(foreign_key="providers.id")
    plan_id: Optional[int] = Field(default=None, foreign_key="plans.id")
    custom_plan_name: Optional[str] = None
    cost: float
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: bool = False
    billing_interval: str = "monthly"  # monthly | annual
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
    billing_interval: BillingIntervalEnum = BillingIntervalEnum.monthly
    renewal_date: date
    status: StatusEnum = StatusEnum.active
    usage_estimate: UsageEstimateEnum = UsageEstimateEnum.moderate
    perceived_value: PerceivedValueEnum = PerceivedValueEnum.medium
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionUpdate(SQLModel):
    plan_id: Optional[int] = None
    custom_plan_name: Optional[str] = None
    cost: Optional[float] = None
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: Optional[bool] = None
    billing_interval: Optional[BillingIntervalEnum] = None
    renewal_date: Optional[date] = None
    status: Optional[StatusEnum] = None
    usage_estimate: Optional[UsageEstimateEnum] = None
    perceived_value: Optional[PerceivedValueEnum] = None
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionRead(SQLModel):
    id: int
    user_id: Optional[int]
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
    co2_miles_equivalent_monthly: Optional[float] = None


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
    unit: str
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
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    subscription_id: int = Field(foreign_key="subscriptions.id")
    rec_type: str  # upgrade | downgrade | keep | annual | cancel | overlap | eco
    reason: str
    detail: Optional[str] = None
    potential_savings_annual: Optional[float] = None
    estimated_kwh_change: Optional[float] = None
    estimated_co2e_change: Optional[float] = None
    priority: str = "medium"  # low | medium | high
    priority_score: int = 2   # 1=low, 2=medium, 3=high — used for ORDER BY DESC
    dismissed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecommendationRead(SQLModel):
    id: int
    user_id: Optional[int]
    subscription_id: int
    rec_type: str
    reason: str
    detail: Optional[str]
    potential_savings_annual: Optional[float]
    estimated_kwh_change: Optional[float]
    estimated_co2e_change: Optional[float]
    priority: str
    priority_score: int
    dismissed: bool
    created_at: datetime
    provider: Optional[ProviderRead] = None


# ── App Settings ───────────────────────────────────────────────────────────────

class AppSetting(SQLModel, table=True):
    __tablename__ = "app_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    value: str


class SettingsUpdate(SQLModel):
    """Typed schema for writable settings keys."""
    eco_priority: Optional[EcoPriorityEnum] = None
    optimization_style: Optional[OptimizationStyleEnum] = None
    eco_tradeoff: Optional[EcoTradeoffEnum] = None
    carbon_intensity_kwh: Optional[str] = None  # stored as string for flexibility


class SettingsRead(SQLModel):
    eco_priority: str = "medium"
    optimization_style: str = "balanced"
    eco_tradeoff: str = "maybe"
    carbon_intensity_kwh: str = "0.386"
    currency: str = "USD"


# ── Onboarding ─────────────────────────────────────────────────────────────────

class OnboardingSubscriptionIn(SQLModel):
    provider_id: int
    plan_id: Optional[int] = None
    custom_plan_name: Optional[str] = None
    cost: float
    catalog_price_usd: Optional[float] = None
    price_differs_from_catalog: bool = False
    billing_interval: BillingIntervalEnum = BillingIntervalEnum.monthly
    renewal_date: date
    usage_estimate: UsageEstimateEnum = UsageEstimateEnum.moderate
    perceived_value: PerceivedValueEnum = PerceivedValueEnum.medium
    primary_use_case: Optional[str] = None
    notes: Optional[str] = None


class OnboardingComplete(SQLModel):
    subscriptions: list[OnboardingSubscriptionIn]
    eco_priority: EcoPriorityEnum = EcoPriorityEnum.medium
    optimization_style: OptimizationStyleEnum = OptimizationStyleEnum.balanced
    eco_tradeoff: EcoTradeoffEnum = EcoTradeoffEnum.maybe
