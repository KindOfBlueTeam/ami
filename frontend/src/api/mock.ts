/**
 * Mock API client — returns realistic in-memory data.
 * Matches the same function signatures as real.ts.
 * Enable by setting VITE_USE_MOCK=true in your .env file.
 */
import type {
  AppSettings,
  OnboardingComplete,
  Plan,
  Provider,
  Recommendation,
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  UsageEntry,
  UsagePeriod,
} from '../types'

// ── Simulated network delay ────────────────────────────────────────────────────
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

// ── Seed data ──────────────────────────────────────────────────────────────────

const PROVIDERS: Provider[] = [
  { id: 1, name: 'ChatGPT',       website: 'https://chat.openai.com',              category: 'chat',   logo_color: '#10A37F', is_consumer: true },
  { id: 2, name: 'Claude',        website: 'https://claude.ai',                    category: 'chat',   logo_color: '#D97706', is_consumer: true },
  { id: 3, name: 'Gemini',        website: 'https://gemini.google.com',            category: 'chat',   logo_color: '#4285F4', is_consumer: true },
  { id: 4, name: 'Perplexity',    website: 'https://perplexity.ai',               category: 'chat',   logo_color: '#20808D', is_consumer: true },
  { id: 5, name: 'MidJourney',    website: 'https://midjourney.com',              category: 'image',  logo_color: '#7C3AED', is_consumer: true },
  { id: 6, name: 'Adobe Firefly', website: 'https://firefly.adobe.com',           category: 'image',  logo_color: '#FF0000', is_consumer: true },
  { id: 7, name: 'Suno',          website: 'https://suno.com',                    category: 'audio',  logo_color: '#EC4899', is_consumer: true },
  { id: 8, name: 'Udio',          website: 'https://udio.com',                    category: 'audio',  logo_color: '#8B5CF6', is_consumer: true },
  { id: 9, name: 'GitHub Copilot',website: 'https://github.com/features/copilot', category: 'coding', logo_color: '#24292E', is_consumer: true },
  { id: 10, name: 'Cursor',       website: 'https://cursor.sh',                   category: 'coding', logo_color: '#1A1A1A', is_consumer: true },
]

