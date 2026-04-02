// ── Enums (mirrors backend) ────────────────────────────────────────────────────

export type StatusEnum = 'active' | 'paused' | 'cancelled'
export type BillingIntervalEnum = 'monthly' | 'annual'
export type UsageEstimateEnum = 'light' | 'moderate' | 'heavy'
export type PerceivedValueEnum = 'low' | 'medium' | 'high'
export type RecTypeEnum = 'upgrade' | 'downgrade' | 'keep' | 'annual' | 'cancel' | 'overlap' | 'eco'
export type PriorityEnum = 'low' | 'medium' | 'high'
export type EcoPriorityEnum = 'low' | 'medium' | 'high'
export type OptimizationStyleEnum = 'cost' | 'value' | 'eco' | 'balanced'
export type EcoTradeoffEnum = 'yes' | 'maybe' | 'no'

// ── Users ──────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  is_active: boolean
  onboarding_complete: boolean
  created_at: string
}

export interface UserCreate {
  name: string
}

// ── Providers ──────────────────────────────────────────────────────────────────

export interface Provider {
  id: number
  name: string
  website: string | null
  category: string
  logo_color: string
  is_consumer: boolean
  account_url: string | null
  billing_url: string | null
  link_notes: string | null
}

export interface Plan {
  id: number
  provider_id: number
  name: string
  price_monthly: number
  price_annual_total: number | null
  is_free: boolean
  notes: string | null
}

// ── Subscriptions ──────────────────────────────────────────────────────────────

export interface Subscription {
  id: number
  user_id: number | null
  provider_id: number
  plan_id: number | null
  custom_plan_name: string | null
  cost: number
  catalog_price_usd: number | null
  price_differs_from_catalog: boolean
  billing_interval: BillingIntervalEnum
  renewal_date: string
  status: StatusEnum
  usage_estimate: UsageEstimateEnum
  perceived_value: PerceivedValueEnum
  primary_use_case: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Enriched
  provider: Provider | null
  plan: Plan | null
  monthly_cost: number | null
  estimated_kwh_monthly: number | null
  estimated_co2e_kg_monthly: number | null
  co2_miles_equivalent_monthly: number | null
  compute_intensity_score: number | null
  water_liters_monthly: number | null
}

export interface SubscriptionCreate {
  provider_id: number
  plan_id?: number | null
  custom_plan_name?: string | null
  cost: number
  catalog_price_usd?: number | null
  price_differs_from_catalog?: boolean
  billing_interval: BillingIntervalEnum
  renewal_date: string
  status?: StatusEnum
  usage_estimate: UsageEstimateEnum
  perceived_value: PerceivedValueEnum
  primary_use_case?: string | null
  notes?: string | null
}

export interface SubscriptionUpdate extends Partial<SubscriptionCreate> {}

// ── Recommendations ────────────────────────────────────────────────────────────

export interface Recommendation {
  id: number
  user_id: number | null
  subscription_id: number
  rec_type: RecTypeEnum
  reason: string
  detail: string | null
  potential_savings_annual: number | null
  estimated_kwh_change: number | null
  estimated_co2e_change: number | null
  priority: PriorityEnum
  priority_score: number
  dismissed: boolean
  created_at: string
  provider: Provider | null
}

// ── Settings ───────────────────────────────────────────────────────────────────

export interface AppSettings {
  eco_priority: EcoPriorityEnum
  optimization_style: OptimizationStyleEnum
  eco_tradeoff: EcoTradeoffEnum
  carbon_intensity_kwh: string
  currency: string
}

export interface AppSettingsUpdate {
  eco_priority?: EcoPriorityEnum
  optimization_style?: OptimizationStyleEnum
  eco_tradeoff?: EcoTradeoffEnum
  carbon_intensity_kwh?: string
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

export interface OnboardingSubscriptionIn {
  provider_id: number
  plan_id: number | null
  custom_plan_name: string | null
  cost: number
  catalog_price_usd: number | null
  price_differs_from_catalog: boolean
  billing_interval: BillingIntervalEnum
  renewal_date: string
  usage_estimate: UsageEstimateEnum
  perceived_value: PerceivedValueEnum
  primary_use_case: string | null
  notes: string | null
}

export interface OnboardingComplete {
  subscriptions: OnboardingSubscriptionIn[]
  eco_priority: EcoPriorityEnum
  optimization_style: OptimizationStyleEnum
  eco_tradeoff: EcoTradeoffEnum
}
