import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addMonths } from 'date-fns'
import clsx from 'clsx'
import {
  fetchSubscriptions,
  fetchProviders,
  fetchPlansForProvider,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../api/client'
import ServiceCard from '../components/ServiceCard'
import type { Plan, Provider, Subscription, SubscriptionCreate } from '../types'

interface FormState {
  provider_id: number | ''
  plan_id: number | null
  custom_plan_name: string
  cost: string
  billing_interval: 'monthly' | 'annual'
  renewal_date: string
  usage_estimate: 'light' | 'moderate' | 'heavy'
  perceived_value: 'low' | 'medium' | 'high'
  primary_use_case: string
  notes: string
}

function defaultForm(): FormState {
  return {
    provider_id: '',
    plan_id: null,
    custom_plan_name: '',
    cost: '',
    billing_interval: 'monthly',
    renewal_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    usage_estimate: 'moderate',
    perceived_value: 'medium',
    primary_use_case: '',
    notes: '',
  }
}

function subToForm(sub: Subscription): FormState {
  return {
    provider_id: sub.provider_id,
    plan_id: sub.plan_id,
    custom_plan_name: sub.custom_plan_name ?? '',
    cost: String(sub.cost),
    billing_interval: sub.billing_interval,
    renewal_date: sub.renewal_date,
    usage_estimate: sub.usage_estimate,
    perceived_value: sub.perceived_value,
    primary_use_case: sub.primary_use_case ?? '',
    notes: sub.notes ?? '',
  }
}

function ServiceForm({
  form,
  onChange,
  providers,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  form: FormState
  onChange: (f: FormState) => void
  providers: Provider[]
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const { data: plans = [] } = useQuery({
    queryKey: ['plans', form.provider_id],
    queryFn: () =>
      typeof form.provider_id === 'number'
        ? fetchPlansForProvider(form.provider_id)
        : Promise.resolve([]),
    enabled: typeof form.provider_id === 'number',
  })

  const handlePlan = (plan: Plan | null) => {
    onChange({
      ...form,
      plan_id: plan?.id ?? null,
      cost: plan ? String(plan.is_free ? 0 : plan.price_monthly) : form.cost,
    })
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <label className="label">Service</label>
        <select
          className="input"
          value={form.provider_id}
          onChange={(e) => {
            const id = parseInt(e.target.value)
            onChange({ ...defaultForm(), provider_id: isNaN(id) ? '' : id })
          }}
        >
          <option value="">Select a service…</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Plan */}
      {plans.length > 0 && (
        <div>
          <label className="label">Plan</label>
          <div className="grid grid-cols-2 gap-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlan(plan)}
                className={clsx(
                  'text-left p-2.5 rounded-lg border text-xs transition-colors',
                  form.plan_id === plan.id
                    ? 'border-sage-400 bg-sage-400/5 text-sage-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600',
                )}
              >
                <span className="font-medium block">{plan.name}</span>
                <span className="text-slate-400">
                  {plan.is_free ? 'Free' : `$${plan.price_monthly}/mo`}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...form, plan_id: null, custom_plan_name: '' })}
              className={clsx(
                'text-left p-2.5 rounded-lg border text-xs transition-colors',
                form.plan_id === null
                  ? 'border-sage-400 bg-sage-400/5'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <span className="font-medium text-slate-700 block">Other</span>
              <span className="text-slate-400">Enter manually</span>
            </button>
          </div>
        </div>
      )}

      {form.plan_id === null && (
        <div>
          <label className="label">Plan name</label>
          <input
            className="input"
            placeholder="Custom plan"
            value={form.custom_plan_name}
            onChange={(e) => onChange({ ...form, custom_plan_name: e.target.value })}
          />
        </div>
      )}

      {/* Cost + billing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input pl-7"
              placeholder="0.00"
              value={form.cost}
              onChange={(e) => onChange({ ...form, cost: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Billing</label>
          <select
            className="input"
            value={form.billing_interval}
            onChange={(e) =>
              onChange({ ...form, billing_interval: e.target.value as 'monthly' | 'annual' })
            }
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Renewal date */}
      <div>
        <label className="label">Next renewal date</label>
        <input
          type="date"
          className="input"
          value={form.renewal_date}
          onChange={(e) => onChange({ ...form, renewal_date: e.target.value })}
        />
      </div>

      {/* Usage + value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Usage intensity</label>
          <select
            className="input"
            value={form.usage_estimate}
            onChange={(e) =>
              onChange({ ...form, usage_estimate: e.target.value as 'light' | 'moderate' | 'heavy' })
            }
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>
        <div>
          <label className="label">Perceived value</label>
          <select
            className="input"
            value={form.perceived_value}
            onChange={(e) =>
              onChange({ ...form, perceived_value: e.target.value as 'low' | 'medium' | 'high' })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Use case */}
      <div>
        <label className="label">Primary use case <span className="normal-case font-normal text-slate-400">(optional)</span></label>
        <input
          className="input"
          placeholder="e.g. writing, research, coding…"
          value={form.primary_use_case}
          onChange={(e) => onChange({ ...form, primary_use_case: e.target.value })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={onSubmit}
          disabled={isSubmitting || !form.provider_id}
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function Services() {
  const qc = useQueryClient()

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  })

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
  })

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      setShowAdd(false)
      setForm(defaultForm())
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SubscriptionCreate> }) =>
      updateSubscription(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  const handleSubmit = () => {
    const data: SubscriptionCreate = {
      provider_id: form.provider_id as number,
      plan_id: form.plan_id,
      custom_plan_name: form.custom_plan_name || null,
      cost: parseFloat(form.cost) || 0,
      billing_interval: form.billing_interval,
      renewal_date: form.renewal_date,
      usage_estimate: form.usage_estimate,
      perceived_value: form.perceived_value,
      primary_use_case: form.primary_use_case || null,
      notes: form.notes || null,
    }
    if (editingId != null) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const startEdit = (sub: Subscription) => {
    setEditingId(sub.id)
    setForm(subToForm(sub))
    setShowAdd(false)
  }

  const byIntensityDesc = (a: typeof subs[0], b: typeof subs[0]) =>
    (b.compute_intensity_score ?? 0) - (a.compute_intensity_score ?? 0)
  const active = subs.filter((s) => s.status === 'active').sort(byIntensityDesc)
  const inactive = subs.filter((s) => s.status !== 'active').sort(byIntensityDesc)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Services</h1>
          <p className="text-sm text-slate-400 mt-0.5">{active.length} active</p>
        </div>
        <button
          className="btn-primary text-sm"
          onClick={() => {
            setShowAdd(true)
            setEditingId(null)
            setForm(defaultForm())
          }}
        >
          + Add service
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">New subscription</h2>
          <ServiceForm
            form={form}
            onChange={setForm}
            providers={providers}
            onSubmit={handleSubmit}
            onCancel={() => setShowAdd(false)}
            isSubmitting={createMutation.isPending}
          />
        </div>
      )}

      {/* Subscription list */}
      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : (
        <>
          {active.length === 0 && !showAdd && (
            <div className="card p-10 text-center">
              <p className="text-slate-400 text-sm">No active subscriptions yet.</p>
            </div>
          )}

          <div className="space-y-3">
            {active.map((sub) =>
              editingId === sub.id ? (
                <div key={sub.id} className="card p-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-5">
                    Edit {sub.provider?.name}
                  </h2>
                  <ServiceForm
                    form={form}
                    onChange={setForm}
                    providers={providers}
                    onSubmit={handleSubmit}
                    onCancel={() => setEditingId(null)}
                    isSubmitting={updateMutation.isPending}
                  />
                </div>
              ) : (
                <ServiceCard
                  key={sub.id}
                  sub={sub}
                  onEdit={() => startEdit(sub)}
                  onDelete={() => {
                    if (confirm(`Remove ${sub.provider?.name}?`)) {
                      deleteMutation.mutate(sub.id)
                    }
                  }}
                />
              ),
            )}
          </div>

          {inactive.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 mt-6">
                Inactive
              </p>
              <div className="space-y-3 opacity-60">
                {inactive.map((sub) => (
                  <ServiceCard
                    key={sub.id}
                    sub={sub}
                    onEdit={() => startEdit(sub)}
                    onDelete={() => deleteMutation.mutate(sub.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