const PLANS: Plan[] = [
  // ChatGPT
  { id: 1,  provider_id: 1, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: null },
  { id: 2,  provider_id: 1, name: 'Plus',          price_monthly: 20,   price_annual_total: null,   is_free: false, notes: 'GPT-4o, DALL·E. No annual option.' },
  { id: 3,  provider_id: 1, name: 'Pro',           price_monthly: 200,  price_annual_total: null,   is_free: false, notes: 'Highest limits, o1 pro mode. No annual option.' },
  { id: 4,  provider_id: 1, name: 'Business',      price_monthly: 30,   price_annual_total: 300,    is_free: false, notes: 'Per user/month ($25/user/mo billed annually).' },
  // Claude
  { id: 5,  provider_id: 2, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: null },
  { id: 6,  provider_id: 2, name: 'Pro',           price_monthly: 20,   price_annual_total: 200,    is_free: false, notes: 'Priority access, extended context, Projects.' },
  { id: 7,  provider_id: 2, name: 'Max 5x',        price_monthly: 100,  price_annual_total: null,   is_free: false, notes: '5× usage limits of Pro.' },
  { id: 8,  provider_id: 2, name: 'Max 20x',       price_monthly: 200,  price_annual_total: null,   is_free: false, notes: '20× usage limits of Pro.' },
  { id: 9,  provider_id: 2, name: 'Team Standard', price_monthly: 25,   price_annual_total: 240,    is_free: false, notes: 'Per member/month ($20/member/mo billed annually).' },
  { id: 10, provider_id: 2, name: 'Team Premium',  price_monthly: 125,  price_annual_total: 1200,   is_free: false, notes: 'Per member/month ($100/member/mo billed annually).' },
  // Gemini
  { id: 11, provider_id: 3, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: null },
  { id: 12, provider_id: 3, name: 'Advanced',      price_monthly: 19.99,price_annual_total: null,   is_free: false, notes: 'Gemini Ultra model, 2TB storage.' },
  // Perplexity
  { id: 13, provider_id: 4, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: null },
  { id: 14, provider_id: 4, name: 'Pro',           price_monthly: 20,   price_annual_total: 200,    is_free: false, notes: 'Unlimited Pro search, file uploads.' },
  // MidJourney
  { id: 15, provider_id: 5, name: 'Basic',         price_monthly: 10,   price_annual_total: 96,     is_free: false, notes: '~200 fast image generations/month.' },
  { id: 16, provider_id: 5, name: 'Standard',      price_monthly: 30,   price_annual_total: 288,    is_free: false, notes: '15 hr fast GPU + unlimited relaxed.' },
  { id: 17, provider_id: 5, name: 'Pro',           price_monthly: 60,   price_annual_total: 576,    is_free: false, notes: '30 hr fast GPU, stealth mode.' },
  { id: 18, provider_id: 5, name: 'Mega',          price_monthly: 120,  price_annual_total: 1152,   is_free: false, notes: '60 hr fast GPU.' },
  // Suno
  { id: 19, provider_id: 7, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: '~50 credits/day, non-commercial.' },
  { id: 20, provider_id: 7, name: 'Pro',           price_monthly: 8,    price_annual_total: 96,     is_free: false, notes: '2,500 credits/month, commercial use.' },
  { id: 21, provider_id: 7, name: 'Premier',       price_monthly: 30,   price_annual_total: 288,    is_free: false, notes: '10,000 credits/month.' },
  // GitHub Copilot
  { id: 22, provider_id: 9, name: 'Free',          price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: '2,000 completions/month.' },
  { id: 23, provider_id: 9, name: 'Individual',    price_monthly: 10,   price_annual_total: 100,    is_free: false, notes: 'Unlimited completions and chat.' },
  // Cursor
  { id: 24, provider_id: 10, name: 'Hobby',        price_monthly: 0,    price_annual_total: null,   is_free: true,  notes: '2,000 completions, 50 slow requests.' },
  { id: 25, provider_id: 10, name: 'Pro',          price_monthly: 20,   price_annual_total: 192,    is_free: false, notes: 'Unlimited completions, 500 fast requests.' },
]

const today = new Date()
const daysFromNow = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const chatGPTProvider = PROVIDERS[0]
const claudeProvider  = PROVIDERS[1]
const mjProvider      = PROVIDERS[4]
const sunoProvider    = PROVIDERS[6]

const chatGPTPlusPlan  = PLANS[1]   // ChatGPT Plus
const claudeProPlan    = PLANS[5]   // Claude Pro
const mjStandardPlan   = PLANS[15]  // MidJourney Standard
const sunoProPlan      = PLANS[19]  // Suno Pro

let nextSubId = 5

const makeEnrichedSub = (
  id: number,
  provider: Provider,
  plan: Plan,
  cost: number,
  billing_interval: 'monthly' | 'annual',
  renewal_date: string,
  usage_estimate: 'light' | 'moderate' | 'heavy',
  perceived_value: 'low' | 'medium' | 'high',
  primary_use_case: string,
): Subscription => {
  const catalog = billing_interval === 'annual' ? (plan.price_annual_total ?? plan.price_monthly * 12) : plan.price_monthly
  const monthly_cost = billing_interval === 'annual' ? cost / 12 : cost
  const kwhTable: Record<string, Record<string, number>> = {
    chat:   { light: 0.45, moderate: 1.80, heavy: 5.40 },
    image:  { light: 0.60, moderate: 3.00, heavy: 10.0 },
    audio:  { light: 0.15, moderate: 0.60, heavy: 1.50 },
    coding: { light: 0.30, moderate: 1.20, heavy: 3.60 },
  }
  const kwh = (kwhTable[provider.category] ?? kwhTable['chat'])[usage_estimate]
  return {
    id,
    provider_id: provider.id,
    plan_id: plan.id,
    custom_plan_name: null,
    cost,
    catalog_price_usd: catalog,
    price_differs_from_catalog: false,
    billing_interval,
    renewal_date,
    status: 'active',
    usage_estimate,
    perceived_value,
    primary_use_case,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    provider,
    plan,
    monthly_cost: parseFloat(monthly_cost.toFixed(2)),
    estimated_kwh_monthly: parseFloat(kwh.toFixed(3)),
    estimated_co2e_kg_monthly: parseFloat((kwh * 0.386).toFixed(4)),
  }
}

