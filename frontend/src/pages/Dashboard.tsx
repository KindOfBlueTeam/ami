import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  fetchSubscriptions,
  fetchRecommendations,
  generateRecommendations,
} from '../api/client'
import StatCard from '../components/StatCard'
import RecommendationCard from '../components/RecommendationCard'
import { dismissRecommendation } from '../api/client'
import type { Subscription } from '../types'

function monthlyCost(sub: Subscription) {
  return sub.monthly_cost ?? (sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost)
}

export default function Dashboard() {
  const qc = useQueryClient()

  const { data: subs = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  })

  const { data: recs = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => fetchRecommendations(false),
  })

  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  })

  const dismissMutation = useMutation({
    mutationFn: dismissRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  })

  const active = useMemo(() => subs.filter((s) => s.status === 'active'), [subs])

  const totalMonthly = useMemo(
    () => active.reduce((sum, s) => sum + monthlyCost(s), 0),
    [active],
  )

  const totalCo2Monthly = useMemo(
    () => active.reduce((sum, s) => sum + (s.estimated_co2e_kg_monthly ?? 0), 0),
    [active],
  )

  const nextRenewal = useMemo(() => {
    const upcoming = active
      .map((s) => ({ ...s, days: differenceInDays(parseISO(s.renewal_date), new Date()) }))
      .filter((s) => s.days >= 0)
      .sort((a, b) => a.days - b.days)[0]
    return upcoming ?? null
  }, [active])

  const overlaps = useMemo(() => {
    const groups: Record<string, Subscription[]> = {}
    for (const s of active) {
      const cat = s.provider?.category ?? 'unknown'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    }
    return Object.entries(groups).filter(([, g]) => g.length > 1)
  }, [active])

  const topRecs = recs.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {active.length} active subscription{active.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn-secondary text-xs"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Refreshing…' : '↻ Refresh insights'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Monthly spend"
          value={`$${totalMonthly.toFixed(2)}`}
          sub="across all active plans"
          accent="sage"
        />
        <StatCard
          label="Yearly estimate"
          value={`$${(totalMonthly * 12).toFixed(0)}`}
          sub="at current billing rates"
          accent="blue"
        />
        <StatCard
          label="Next renewal"
          value={
            nextRenewal
              ? nextRenewal.days === 0
                ? 'Today'
                : `${nextRenewal.days}d`
              : '—'
          }
          sub={nextRenewal ? `${nextRenewal.provider?.name ?? ''} · ${format(parseISO(nextRenewal.renewal_date), 'MMM d')}` : 'No upcoming renewals'}
          accent={nextRenewal && nextRenewal.days <= 7 ? 'amber' : 'default'}
        />
        <StatCard
          label="Est. CO₂e / mo"
          value={`${totalCo2Monthly.toFixed(2)} kg`}
          sub="rough estimate · see methodology"
          accent="default"
        />
      </div>

      {/* Overlap warning */}
      {overlaps.length > 0 && (
        <div className="card p-5 border-l-4 border-l-orange-300 bg-orange-50/30">
          <p className="text-sm font-medium text-orange-800 mb-2">Overlapping subscriptions</p>
          {overlaps.map(([cat, group]) => (
            <p key={cat} className="text-xs text-orange-700">
              You have {group.length} {cat} AI subscriptions:{' '}
              {group.map((s) => s.provider?.name).join(', ')}
            </p>
          ))}
        </div>
      )}

      {/* Spending breakdown */}
      {active.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-medium text-slate-600 mb-4">Spending breakdown</h2>
          <div className="space-y-3">
            {active
              .slice()
              .sort((a, b) => monthlyCost(b) - monthlyCost(a))
              .map((s) => {
                const pct = totalMonthly > 0 ? (monthlyCost(s) / totalMonthly) * 100 : 0
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded text-white text-xs flex items-center justify-center font-semibold"
                          style={{ backgroundColor: s.provider?.logo_color ?? '#6B7280' }}
                        >
                          {s.provider?.name.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700">{s.provider?.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        ${monthlyCost(s).toFixed(2)}/mo
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: s.provider?.logo_color ?? '#5B8A6E',
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Recommendations preview */}
      {topRecs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-600">Top insights</h2>
            <Link to="/recommendations" className="text-xs text-sage-600 hover:text-sage-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {topRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                onDismiss={() => dismissMutation.mutate(rec.id)}
              />
            ))}
          </div>
        </div>
      )}

      {recs.length === 0 && active.length > 0 && (
        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm mb-3">No insights yet.</p>
          <button
            className="btn-secondary text-xs"
            onClick={() => generateMutation.mutate()}
          >
            Generate insights
          </button>
        </div>
      )}

      {active.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm mb-4">No subscriptions yet.</p>
          <Link to="/services" className="btn-primary text-sm">
            Add a service
          </Link>
        </div>
      )}
    </div>
  )
}
