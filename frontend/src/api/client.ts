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

// Users
export const fetchUsers              = impl.fetchUsers
export const getActiveUser           = impl.getActiveUser
export const createUser              = impl.createUser
export const activateUser            = impl.activateUser
export const renameUser              = impl.renameUser
export const deleteUser              = impl.deleteUser
export const deleteCurrentUser       = impl.deleteCurrentUser

// Providers
export const fetchProviders          = impl.fetchProviders
export const fetchPlansForProvider   = impl.fetchPlansForProvider

// Subscriptions
export const fetchSubscriptions      = impl.fetchSubscriptions
export const createSubscription      = impl.createSubscription
export const updateSubscription      = impl.updateSubscription
export const deleteSubscription      = impl.deleteSubscription

// Usage
export const fetchPeriods            = impl.fetchPeriods
export const createPeriod            = impl.createPeriod
export const deletePeriod            = impl.deletePeriod
export const fetchEntries            = impl.fetchEntries
export const createEntry             = impl.createEntry
export const deleteEntry             = impl.deleteEntry

// Recommendations
export const fetchRecommendations    = impl.fetchRecommendations
export const generateRecommendations = impl.generateRecommendations
export const dismissRecommendation   = impl.dismissRecommendation

// Settings
export const fetchSettings           = impl.fetchSettings
export const updateSettings          = impl.updateSettings

// Onboarding
export const getOnboardingStatus     = impl.getOnboardingStatus
export const completeOnboarding      = impl.completeOnboarding
export const resetOnboarding         = impl.resetOnboarding