// Mutable in-memory store
let subscriptions: Subscription[] = [
  makeEnrichedSub(1, chatGPTProvider, chatGPTPlusPlan,  20, 'monthly', daysFromNow(12), 'heavy',    'high',   'Research, writing, and daily Q&A'),
  makeEnrichedSub(2, claudeProvider,  claudeProPlan,    20, 'monthly', daysFromNow(5),  'moderate', 'high',   'Long document analysis and coding help'),
  makeEnrichedSub(3, mjProvider,      mjStandardPlan,   30, 'monthly', daysFromNow(21), 'moderate', 'medium', 'Concept art and social media visuals'),
  makeEnrichedSub(4, sunoProvider,    sunoProPlan,       8, 'monthly', daysFromNow(18), 'light',    'medium', 'Background music for videos'),
]

let recommendations: Recommendation[] = [
  {
    id: 1, subscription_id: 3, rec_type: 'annual',
    reason: 'Switch to annual billing and save ~$72/year',
    detail: 'You currently pay $30/month. The annual plan works out to $24/month ($288/year).',
    potential_savings_annual: 72, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'high', dismissed: false, created_at: new Date().toISOString(),
    provider: mjProvider,
  },
  {
    id: 2, subscription_id: 4, rec_type: 'downgrade',
    reason: 'Light usage — the free tier might cover your Suno needs',
    detail: 'You\'ve marked your Suno usage as light. A free plan is available that may cover what you actually use, saving you ~$96/year.',
    potential_savings_annual: 96, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'medium', dismissed: false, created_at: new Date().toISOString(),
    provider: sunoProvider,
  },
  {
    id: 3, subscription_id: 1, rec_type: 'overlap',
    reason: 'You have 2 overlapping chat AI subscriptions',
    detail: 'ChatGPT, Claude all serve similar purposes. Consider which one you rely on most and cancelling the others.',
    potential_savings_annual: 240, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'medium', dismissed: false, created_at: new Date().toISOString(),
    provider: chatGPTProvider,
  },
  {
    id: 4, subscription_id: 2, rec_type: 'keep',
    reason: 'Claude looks like a good fit for you',
    detail: "You're actively using Claude and find it valuable. No changes needed here.",
    potential_savings_annual: null, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'low', dismissed: false, created_at: new Date().toISOString(),
    provider: claudeProvider,
  },
]

let periods: UsagePeriod[] = [
  { id: 1, subscription_id: 1, period_start: daysFromNow(-30), period_end: daysFromNow(0), notes: 'March', estimated_kwh: 5.4, estimated_co2e_kg: 2.08 },
]

let entries: UsageEntry[] = [
  { id: 1, period_id: 1, entry_date: daysFromNow(-15), activity_type: 'message', quantity: 300, unit: 'messages', notes: 'Typical fortnight', estimated_kwh: 0.9, estimated_co2e_kg: 0.347 },
  { id: 2, period_id: 1, entry_date: daysFromNow(-2),  activity_type: 'message', quantity: 280, unit: 'messages', notes: null, estimated_kwh: 0.84, estimated_co2e_kg: 0.324 },
]

let settings: AppSettings = {
  onboarding_complete: 'true',
  currency: 'USD',
  eco_priority: 'medium',
  optimization_style: 'balanced',
  eco_tradeoff: 'maybe',
  carbon_intensity_kwh: '0.386',
}

let nextRecId = 5
let nextPeriodId = 2
let nextEntryId = 3

// ── Helpers ────────────────────────────────────────────────────────────────────

function findProvider(id: number) {
  return PROVIDERS.find((p) => p.id === id) ?? null
}

function findPlan(id: number | null) {
  if (id == null) return null
  return PLANS.find((p) => p.id === id) ?? null
}

