export interface Provider {
  id: number
  name: string
  website: string | null
  category: string
  logo_color: string
  is_consumer: boolean
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

export interface Subscription {
  id: number
  provider_id: number
  plan_id: number | null
  custom_plan_name: string | null
  cost: number
  catalog_price_usd: number | null
  price_differs_from_catalog: boolean
  billing_interval: 'monthly' | 'annual'
  renewal_date: string
  status: 'active' | 'paused' | 'cancelled'
  usage_estimate: 'light' | 'moderate' | 'heavy'
  perceived_value: 'low' | 'medium' | 'high'
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
}

export interface SubscriptionCreate {
  provider_id: number
  plan_id?: number | null
  custom_plan_name?: string | null
  cost: number
  catalog_price_usd?: number | null
  price_differs_from_catalog?: boolean
  billing_interval: 'monthly' | 'annual'
  renewal_date: string
  status?: string
  usage_estimate: 'light' | 'moderate' | 'heavy'
  perceived_value: 'low' | 'medium' | 'high'
  primary_use_case?: string | null
  notes?: string | null
}

export interface SubscriptionUpdate extends Partial<SubscriptionCreate> {}

export interface UsagePeriod {
  id: number
  subscription_id: number
  period_start: string
  period_end: string
  notes: string | null
  estimated_kwh: number | null
  estimated_co2e_kg: number | null
}

export interface UsageEntry {
  id: number
  period_id: number
  entry_date: string
  activity_type: string
  quantity: number
  unit: string
  notes: string | null
  estimated_kwh: number | null
  estimated_co2e_kg: number | null
}

export interface Recommendation {
  id: number
  subscription_id: number
  rec_type: 'upgrade' | 'downgrade' | 'keep' | 'annual' | 'cancel' | 'overlap' | 'eco'
  reason: string
  detail: string | null
  potential_savings_annual: number | null
  estimated_kwh_change: number | null
  estimated_co2e_change: number | null
  priority: 'low' | 'medium' | 'high'
  dismissed: boolean
  created_at: string
  provider: Provider | null
}

export interface AppSettings {
  onboarding_complete?: string
  currency?: string
  eco_priority?: string
  optimization_style?: string
  eco_tradeoff?: string
  carbon_intensity_kwh?: string
}

// Onboarding form state
export interface OnboardingSubscriptionIn {
  provider_id: number
  plan_id: number | null
  custom_plan_name: string | null
  cost: number
  catalog_price_usd: number | null
  price_differs_from_catalog: boolean
  billing_interval: 'monthly' | 'annual'
  renewal_date: string
  usage_estimate: 'light' | 'moderate' | 'heavy'
  perceived_value: 'low' | 'medium' | 'high'
  primary_use_case: string | null
  notes: string | null
}

export interface OnboardingComplete {
  subscriptions: OnboardingSubscriptionIn[]
  eco_priority: 'low' | 'medium' | 'high'
  optimization_style: 'cost' | 'value' | 'eco' | 'balanced'
  eco_tradeoff: 'yes' | 'maybe' | 'no'
}
