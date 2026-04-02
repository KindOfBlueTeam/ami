import { useMemo, useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  fetchSubscriptions,
  fetchRecommendations,
  generateRecommendations,
  dismissRecommendation,
  fetchUsers,
  getActiveUser,
  activateUser,
} from '../api/client'
import StatCard from '../components/StatCard'
import RecommendationCard from '../components/RecommendationCard'
import type { Subscription } from '../types'

function monthlyCost(sub: Subscription) {
  return sub.monthly_cost ?? (sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost)
}

export default function Dashboard() {
  const qc = useQueryClient()
  const [showSwitchMenu, setShowSwitchMenu] = useState(false)
  const switchMenuRef = useRef<HTMLDivElement>(null)

  const { data: subs = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  })

  const { data: recs = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => fetchRecommendations(false),
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const { data: activeUser } = useQuery({
    queryKey: ['active-user'],
    queryFn: getActiveUser,
  })

  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  })

  const switchMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      setShowSwitchMenu(false)
      qc.invalidateQueries({ queryKey: ['active-user'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: dismissRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showSwitchMenu) return
    function handleClick(e: MouseEvent) {
      if (switchMenuRef.current && !switchMenuRef.current.contains(e.target as Node)) {
        setShowSwitchMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSwitchMenu])

  const active = useMemo(() => subs.filter((s) => s.status === 'active'), [subs])

  const totalMonthly = useMemo(
    () => active.reduce((sum, s) => sum + monthlyCost(s), 0),
    [active],
  )

  const totalCo2Monthly = useMemo(
    () => active.reduce((sum, s) => sum + (s.estimated_co2e_kg_monthly ?? 0), 0),
    [active],
  )

  const totalWaterMonthly = useMemo(
    () => active.reduce((sum, s) => sum + (s.water_liters_monthly ?? 0), 0),
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {active.length} active subscription{active.length !== 1 ? 's' : ''}
            {activeUser && allUsers.length > 1 && (
              <span className="ml-1.5 text-slate-300">· {activeUser.name}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch User — only shown when multiple users exist */}
          {allUsers.length > 1 && (
            <div className="relative" ref={switchMenuRef}>
              <button
                className="btn-secondary text-xs"
                onClick={() => setShowSwitchMenu((v) => !v)}
                disabled={switchMutation.isPending}
              >
                {switchMutation.isPending ? 'Switching…' : 'Switch user ▾'}
              </button>
              {showSwitchMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 min-w-[160px]">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      className={[
                        'w-full text-left px-3.5 py-2 text-sm transition-colors',
                        u.is_active
                          ? 'text-sage-700 font-medium bg-sage-50/60 cursor-default'
                          : 'text-slate-700 hover:bg-slate-50 cursor-pointer',
                      ].join(' ')}
                      onClick={() => {
                        if (!u.is_active) switchMutation.mutate(u.id)
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {u.name}
                        {u.is_active && (
                          <span className="text-xs text-sage-500 font-normal">✓</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            className="btn-secondary text-xs"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Refreshing…' : '↻ Refresh insights'}
          </button>
        </div>
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
          sub="rough estimate"
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

      {/* Annual ecological impact */}
      {active.length > 0 && (
        <div className="card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-600">Annual ecological impact</h2>
            <Link to="/methodology" className="text-xs text-sage-600 hover:text-sage-700">
              see methodology
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">CO₂ equivalent</p>
              <p className="text-xl font-semibold text-slate-800">
                {(totalCo2Monthly * 12).toFixed(1)}
                <span className="text-sm font-normal text-slate-400 ml-1">kg / yr</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ≈ driving {Math.round((totalCo2Monthly * 12) / 0.404).toLocaleString()} mi
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Water usage</p>
              <p className="text-xl font-semibold text-slate-800">
                {(totalWaterMonthly * 12).toFixed(0)}
                <span className="text-sm font-normal text-slate-400 ml-1">L / yr</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ≈ {((totalWaterMonthly * 12) / 3.785).toFixed(0)} gal
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-4 pt-4 border-t border-slate-50">
            Projected from current monthly estimates × 12. Rough order-of-magnitude only.
          </p>
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
