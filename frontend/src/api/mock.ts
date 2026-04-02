/**
 * Mock API client — returns realistic in-memory data.
 * Matches the same function signatures as real.ts.
 * Enable by setting VITE_USE_MOCK=true in your .env file.
 */
import type {
  AppSettings,
  AppSettingsUpdate,
  OnboardingComplete,
  Plan,
  Provider,
  Recommendation,
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  User,
  UserCreate,
  UsageEntry,
  UsagePeriod,
} from '../types'

// ── Simulated network delay ────────────────────────────────────────────────────
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

// ── Seed data ──────────────────────────────────────────────────────────────────

const PROVIDERS: Provider[] = [
  { id: 1,  name: 'ChatGPT',       website: 'https://chat.openai.com',              category: 'chat',   logo_color: '#10A37F', is_consumer: true },
  { id: 2,  name: 'Claude',        website: 'https://claude.ai',                    category: 'chat',   logo_color: '#D97706', is_consumer: true },
  { id: 3,  name: 'Gemini',        website: 'https://gemini.google.com',            category: 'chat',   logo_color: '#4285F4', is_consumer: true },
  { id: 4,  name: 'Perplexity',    website: 'https://perplexity.ai',               category: 'chat',   logo_color: '#20808D', is_consumer: true },
  { id: 5,  name: 'MidJourney',    website: 'https://midjourney.com',              category: 'image',  logo_color: '#7C3AED', is_consumer: true },
  { id: 6,  name: 'Adobe Firefly', website: 'https://firefly.adobe.com',           category: 'image',  logo_color: '#FF0000', is_consumer: true },
  { id: 7,  name: 'Suno',          website: 'https://suno.com',                    category: 'audio',  logo_color: '#EC4899', is_consumer: true },
  { id: 8,  name: 'Udio',          website: 'https://udio.com',                    category: 'audio',  logo_color: '#8B5CF6', is_consumer: true },
  { id: 9,  name: 'GitHub Copilot',website: 'https://github.com/features/copilot', category: 'coding', logo_color: '#24292E', is_consumer: true },
  { id: 10, name: 'Cursor',        website: 'https://cursor.sh',                   category: 'coding', logo_color: '#1A1A1A', is_consumer: true },
]