function enrichSub(sub: Subscription): Subscription {
  const provider = findProvider(sub.provider_id)
  const plan = findPlan(sub.plan_id)
  const monthly_cost = sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost
  const kwhTable: Record<string, Record<string, number>> = {
    chat:   { light: 0.45, moderate: 1.80, heavy: 5.40 },
    image:  { light: 0.60, moderate: 3.00, heavy: 10.0 },
    audio:  { light: 0.15, moderate: 0.60, heavy: 1.50 },
    coding: { light: 0.30, moderate: 1.20, heavy: 3.60 },
  }
  const category = provider?.category ?? 'chat'
  const kwh = (kwhTable[category] ?? kwhTable['chat'])[sub.usage_estimate] ?? 1.8
  const catalog = sub.billing_interval === 'annual'
    ? (plan?.price_annual_total ?? null)
    : (plan?.price_monthly ?? null)
  return {
    ...sub,
    provider,
    plan,
    catalog_price_usd: sub.catalog_price_usd ?? catalog,
    monthly_cost: parseFloat(monthly_cost.toFixed(2)),
    estimated_kwh_monthly: parseFloat(kwh.toFixed(3)),
    estimated_co2e_kg_monthly: parseFloat((kwh * 0.386).toFixed(4)),
  }
}

// ── Providers ──────────────────────────────────────────────────────────────────

export const fetchProviders = async (): Promise<Provider[]> => {
  await delay()
  return PROVIDERS
}

export const fetchPlansForProvider = async (providerId: number): Promise<Plan[]> => {
  await delay()
  return PLANS.filter((p) => p.provider_id === providerId)
}

// ── Subscriptions ──────────────────────────────────────────────────────────────

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  await delay()
  return subscriptions.map(enrichSub)
}

export const createSubscription = async (data: SubscriptionCreate): Promise<Subscription> => {
  await delay()
  const sub: Subscription = {
    id: nextSubId++,
    plan_id: data.plan_id ?? null,
    custom_plan_name: data.custom_plan_name ?? null,
    status: data.status ?? 'active',
    notes: data.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    provider: null,
    plan: null,
    monthly_cost: null,
    estimated_kwh_monthly: null,
    estimated_co2e_kg_monthly: null,
    ...data,
  }
  subscriptions.push(sub)
  return enrichSub(sub)
}

export const updateSubscription = async (
  id: number,
  data: SubscriptionUpdate,
): Promise<Subscription> => {
  await delay()
  const idx = subscriptions.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error('Subscription not found')
  subscriptions[idx] = { ...subscriptions[idx], ...data, updated_at: new Date().toISOString() }
  return enrichSub(subscriptions[idx])
}

export const deleteSubscription = async (id: number): Promise<void> => {
  await delay()
  subscriptions = subscriptions.filter((s) => s.id !== id)
}

// ── Usage ──────────────────────────────────────────────────────────────────────

export const fetchPeriods = async (subscriptionId?: number): Promise<UsagePeriod[]> => {
  await delay()
  return subscriptionId
    ? periods.filter((p) => p.subscription_id === subscriptionId)
    : periods
}

export const createPeriod = async (data: Omit<UsagePeriod, 'id'>): Promise<UsagePeriod> => {
  await delay()
  const period: UsagePeriod = { id: nextPeriodId++, ...data }
  periods.push(period)
  return period
}

export const deletePeriod = async (id: number): Promise<void> => {
  await delay()
  periods = periods.filter((p) => p.id !== id)
  entries = entries.filter((e) => e.period_id !== id)
}

export const fetchEntries = async (periodId: number): Promise<UsageEntry[]> => {
  await delay()
  return entries.filter((e) => e.period_id === periodId)
}

export const createEntry = async (data: Omit<UsageEntry, 'id'>): Promise<UsageEntry> => {
  await delay()
  const kwhRates: Record<string, number> = {
    message: 0.003, image: 0.020, audio_min: 0.005, video_min: 0.015, session: 0.030,
  }
  const kwh = (kwhRates[data.activity_type] ?? 0.003) * data.quantity
  const entry: UsageEntry = {
    id: nextEntryId++,
    estimated_kwh: parseFloat(kwh.toFixed(4)),
    estimated_co2e_kg: parseFloat((kwh * 0.386).toFixed(4)),
    ...data,
  }
  entries.push(entry)
  return entry
}

