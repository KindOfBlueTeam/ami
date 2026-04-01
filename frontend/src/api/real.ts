import axios from 'axios'
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

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Providers ──────────────────────────────────────────────────────────────────
export const fetchProviders = (): Promise<Provider[]> =>
  api.get('/providers').then((r) => r.data)

export const fetchPlansForProvider = (providerId: number): Promise<Plan[]> =>
  api.get(`/providers/${providerId}/plans`).then((r) => r.data)

// ── Subscriptions ──────────────────────────────────────────────────────────────
export const fetchSubscriptions = (): Promise<Subscription[]> =>
  api.get('/subscriptions').then((r) => r.data)

export const createSubscription = (data: SubscriptionCreate): Promise<Subscription> =>
  api.post('/subscriptions', data).then((r) => r.data)

export const updateSubscription = (
  id: number,
  data: SubscriptionUpdate,
): Promise<Subscription> => api.put(`/subscriptions/${id}`, data).then((r) => r.data)

export const deleteSubscription = (id: number): Promise<void> =>
  api.delete(`/subscriptions/${id}`)

// ── Usage ──────────────────────────────────────────────────────────────────────
export const fetchPeriods = (subscriptionId?: number): Promise<UsagePeriod[]> =>
  api.get('/usage/periods', { params: { subscription_id: subscriptionId } }).then((r) => r.data)

export const createPeriod = (data: Omit<UsagePeriod, 'id'>): Promise<UsagePeriod> =>
  api.post('/usage/periods', data).then((r) => r.data)

export const deletePeriod = (id: number): Promise<void> =>
  api.delete(`/usage/periods/${id}`)

export const fetchEntries = (periodId: number): Promise<UsageEntry[]> =>
  api.get(`/usage/periods/${periodId}/entries`).then((r) => r.data)

export const createEntry = (data: Omit<UsageEntry, 'id'>): Promise<UsageEntry> =>
  api.post('/usage/entries', data).then((r) => r.data)

export const deleteEntry = (id: number): Promise<void> =>
  api.delete(`/usage/entries/${id}`)

// ── Recommendations ────────────────────────────────────────────────────────────
export const fetchRecommendations = (
  includeDismissed = false,
): Promise<Recommendation[]> =>
  api
    .get('/recommendations', { params: { include_dismissed: includeDismissed } })
    .then((r) => r.data)

export const generateRecommendations = (): Promise<{ generated: number }> =>
  api.post('/recommendations/generate').then((r) => r.data)

export const dismissRecommendation = (id: number): Promise<Recommendation> =>
  api.put(`/recommendations/${id}/dismiss`).then((r) => r.data)

// ── Settings ───────────────────────────────────────────────────────────────────
export const fetchSettings = (): Promise<AppSettings> =>
  api.get('/settings').then((r) => r.data)

export const updateSettings = (data: Partial<AppSettings>): Promise<AppSettings> =>
  api.put('/settings', data).then((r) => r.data)

// ── Onboarding ─────────────────────────────────────────────────────────────────
export const getOnboardingStatus = (): Promise<{ complete: boolean }> =>
  api.get('/onboarding/status').then((r) => r.data)

export const completeOnboarding = (data: OnboardingComplete): Promise<Subscription[]> =>
  api.post('/onboarding/complete', data).then((r) => r.data)