const PLANS: Plan[] = [
  // ChatGPT (provider_id: 1)
  { id: 1,  provider_id: 1, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: null },
  { id: 2,  provider_id: 1, name: 'Plus',          price_monthly: 20,   price_annual_total: null,  is_free: false, notes: 'GPT-4o, DALL·E. No annual option.' },
  { id: 3,  provider_id: 1, name: 'Pro',           price_monthly: 200,  price_annual_total: null,  is_free: false, notes: 'Highest limits, o1 pro mode. No annual option.' },
  { id: 4,  provider_id: 1, name: 'Business',      price_monthly: 30,   price_annual_total: 300,   is_free: false, notes: 'Per user/month ($25/user/mo billed annually).' },
  // Claude (provider_id: 2)
  { id: 5,  provider_id: 2, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: null },
  { id: 6,  provider_id: 2, name: 'Pro',           price_monthly: 20,   price_annual_total: 200,   is_free: false, notes: 'Priority access, extended context, Projects.' },
  { id: 7,  provider_id: 2, name: 'Max 5x',        price_monthly: 100,  price_annual_total: null,  is_free: false, notes: '5× usage limits of Pro.' },
  { id: 8,  provider_id: 2, name: 'Max 20x',       price_monthly: 200,  price_annual_total: null,  is_free: false, notes: '20× usage limits of Pro.' },
  { id: 9,  provider_id: 2, name: 'Team Standard', price_monthly: 25,   price_annual_total: 240,   is_free: false, notes: 'Per member/month ($20/member/mo billed annually).' },
  { id: 10, provider_id: 2, name: 'Team Premium',  price_monthly: 125,  price_annual_total: 1200,  is_free: false, notes: 'Per member/month ($100/member/mo billed annually).' },
  // Gemini (provider_id: 3)
  { id: 11, provider_id: 3, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: null },
  { id: 12, provider_id: 3, name: 'Advanced',      price_monthly: 19.99,price_annual_total: null,  is_free: false, notes: 'Gemini Ultra model, 2TB storage.' },
  // Perplexity (provider_id: 4)
  { id: 13, provider_id: 4, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: null },
  { id: 14, provider_id: 4, name: 'Pro',           price_monthly: 20,   price_annual_total: 200,   is_free: false, notes: 'Unlimited Pro search, file uploads.' },
  // MidJourney (provider_id: 5)
  { id: 15, provider_id: 5, name: 'Basic',         price_monthly: 10,   price_annual_total: 96,    is_free: false, notes: '~200 fast image generations/month.' },
  { id: 16, provider_id: 5, name: 'Standard',      price_monthly: 30,   price_annual_total: 288,   is_free: false, notes: '15 hr fast GPU + unlimited relaxed.' },
  { id: 17, provider_id: 5, name: 'Pro',           price_monthly: 60,   price_annual_total: 576,   is_free: false, notes: '30 hr fast GPU, stealth mode.' },
  { id: 18, provider_id: 5, name: 'Mega',          price_monthly: 120,  price_annual_total: 1152,  is_free: false, notes: '60 hr fast GPU.' },
  // Adobe Firefly (provider_id: 6)
  { id: 19, provider_id: 6, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: '25 generative credits/month.' },
  { id: 20, provider_id: 6, name: 'Premium',       price_monthly: 4.99, price_annual_total: 49.99, is_free: false, notes: '100 generative credits/month.' },
  // Suno (provider_id: 7)
  { id: 21, provider_id: 7, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: '~50 credits/day, non-commercial.' },
  { id: 22, provider_id: 7, name: 'Pro',           price_monthly: 8,    price_annual_total: 96,    is_free: false, notes: '2,500 credits/month, commercial use.' },
  { id: 23, provider_id: 7, name: 'Premier',       price_monthly: 30,   price_annual_total: 288,   is_free: false, notes: '10,000 credits/month.' },
  // Udio (provider_id: 8)
  { id: 24, provider_id: 8, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: '~100 credits/month.' },
  { id: 25, provider_id: 8, name: 'Standard',      price_monthly: 6,    price_annual_total: 60,    is_free: false, notes: '1,200 credits/month.' },
  { id: 26, provider_id: 8, name: 'Pro',           price_monthly: 14,   price_annual_total: 140,   is_free: false, notes: '4,800 credits/month.' },
  // GitHub Copilot (provider_id: 9)
  { id: 27, provider_id: 9, name: 'Free',          price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: '2,000 completions/month.' },
  { id: 28, provider_id: 9, name: 'Individual',    price_monthly: 10,   price_annual_total: 100,   is_free: false, notes: 'Unlimited completions and chat.' },
  { id: 29, provider_id: 9, name: 'Business',      price_monthly: 19,   price_annual_total: null,  is_free: false, notes: 'Per seat, org features.' },
  // Cursor (provider_id: 10)
  { id: 30, provider_id: 10, name: 'Hobby',        price_monthly: 0,    price_annual_total: null,  is_free: true,  notes: '2,000 completions, 50 slow requests.' },
  { id: 31, provider_id: 10, name: 'Pro',          price_monthly: 20,   price_annual_total: 192,   is_free: false, notes: 'Unlimited completions, 500 fast requests.' },
  { id: 32, provider_id: 10, name: 'Business',     price_monthly: 40,   price_annual_total: null,  is_free: false, notes: 'Per seat, privacy mode, SAML.' },
]

const today = new Date()
const daysFromNow = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// Plan lookups by position
const chatGPTProvider = PROVIDERS[0]  // id:1
const claudeProvider  = PROVIDERS[1]  // id:2
const mjProvider      = PROVIDERS[4]  // id:5
const sunoProvider    = PROVIDERS[6]  // id:7

const chatGPTPlusPlan  = PLANS[1]   // id:2  ChatGPT Plus
const claudeProPlan    = PLANS[5]   // id:6  Claude Pro
const mjStandardPlan   = PLANS[15]  // id:16 MidJourney Standard
const sunoProPlan      = PLANS[21]  // id:22 Suno Pro

let nextSubId = 5
let nextRecId = 5
let nextPeriodId = 2
let nextEntryId  = 3
let nextUserId   = 2

// ── Helpers ────────────────────────────────────────────────────────────────────

function findProvider(id: number): Provider | null {
  return PROVIDERS.find((p) => p.id === id) ?? null
}

function findPlan(id: number | null): Plan | null {
  if (id == null) return null
  return PLANS.find((p) => p.id === id) ?? null
}

