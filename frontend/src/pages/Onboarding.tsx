import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addMonths } from 'date-fns'
import clsx from 'clsx'
import {
  fetchProviders,
  fetchPlansForProvider,
  completeOnboarding,
} from '../api/client'
import type { OnboardingComplete, OnboardingSubscriptionIn, Provider, Plan } from '../types'

// ── Step types ─────────────────────────────────────────────────────────────────

type Step =
  | 'welcome'
  | 'how-it-works'
  | 'select-services'
  | 'setup-service'
  | 'profile'
  | 'summary'

interface ServiceDraft extends Partial<OnboardingSubscriptionIn> {
  provider: Provider
  selectedPlan?: Plan | null
  priceConfirmed?: boolean   // user has tapped "looks right" or entered a custom amount
  priceEditing?: boolean     // user chose "I pay a different amount"
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

function nextMonth() {
  return format(addMonths(new Date(), 1), 'yyyy-MM-dd')
}

const CATEGORY_ICONS: Record<string, string> = {
  chat:    '💬',
  image:   '🎨',
  audio:   '🎵',
  video:   '🎬',
  coding:  '⌨',
  writing: '✍',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i < current ? 'bg-sage-500' : i === current ? 'bg-sage-400' : 'bg-slate-200',
          )}
        />
      ))}
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-slate-100 shadow-sm p-8', className)}>
      {children}
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-500 text-sm leading-relaxed">{children}</p>
}

// ── Service setup mini-form ────────────────────────────────────────────────────

/** Returns the catalog price for the given plan + billing interval */
function getCatalogPrice(plan: Plan | null | undefined, interval: string): number | null {
  if (!plan) return null
  if (plan.is_free) return 0
  if (interval === 'annual' && plan.price_annual_total != null) return plan.price_annual_total
  return plan.price_monthly
}

