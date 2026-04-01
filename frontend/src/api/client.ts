/**
 * API client entry point.
 *
 * Set VITE_USE_MOCK=true in a .env file to use the in-memory mock client
 * instead of the real FastAPI backend:
 *
 *   echo "VITE_USE_MOCK=true" > frontend/.env.local
 *
 * Both implementations export the same function signatures.
 */
import * as real from './real'
import * as mock from './mock'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

export const fetchProviders         = impl.fetchProviders
export const fetchPlansForProvider  = impl.fetchPlansForProvider
export const fetchSubscriptions     = impl.fetchSubscriptions
export const createSubscription     = impl.createSubscription
export const updateSubscription     = impl.updateSubscription
export const deleteSubscription     = impl.deleteSubscription
export const fetchPeriods           = impl.fetchPeriods
export const createPeriod           = impl.createPeriod
export const deletePeriod           = impl.deletePeriod
export const fetchEntries           = impl.fetchEntries
export const createEntry            = impl.createEntry
export const deleteEntry            = impl.deleteEntry
export const fetchRecommendations   = impl.fetchRecommendations
export const generateRecommendations = impl.generateRecommendations
export const dismissRecommendation  = impl.dismissRecommendation
export const fetchSettings          = impl.fetchSettings
export const updateSettings         = impl.updateSettings
export const getOnboardingStatus    = impl.getOnboardingStatus
export const completeOnboarding     = impl.completeOnboarding