const kwhTable: Record<string, Record<string, number>> = {
  chat:    { light: 0.45, moderate: 1.80, heavy: 5.40 },
  image:   { light: 0.60, moderate: 3.00, heavy: 10.0 },
  audio:   { light: 0.15, moderate: 0.60, heavy: 1.50 },
  video:   { light: 0.50, moderate: 2.00, heavy: 6.00 },
  coding:  { light: 0.30, moderate: 1.20, heavy: 3.60 },
  writing: { light: 0.30, moderate: 1.20, heavy: 3.60 },
}

function enrichSub(sub: Subscription): Subscription {
  const provider = findProvider(sub.provider_id)
  const plan = findPlan(sub.plan_id)
  const monthly_cost = sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost
  const category = provider?.category ?? 'chat'
  const kwh = (kwhTable[category] ?? kwhTable['chat'])[sub.usage_estimate] ?? 1.8
  const catalogDefault = sub.billing_interval === 'annual'
    ? (plan?.price_annual_total ?? null)
    : (plan?.price_monthly ?? null)
  return {
    ...sub,
    provider,
    plan,
    catalog_price_usd: sub.catalog_price_usd ?? catalogDefault,
    monthly_cost: parseFloat(monthly_cost.toFixed(2)),
    estimated_kwh_monthly: parseFloat(kwh.toFixed(3)),
    estimated_co2e_kg_monthly: parseFloat((kwh * 0.386).toFixed(4)),
  }
}

function makeEnrichedSub(
  id: number,
  provider: Provider,
  plan: Plan,
  cost: number,
  billing_interval: 'monthly' | 'annual',
  renewal_date: string,
  usage_estimate: 'light' | 'moderate' | 'heavy',
  perceived_value: 'low' | 'medium' | 'high',
  primary_use_case: string,
): Subscription {
  const catalog = billing_interval === 'annual'
    ? (plan.price_annual_total ?? plan.price_monthly * 12)
    : plan.price_monthly
  return enrichSub({
    id,
    user_id: 1,
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
    provider: null,
    plan: null,
    monthly_cost: null,
    estimated_kwh_monthly: null,
    estimated_co2e_kg_monthly: null,
  })
}

// ── In-memory state ────────────────────────────────────────────────────────────

let users: User[] = [
  { id: 1, name: 'Default', is_active: true, onboarding_complete: true, created_at: new Date().toISOString() },
]

let subscriptions: Subscription[] = [
  makeEnrichedSub(1, chatGPTProvider, chatGPTPlusPlan, 20, 'monthly', daysFromNow(12), 'heavy',    'high',   'Research, writing, and daily Q&A'),
  makeEnrichedSub(2, claudeProvider,  claudeProPlan,   20, 'monthly', daysFromNow(5),  'moderate', 'high',   'Long document analysis and coding help'),
  makeEnrichedSub(3, mjProvider,      mjStandardPlan,  30, 'monthly', daysFromNow(21), 'moderate', 'medium', 'Concept art and social media visuals'),
  makeEnrichedSub(4, sunoProvider,    sunoProPlan,      8, 'monthly', daysFromNow(18), 'light',    'medium', 'Background music for videos'),
]