function ServiceSetup({
  draft,
  onChange,
}: {
  draft: ServiceDraft
  onChange: (d: ServiceDraft) => void
}) {
  const { data: plans = [] } = useQuery({
    queryKey: ['plans', draft.provider.id],
    queryFn: () => fetchPlansForProvider(draft.provider.id),
  })

  const hasAnnualOption = (draft.selectedPlan?.price_annual_total ?? null) != null
  const currentInterval = draft.billing_interval ?? 'monthly'
  const catalogPrice = getCatalogPrice(draft.selectedPlan, currentInterval)

  const handlePlanSelect = (plan: Plan | null) => {
    const interval = 'monthly'
    const catalog = getCatalogPrice(plan, interval)
    onChange({
      ...draft,
      selectedPlan: plan,
      plan_id: plan?.id ?? null,
      custom_plan_name: plan ? null : '',
      billing_interval: interval,
      cost: catalog ?? 0,
      catalog_price_usd: catalog,
      price_differs_from_catalog: false,
      priceConfirmed: plan?.is_free ?? false,
      priceEditing: false,
    })
  }

  const handleIntervalChange = (interval: 'monthly' | 'annual') => {
    const catalog = getCatalogPrice(draft.selectedPlan, interval)
    onChange({
      ...draft,
      billing_interval: interval,
      cost: catalog ?? draft.cost ?? 0,
      catalog_price_usd: catalog,
      price_differs_from_catalog: false,
      priceConfirmed: draft.selectedPlan?.is_free ?? false,
      priceEditing: false,
    })
  }

  const handleConfirmPrice = () => {
    onChange({
      ...draft,
      cost: catalogPrice ?? 0,
      catalog_price_usd: catalogPrice,
      price_differs_from_catalog: false,
      priceConfirmed: true,
      priceEditing: false,
    })
  }

  const handleCustomPrice = (value: string) => {
    const parsed = parseFloat(value) || 0
    onChange({
      ...draft,
      cost: parsed,
      price_differs_from_catalog: parsed !== (catalogPrice ?? 0),
      priceConfirmed: true,
    })
  }

  return (
    <div className="space-y-5">
      {/* 1. Plan selection */}
      <div>
        <label className="label">Plan</label>
        <div className="grid grid-cols-2 gap-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              className={clsx(
                'text-left p-3 rounded-lg border text-sm transition-colors',
                draft.plan_id === plan.id
                  ? 'border-sage-400 bg-sage-400/5 text-sage-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700',
              )}
            >
              <span className="font-medium">{plan.name}</span>
              <span className="block text-xs text-slate-400 mt-0.5">
                {plan.is_free
                  ? 'Free'
                  : plan.price_annual_total
                  ? `$${plan.price_monthly}/mo or $${plan.price_annual_total}/yr`
                  : `$${plan.price_monthly}/mo`}
              </span>
            </button>
          ))}
          <button
            onClick={() => handlePlanSelect(null)}
            className={clsx(
              'text-left p-3 rounded-lg border text-sm transition-colors',
              draft.selectedPlan === null && draft.plan_id === null
                ? 'border-sage-400 bg-sage-400/5'
                : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <span className="font-medium text-slate-700">Other / Custom</span>
            <span className="block text-xs text-slate-400 mt-0.5">Enter manually</span>
          </button>
        </div>

        {draft.selectedPlan === null && draft.custom_plan_name !== undefined && (
          <input
            className="input mt-2"
            placeholder="Plan name"
            value={draft.custom_plan_name ?? ''}
            onChange={(e) => onChange({ ...draft, custom_plan_name: e.target.value })}
          />
        )}
      </div>

      {/* 2. Billing interval — only shown when the plan offers annual */}
      {draft.selectedPlan && !draft.selectedPlan.is_free && hasAnnualOption && (
        <div>
          <label className="label">How are you billed?</label>
          <div className="grid grid-cols-2 gap-2">
            {(['monthly', 'annual'] as const).map((interval) => {
              const price = getCatalogPrice(draft.selectedPlan, interval)
              return (
                <button
                  key={interval}
                  onClick={() => handleIntervalChange(interval)}
                  className={clsx(
                    'text-left p-3 rounded-lg border text-sm transition-colors capitalize',
                    currentInterval === interval
                      ? 'border-sage-400 bg-sage-400/5 text-sage-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700',
                  )}
                >
                  <span className="font-medium block">{interval}</span>
                  <span className="text-xs text-slate-400">
                    {interval === 'annual'
                      ? `$${price}/yr · $${((price ?? 0) / 12).toFixed(2)}/mo`
                      : `$${price}/mo`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Price verification — shown once a paid plan is selected */}
      {draft.selectedPlan && !draft.selectedPlan.is_free && catalogPrice !== null && (
        <div>
          <label className="label">Price check</label>
          {!draft.priceConfirmed ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-700 mb-1">
                <strong>{draft.selectedPlan.name}</strong> is typically{' '}
                <strong>
                  ${catalogPrice.toFixed(2)}/{currentInterval === 'annual' ? 'year' : 'month'}
                </strong>
                {currentInterval === 'annual' && draft.selectedPlan.price_annual_total
                  ? ` ($${(draft.selectedPlan.price_annual_total / 12).toFixed(2)}/mo equivalent)`
                  : null}
                . Does that match what you pay?
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Ami pre-fills common plan prices, but promos, grandfathered rates, and
                regional pricing vary — always confirm.
              </p>
              <div className="flex gap-2">
                <button className="btn-primary text-xs py-1.5 px-4" onClick={handleConfirmPrice}>
                  Yes, that's right
                </button>
                <button
                  className="btn-secondary text-xs py-1.5 px-4"
                  onClick={() => onChange({ ...draft, priceEditing: true, priceConfirmed: true })}
                >
                  I pay a different amount
                </button>
              </div>
            </div>
          ) : draft.priceEditing ? (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input pl-7"
                  placeholder={String(catalogPrice)}
                  value={draft.cost ?? ''}
                  onChange={(e) => handleCustomPrice(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                per {currentInterval === 'annual' ? 'year' : 'month'} · catalog default is $
                {catalogPrice.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-sage-400/5 border border-sage-400/30 px-4 py-2.5">
              <span className="text-sm text-sage-700 font-medium">
                ${(draft.cost ?? 0).toFixed(2)}/{currentInterval === 'annual' ? 'yr' : 'mo'}
                {draft.price_differs_from_catalog && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (catalog: ${catalogPrice.toFixed(2)})
                  </span>
                )}
              </span>
              <button
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => onChange({ ...draft, priceConfirmed: false, priceEditing: false })}
              >
                Change
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3b. Manual cost entry for custom / unknown plans */}
      {draft.selectedPlan === null && (
        <div>
          <label className="label">What do you pay?</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input pl-7"
                placeholder="0.00"
                value={draft.cost ?? ''}
                onChange={(e) => onChange({ ...draft, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <select
              className="input w-36"
              value={currentInterval}
              onChange={(e) =>
                onChange({ ...draft, billing_interval: e.target.value as 'monthly' | 'annual' })
              }
            >
              <option value="monthly">/ month</option>
              <option value="annual">/ year</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Renewal date */}
      <div>
        <label className="label">Next renewal date</label>
        <input
          type="date"
          className="input"
          value={draft.renewal_date ?? nextMonth()}
          onChange={(e) => onChange({ ...draft, renewal_date: e.target.value })}
        />
      </div>

      {/* 5. Usage estimate */}
      <div>
        <label className="label">How often do you use it?</label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'moderate', 'heavy'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onChange({ ...draft, usage_estimate: level })}
              className={clsx(
                'p-3 rounded-lg border text-sm transition-colors capitalize',
                draft.usage_estimate === level
                  ? 'border-sage-400 bg-sage-400/5 text-sage-700 font-medium'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600',
              )}
            >
              {level === 'light' && <span className="block text-base mb-1">○</span>}
              {level === 'moderate' && <span className="block text-base mb-1">◑</span>}
              {level === 'heavy' && <span className="block text-base mb-1">●</span>}
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Light = occasional; Moderate = a few times/week; Heavy = daily
        </p>
      </div>

      {/* 6. Perceived value */}
      <div>
        <label className="label">How valuable does it feel?</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChange({ ...draft, perceived_value: v })}
              className={clsx(
                'p-2.5 rounded-lg border text-sm transition-colors capitalize',
                draft.perceived_value === v
                  ? 'border-sage-400 bg-sage-400/5 text-sage-700 font-medium'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Primary use case */}
      <div>
        <label className="label">
          What do you mainly use it for?{' '}
          <span className="normal-case font-normal text-slate-400">(optional)</span>
        </label>
        <input
          className="input"
          placeholder="e.g. writing, research, image creation…"
          value={draft.primary_use_case ?? ''}
          onChange={(e) => onChange({ ...draft, primary_use_case: e.target.value })}
        />
      </div>
    </div>
  )
}

// ── Main Onboarding component ──────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>('welcome')
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([])
  const [currentServiceIdx, setCurrentServiceIdx] = useState(0)
  const [drafts, setDrafts] = useState<ServiceDraft[]>([])
  const [ecoProfile, setEcoProfile] = useState({
    eco_priority: 'medium' as 'low' | 'medium' | 'high',
    optimization_style: 'balanced' as 'cost' | 'value' | 'eco' | 'balanced',
    eco_tradeoff: 'maybe' as 'yes' | 'maybe' | 'no',
  })

  const { data: providers = [], isLoading: providersLoading, isError: providersError, refetch: refetchProviders } = useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
    retry: 2,
  })

  const finishMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      navigate('/dashboard')
    },
  })

  // ── Step transitions ──────────────────────────────────────────────────────

  const handleSelectServices = () => {
    if (selectedProviderIds.length === 0) return
    const selected = providers.filter((p) => selectedProviderIds.includes(p.id))
    setDrafts(
      selected.map((p) => ({
        provider: p,
        provider_id: p.id,
        plan_id: null,
        selectedPlan: undefined,
        custom_plan_name: null,
        cost: 0,
        catalog_price_usd: null,
        price_differs_from_catalog: false,
        billing_interval: 'monthly' as const,
        renewal_date: nextMonth(),
        usage_estimate: 'moderate' as const,
        perceived_value: 'medium' as const,
        primary_use_case: null,
        notes: null,
        priceConfirmed: false,
        priceEditing: false,
      })),
    )
    setCurrentServiceIdx(0)
    setStep('setup-service')
  }

  const handleNextService = () => {
    if (currentServiceIdx < drafts.length - 1) {
      setCurrentServiceIdx((i) => i + 1)
    } else {
      setStep('profile')
    }
  }

  const handleFinish = () => {
    const payload: OnboardingComplete = {
      subscriptions: drafts.map((d) => ({
        provider_id: d.provider.id,
        plan_id: d.plan_id ?? null,
        custom_plan_name: d.custom_plan_name ?? null,
        cost: d.cost ?? 0,
        catalog_price_usd: d.catalog_price_usd ?? null,
        price_differs_from_catalog: d.price_differs_from_catalog ?? false,
        billing_interval: d.billing_interval ?? 'monthly',
        renewal_date: d.renewal_date ?? nextMonth(),
        usage_estimate: d.usage_estimate ?? 'moderate',
        perceived_value: d.perceived_value ?? 'medium',
        primary_use_case: d.primary_use_case ?? null,
        notes: d.notes ?? null,
      })),
      ...ecoProfile,
    }
    finishMutation.mutate(payload)
  }

  const toggleProvider = (id: number) => {
    setSelectedProviderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // ── Summary calculations ──────────────────────────────────────────────────

  const totalMonthly = drafts.reduce((sum, d) => {
    const c = d.cost ?? 0
    return sum + (d.billing_interval === 'annual' ? c / 12 : c)
  }, 0)

  // ── Render ────────────────────────────────────────────────────────────────

  const TOTAL_STEPS = 5

  const stepIndex: Record<Step, number> = {
    welcome: 0,
    'how-it-works': 1,
    'select-services': 2,
    'setup-service': 3,
    profile: 4,
    summary: 5,
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {step !== 'welcome' && step !== 'summary' && (
          <ProgressDots
            current={stepIndex[step]}
            total={TOTAL_STEPS}
          />
        )}

        {/* ── Welcome ─────────────────────────────────────────────────── */}
        {step === 'welcome' && (
          <Card className="text-center">
            <div className="text-5xl mb-6">🌿</div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-3">Hi, I'm Ami</h1>
            <Prose>
              I help you keep track of your AI subscriptions — what they cost, how
              much you use them, and their estimated environmental footprint.
            </Prose>
            <Prose>
              Everything stays on your device. No accounts, no cloud sync.
            </Prose>
            <button
              className="btn-primary mt-8 px-8 py-3 text-base"
              onClick={() => setStep('how-it-works')}
            >
              Get started
            </button>
          </Card>
        )}

        {/* ── How it works ─────────────────────────────────────────────── */}
        {step === 'how-it-works' && (
          <Card>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">A quick note</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-sage-500 mt-0.5">⟲</span>
                <Prose>
                  Consumer AI apps — ChatGPT, Claude, MidJourney, Suno — don't offer public
                  billing or usage APIs. Ami can't auto-import your data.
                </Prose>
              </div>
              <div className="flex gap-3">
                <span className="text-sage-500 mt-0.5">✎</span>
                <Prose>
                  You'll enter your subscriptions manually. It takes about two minutes, and you
                  can update them any time.
                </Prose>
              </div>
              <div className="flex gap-3">
                <span className="text-sage-500 mt-0.5">🔒</span>
                <Prose>
                  All data is stored in a local SQLite file on your machine. Ami never
                  touches the network.
                </Prose>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button className="btn-secondary" onClick={() => setStep('welcome')}>
                Back
              </button>
              <button className="btn-primary flex-1" onClick={() => setStep('select-services')}>
                Sounds good →
              </button>
            </div>
          </Card>
        )}

        {/* ── Select services ───────────────────────────────────────────── */}
        {step === 'select-services' && (
          <Card>
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              Which AI services do you pay for?
            </h2>
            <Prose>Select everything you have an active subscription for, including free plans.</Prose>

            {providersLoading && (
              <p className="text-sm text-slate-400 mt-6">Loading services…</p>
            )}

            {providersError && (
              <div className="mt-6 rounded-lg bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-red-700 font-medium mb-1">Couldn't reach the backend</p>
                <p className="text-xs text-red-500 mb-3">
                  Make sure the backend is running:{' '}
                  <code className="font-mono">uvicorn main:app --host 127.0.0.1 --port 8000</code>
                </p>
                <button className="btn-secondary text-xs py-1" onClick={() => refetchProviders()}>
                  Retry
                </button>
              </div>
            )}

            {!providersLoading && !providersError && providers.length === 0 && (
              <div className="mt-6 rounded-lg bg-amber-50 border border-amber-100 p-4">
                <p className="text-sm text-amber-700 font-medium mb-1">No services in database</p>
                <p className="text-xs text-amber-600">
                  Run the seed script:{' '}
                  <code className="font-mono">python seed.py</code>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-6">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleProvider(p.id)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-colors',
                    selectedProviderIds.includes(p.id)
                      ? 'border-sage-400 bg-sage-400/8 text-sage-800'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700',
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
                    style={{ backgroundColor: p.logo_color }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium block">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      {CATEGORY_ICONS[p.category]} {p.category}
                    </span>
                  </div>
                  {selectedProviderIds.includes(p.id) && (
                    <span className="ml-auto text-sage-500 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button className="btn-secondary" onClick={() => setStep('how-it-works')}>
                Back
              </button>
              <button
                className="btn-primary flex-1"
                disabled={selectedProviderIds.length === 0}
                onClick={handleSelectServices}
              >
                Set up {selectedProviderIds.length > 0 ? selectedProviderIds.length : ''} service
                {selectedProviderIds.length !== 1 ? 's' : ''} →
              </button>
            </div>
          </Card>
        )}

        {/* ── Setup each service ────────────────────────────────────────── */}
        {step === 'setup-service' && drafts[currentServiceIdx] && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: drafts[currentServiceIdx].provider.logo_color }}
              >
                {drafts[currentServiceIdx].provider.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Service {currentServiceIdx + 1} of {drafts.length}
                </p>
                <h2 className="text-lg font-semibold text-slate-800">
                  {drafts[currentServiceIdx].provider.name}
                </h2>
              </div>
            </div>

            <ServiceSetup
              draft={drafts[currentServiceIdx]}
              onChange={(updated) => {
                const next = [...drafts]
                next[currentServiceIdx] = updated
                setDrafts(next)
              }}
            />

            <div className="flex gap-3 mt-8">
              <button
                className="btn-secondary"
                onClick={() => {
                  if (currentServiceIdx > 0) {
                    setCurrentServiceIdx((i) => i - 1)
                  } else {
                    setStep('select-services')
                  }
                }}
              >
                Back
              </button>
              <button className="btn-primary flex-1" onClick={handleNextService}>
                {currentServiceIdx < drafts.length - 1 ? 'Next service →' : 'Continue →'}
              </button>
            </div>
          </Card>
        )}

        {/* ── Profile ───────────────────────────────────────────────────── */}
        {step === 'profile' && (
          <Card>
            <h2 className="text-xl font-semibold text-slate-800 mb-1">A few more things</h2>
            <Prose>This helps Ami tailor recommendations to what you actually care about.</Prose>

            <div className="space-y-6 mt-6">
              {/* Eco priority */}
              <div>
                <label className="label">How much does environmental impact matter to you?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((v) => {
                    const labels = { low: 'Not much', medium: 'Somewhat', high: 'A lot' }
                    return (
                      <button
                        key={v}
                        onClick={() => setEcoProfile((p) => ({ ...p, eco_priority: v }))}
                        className={clsx(
                          'p-3 rounded-lg border text-sm transition-colors',
                          ecoProfile.eco_priority === v
                            ? 'border-sage-400 bg-sage-400/5 text-sage-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600',
                        )}
                      >
                        {labels[v]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Optimization style */}
              <div>
                <label className="label">What matters most in your recommendations?</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { v: 'cost', label: 'Save money' },
                      { v: 'value', label: 'Maximize value' },
                      { v: 'eco', label: 'Reduce eco impact' },
                      { v: 'balanced', label: 'Balanced' },
                    ] as const
                  ).map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => setEcoProfile((p) => ({ ...p, optimization_style: v }))}
                      className={clsx(
                        'p-3 rounded-lg border text-sm transition-colors',
                        ecoProfile.optimization_style === v
                          ? 'border-sage-400 bg-sage-400/5 text-sage-700 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eco tradeoff */}
              <div>
                <label className="label">Would you pay a little more for a greener AI option?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { v: 'yes', label: 'Yes' },
                      { v: 'maybe', label: 'Maybe' },
                      { v: 'no', label: 'No' },
                    ] as const
                  ).map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => setEcoProfile((p) => ({ ...p, eco_tradeoff: v }))}
                      className={clsx(
                        'p-3 rounded-lg border text-sm transition-colors',
                        ecoProfile.eco_tradeoff === v
                          ? 'border-sage-400 bg-sage-400/5 text-sage-700 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                className="btn-secondary"
                onClick={() => {
                  setCurrentServiceIdx(drafts.length - 1)
                  setStep('setup-service')
                }}
              >
                Back
              </button>
              <button className="btn-primary flex-1" onClick={() => setStep('summary')}>
                See my summary →
              </button>
            </div>
          </Card>
        )}

        {/* ── Summary ───────────────────────────────────────────────────── */}
        {step === 'summary' && (
          <Card>
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">✓</div>
              <h2 className="text-xl font-semibold text-slate-800">Here's your AI picture</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-cream-100 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Monthly spend</p>
                <p className="text-2xl font-semibold text-slate-800">
                  ${totalMonthly.toFixed(2)}
                </p>
              </div>
              <div className="bg-cream-100 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Yearly estimate</p>
                <p className="text-2xl font-semibold text-slate-800">
                  ${(totalMonthly * 12).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Services list */}
            <div className="space-y-2 mb-6">
              {drafts.map((d) => (
                <div key={d.provider.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: d.provider.logo_color }}
                    >
                      {d.provider.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700">{d.provider.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    ${d.billing_interval === 'annual'
                      ? ((d.cost ?? 0) / 12).toFixed(2)
                      : (d.cost ?? 0).toFixed(2)}/mo
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center mb-6">
              You can edit these any time from the Services page.
            </p>

            <button
              className="btn-primary w-full py-3 text-base"
              onClick={handleFinish}
              disabled={finishMutation.isPending}
            >
              {finishMutation.isPending ? 'Saving…' : 'Go to Dashboard →'}
            </button>
            {finishMutation.isError && (
              <p className="text-xs text-red-500 text-center mt-2">
                Something went wrong. Please try again.
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