export const deleteEntry = async (id: number): Promise<void> => {
  await delay()
  entries = entries.filter((e) => e.id !== id)
}

// ── Recommendations ────────────────────────────────────────────────────────────

export const fetchRecommendations = async (
  includeDismissed = false,
): Promise<Recommendation[]> => {
  await delay()
  return includeDismissed ? recommendations : recommendations.filter((r) => !r.dismissed)
}

export const generateRecommendations = async (): Promise<{ generated: number }> => {
  await delay(400)
  // Re-run a simplified version of the engine against current subscriptions
  const newRecs: Recommendation[] = []

  // Overlap: multiple chat subs
  const chatSubs = subscriptions.filter(
    (s) => s.status === 'active' && findProvider(s.provider_id)?.category === 'chat',
  )
  if (chatSubs.length > 1) {
    chatSubs.forEach((s) => {
      newRecs.push({
        id: nextRecId++, subscription_id: s.id, rec_type: 'overlap',
        reason: `You have ${chatSubs.length} overlapping chat AI subscriptions`,
        detail: `${chatSubs.map((x) => findProvider(x.provider_id)?.name).join(', ')} all serve similar purposes.`,
        potential_savings_annual: Math.min(...chatSubs.map((x) => x.cost)) * 12,
        estimated_kwh_change: null, estimated_co2e_change: null,
        priority: 'medium', dismissed: false, created_at: new Date().toISOString(),
        provider: findProvider(s.provider_id),
      })
    })
  }

  // Annual savings
  subscriptions.filter((s) => s.status === 'active' && s.billing_interval === 'monthly').forEach((s) => {
    const plan = findPlan(s.plan_id)
    if (plan?.price_annual_total) {
      const savings = s.cost * 12 - plan.price_annual_total
      if (savings >= 5) {
        newRecs.push({
          id: nextRecId++, subscription_id: s.id, rec_type: 'annual',
          reason: `Switch to annual billing and save ~$${savings.toFixed(0)}/year`,
          detail: `Annual plan is $${plan.price_annual_total}/year ($${(plan.price_annual_total / 12).toFixed(2)}/mo equivalent).`,
          potential_savings_annual: savings,
          estimated_kwh_change: null, estimated_co2e_change: null,
          priority: savings >= 20 ? 'high' : 'medium',
          dismissed: false, created_at: new Date().toISOString(),
          provider: findProvider(s.provider_id),
        })
      }
    }
  })

  recommendations = newRecs
  return { generated: newRecs.length }
}

export const dismissRecommendation = async (id: number): Promise<Recommendation> => {
  await delay()
  const rec = recommendations.find((r) => r.id === id)
  if (!rec) throw new Error('Recommendation not found')
  rec.dismissed = true
  return rec
}

// ── Settings ───────────────────────────────────────────────────────────────────

export const fetchSettings = async (): Promise<AppSettings> => {
  await delay()
  return { ...settings }
}

export const updateSettings = async (data: Partial<AppSettings>): Promise<AppSettings> => {
  await delay()
  settings = { ...settings, ...data }
  return { ...settings }
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

export const getOnboardingStatus = async (): Promise<{ complete: boolean }> => {
  await delay()
  return { complete: settings.onboarding_complete === 'true' }
}

export const completeOnboarding = async (data: OnboardingComplete): Promise<Subscription[]> => {
  await delay(500)
  // Replace subscriptions with onboarding data
  subscriptions = []
  nextSubId = 1
  data.subscriptions.forEach((s) => {
    const sub: Subscription = {
      id: nextSubId++,
      plan_id: s.plan_id ?? null,
      custom_plan_name: s.custom_plan_name ?? null,
      status: 'active',
      notes: s.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: null, plan: null,
      monthly_cost: null, estimated_kwh_monthly: null, estimated_co2e_kg_monthly: null,
      ...s,
    }
    subscriptions.push(sub)
  })
  settings = {
    ...settings,
    eco_priority: data.eco_priority,
    optimization_style: data.optimization_style,
    eco_tradeoff: data.eco_tradeoff,
    onboarding_complete: 'true',
  }
  return subscriptions.map(enrichSub)
}