let recommendations: Recommendation[] = [
  {
    id: 1, user_id: 1, subscription_id: 3, rec_type: 'annual',
    reason: 'Switch to annual billing and save ~$72/year',
    detail: 'You currently pay $30/month. The annual plan works out to $24/month ($288/year).',
    potential_savings_annual: 72, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'high', priority_score: 3, dismissed: false, created_at: new Date().toISOString(),
    provider: mjProvider,
  },
  {
    id: 2, user_id: 1, subscription_id: 4, rec_type: 'downgrade',
    reason: 'Light usage — the free tier might cover your Suno needs',
    detail: "You've marked your Suno usage as light. A free plan is available that may cover what you actually use, saving you ~$96/year.",
    potential_savings_annual: 96, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'medium', priority_score: 2, dismissed: false, created_at: new Date().toISOString(),
    provider: sunoProvider,
  },
  {
    // ONE overlap rec for the chat category, anchored to the most expensive sub
    id: 3, user_id: 1, subscription_id: 1, rec_type: 'overlap',
    reason: 'You have 2 overlapping chat AI subscriptions',
    detail: 'ChatGPT, Claude all serve similar chat purposes. Together they cost ~$40.00/month. Consider which one you rely on most and cancelling the others.',
    potential_savings_annual: 240, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'medium', priority_score: 2, dismissed: false, created_at: new Date().toISOString(),
    provider: chatGPTProvider,
  },
  {
    id: 4, user_id: 1, subscription_id: 2, rec_type: 'keep',
    reason: 'Claude looks like a good fit for you',
    detail: "You're actively using Claude and find it valuable. No changes needed here.",
    potential_savings_annual: null, estimated_kwh_change: null, estimated_co2e_change: null,
    priority: 'low', priority_score: 1, dismissed: false, created_at: new Date().toISOString(),
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
  eco_priority: 'medium',
  optimization_style: 'balanced',
  eco_tradeoff: 'maybe',
  carbon_intensity_kwh: '0.386',
  currency: 'USD',
}

// ── Users ───────────────────────────────────────────────────────────────────────

export const fetchUsers = async (): Promise<User[]> => {
  await delay()
  return [...users]
}

export const getActiveUser = async (): Promise<User> => {
  await delay()
  return users.find((u) => u.is_active) ?? users[0]
}

export const createUser = async (data: UserCreate): Promise<User> => {
  await delay()
  const user: User = {
    id: nextUserId++,
    name: data.name,
    is_active: false,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
  }
  users.push(user)
  return user
}

export const activateUser = async (id: number): Promise<User> => {
  await delay()
  users = users.map((u) => ({ ...u, is_active: u.id === id }))
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  return user
}

export const renameUser = async (id: number, data: UserCreate): Promise<User> => {
  await delay()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  user.name = data.name
  return { ...user }
}

export const deleteUser = async (id: number): Promise<void> => {
  await delay()
  users = users.filter((u) => u.id !== id)
  subscriptions = subscriptions.filter((s) => s.user_id !== id)
  recommendations = recommendations.filter((r) => r.user_id !== id)
}

export const deleteCurrentUser = async (): Promise<{ deleted: boolean; reset?: boolean; new_active_user_id: number }> => {
  await delay()
  const activeUser = users.find((u) => u.is_active) ?? users[0]
  const uid = activeUser.id
  const others = users.filter((u) => u.id !== uid)

  subscriptions = subscriptions.filter((s) => s.user_id !== uid)
  recommendations = recommendations.filter((r) => r.user_id !== uid)

  if (others.length > 0) {
    users = users.filter((u) => u.id !== uid)
    users = users.map((u, i) => ({ ...u, is_active: i === 0 }))
    return { deleted: true, new_active_user_id: users[0].id }
  } else {
    activeUser.onboarding_complete = false
    return { deleted: false, reset: true, new_active_user_id: uid }
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
  const activeUser = users.find((u) => u.is_active)
  const uid = activeUser?.id ?? 1
  return subscriptions.filter((s) => s.user_id === uid).map(enrichSub)
}

export const createSubscription = async (data: SubscriptionCreate): Promise<Subscription> => {
  await delay()
  const activeUser = users.find((u) => u.is_active)
  const sub: Subscription = {
    id: nextSubId++,
    user_id: activeUser?.id ?? 1,
    provider_id: data.provider_id,
    plan_id: data.plan_id ?? null,
    custom_plan_name: data.custom_plan_name ?? null,
    cost: data.cost,
    catalog_price_usd: data.catalog_price_usd ?? null,
    price_differs_from_catalog: data.price_differs_from_catalog ?? false,
    billing_interval: data.billing_interval,
    renewal_date: data.renewal_date,
    status: data.status ?? 'active',
    usage_estimate: data.usage_estimate,
    perceived_value: data.perceived_value,
    primary_use_case: data.primary_use_case ?? null,
    notes: data.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    provider: null,
    plan: null,
    monthly_cost: null,
    estimated_kwh_monthly: null,
    estimated_co2e_kg_monthly: null,
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
    ...data,
    id: nextEntryId++,
    estimated_kwh: data.estimated_kwh ?? parseFloat(kwh.toFixed(4)),
    estimated_co2e_kg: data.estimated_co2e_kg ?? parseFloat((kwh * 0.386).toFixed(4)),
  }
  entries.push(entry)
  return entry
}

export const deleteEntry = async (id: number): Promise<void> => {
  await delay()
  entries = entries.filter((e) => e.id !== id)
}

// ── Recommendations ────────────────────────────────────────────────────────────

export const fetchRecommendations = async (includeDismissed = false): Promise<Recommendation[]> => {
  await delay()
  const activeUser = users.find((u) => u.is_active)
  const uid = activeUser?.id ?? 1
  const filtered = recommendations.filter(
    (r) => r.user_id === uid && (includeDismissed || !r.dismissed),
  )
  return [...filtered].sort((a, b) => b.priority_score - a.priority_score)
}

export const generateRecommendations = async (): Promise<{ generated: number }> => {
  await delay(400)
  const activeUser = users.find((u) => u.is_active)
  const uid = activeUser?.id ?? 1
  const activeSubs = subscriptions.filter((s) => s.user_id === uid && s.status === 'active')
  const newRecs: Recommendation[] = []

  const PRIORITY_SCORE: Record<string, number> = { low: 1, medium: 2, high: 3 }

  // Annual billing savings
  for (const sub of activeSubs) {
    if (sub.billing_interval !== 'monthly') continue
    const plan = findPlan(sub.plan_id)
    if (plan?.price_annual_total) {
      const savings = sub.cost * 12 - plan.price_annual_total
      if (savings >= 5) {
        const priority = savings >= 20 ? 'high' : 'medium'
        newRecs.push({
          id: nextRecId++, user_id: uid, subscription_id: sub.id, rec_type: 'annual',
          reason: `Switch to annual billing and save ~$${savings.toFixed(0)}/year`,
          detail: `Annual plan is $${plan.price_annual_total}/year ($${(plan.price_annual_total / 12).toFixed(2)}/mo equivalent).`,
          potential_savings_annual: savings, estimated_kwh_change: null, estimated_co2e_change: null,
          priority: priority as 'high' | 'medium', priority_score: PRIORITY_SCORE[priority],
          dismissed: false, created_at: new Date().toISOString(),
          provider: findProvider(sub.provider_id),
        })
      }
    }
  }

  // Cancel low-value subs
  for (const sub of activeSubs) {
    if (sub.perceived_value !== 'low') continue
    const monthly = sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost
    const annualCost = monthly * 12
    const provider = findProvider(sub.provider_id)
    newRecs.push({
      id: nextRecId++, user_id: uid, subscription_id: sub.id, rec_type: 'cancel',
      reason: `You rated ${provider?.name ?? 'this service'} as low value — consider cancelling`,
      detail: `You're paying ~$${annualCost.toFixed(0)}/year but feel it's not worth it.`,
      potential_savings_annual: annualCost, estimated_kwh_change: null, estimated_co2e_change: null,
      priority: 'high', priority_score: 3,
      dismissed: false, created_at: new Date().toISOString(),
      provider,
    })
  }

  // Overlap detection — ONE rec per overlapping category
  const categoryGroups: Record<string, Subscription[]> = {}
  for (const sub of activeSubs) {
    const cat = findProvider(sub.provider_id)?.category
    if (cat && ['chat', 'coding', 'writing'].includes(cat)) {
      categoryGroups[cat] = categoryGroups[cat] ?? []
      categoryGroups[cat].push(sub)
    }
  }
  for (const [cat, group] of Object.entries(categoryGroups)) {
    if (group.length < 2) continue
    const names = group.map((s) => findProvider(s.provider_id)?.name ?? '').filter(Boolean)
    const monthlyOf = (s: Subscription) => s.billing_interval === 'annual' ? s.cost / 12 : s.cost
    const anchor = group.reduce((a, b) => monthlyOf(a) >= monthlyOf(b) ? a : b)
    const totalMonthly = group.reduce((sum, s) => sum + monthlyOf(s), 0)
    const cheapestMonthly = Math.min(...group.map(monthlyOf))
    newRecs.push({
      id: nextRecId++, user_id: uid, subscription_id: anchor.id, rec_type: 'overlap',
      reason: `You have ${group.length} overlapping ${cat} AI subscriptions`,
      detail: `${names.join(', ')} all serve similar ${cat} purposes. Together they cost ~$${totalMonthly.toFixed(2)}/month. Consider which one you rely on most.`,
      potential_savings_annual: parseFloat((cheapestMonthly * 12).toFixed(2)),
      estimated_kwh_change: null, estimated_co2e_change: null,
      priority: 'medium', priority_score: 2,
      dismissed: false, created_at: new Date().toISOString(),
      provider: findProvider(anchor.provider_id),
    })
  }

  // Keep — high value, moderate/heavy usage
  for (const sub of activeSubs) {
    if (sub.perceived_value === 'high' && (sub.usage_estimate === 'moderate' || sub.usage_estimate === 'heavy')) {
      const provider = findProvider(sub.provider_id)
      newRecs.push({
        id: nextRecId++, user_id: uid, subscription_id: sub.id, rec_type: 'keep',
        reason: `${provider?.name ?? 'This service'} looks like a good fit for you`,
        detail: `You're actively using it and find it valuable. No changes needed here.`,
        potential_savings_annual: null, estimated_kwh_change: null, estimated_co2e_change: null,
        priority: 'low', priority_score: 1,
        dismissed: false, created_at: new Date().toISOString(),
        provider,
      })
    }
  }

  // Replace only this user's non-dismissed recs
  recommendations = [
    ...recommendations.filter((r) => r.user_id !== uid || r.dismissed),
    ...newRecs,
  ]
  return { generated: newRecs.length }
}

export const dismissRecommendation = async (id: number): Promise<Recommendation> => {
  await delay()
  const rec = recommendations.find((r) => r.id === id)
  if (!rec) throw new Error('Recommendation not found')
  rec.dismissed = true
  return { ...rec }
}

// ── Settings ───────────────────────────────────────────────────────────────────

export const fetchSettings = async (): Promise<AppSettings> => {
  await delay()
  return { ...settings }
}

export const updateSettings = async (data: AppSettingsUpdate): Promise<AppSettings> => {
  await delay()
  settings = { ...settings, ...data }
  return { ...settings }
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

export const getOnboardingStatus = async (): Promise<{ complete: boolean; user_id: number }> => {
  await delay()
  const activeUser = users.find((u) => u.is_active) ?? users[0]
  return { complete: activeUser.onboarding_complete, user_id: activeUser.id }
}

export const completeOnboarding = async (data: OnboardingComplete): Promise<Subscription[]> => {
  await delay(500)
  const activeUser = users.find((u) => u.is_active) ?? users[0]
  const uid = activeUser.id

  // Non-destructive upsert: match by provider_id
  const existingByProvider: Record<number, Subscription> = {}
  for (const s of subscriptions.filter((s) => s.user_id === uid)) {
    existingByProvider[s.provider_id] = s
  }

  const upserted: Subscription[] = []
  for (const s of data.subscriptions) {
    const existing = existingByProvider[s.provider_id]
    if (existing) {
      Object.assign(existing, s, { updated_at: new Date().toISOString() })
      upserted.push(existing)
    } else {
      const sub: Subscription = {
        id: nextSubId++,
        user_id: uid,
        provider_id: s.provider_id,
        plan_id: s.plan_id ?? null,
        custom_plan_name: s.custom_plan_name ?? null,
        cost: s.cost,
        catalog_price_usd: s.catalog_price_usd ?? null,
        price_differs_from_catalog: s.price_differs_from_catalog ?? false,
        billing_interval: s.billing_interval,
        renewal_date: s.renewal_date,
        status: 'active',
        usage_estimate: s.usage_estimate,
        perceived_value: s.perceived_value,
        primary_use_case: s.primary_use_case ?? null,
        notes: s.notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        provider: null, plan: null,
        monthly_cost: null, estimated_kwh_monthly: null, estimated_co2e_kg_monthly: null,
      }
      subscriptions.push(sub)
      upserted.push(sub)
    }
  }

  settings = {
    ...settings,
    eco_priority: data.eco_priority,
    optimization_style: data.optimization_style,
    eco_tradeoff: data.eco_tradeoff,
  }

  activeUser.onboarding_complete = true

  return upserted.map(enrichSub)
}

export const resetOnboarding = async (): Promise<{ reset: boolean; subscriptions_deleted: number }> => {
  await delay()
  const activeUser = users.find((u) => u.is_active) ?? users[0]
  const uid = activeUser.id
  const before = subscriptions.filter((s) => s.user_id === uid).length
  subscriptions = subscriptions.filter((s) => s.user_id !== uid)
  recommendations = recommendations.filter((r) => r.user_id !== uid)
  activeUser.onboarding_complete = false
  return { reset: true, subscriptions_deleted: before }
}
