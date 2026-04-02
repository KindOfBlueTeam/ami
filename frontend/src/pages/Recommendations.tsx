import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRecommendations,
  generateRecommendations,
  dismissRecommendation,
  fetchSubscriptions,
} from '../api/client'
import RecommendationCard from '../components/RecommendationCard'
import OffsetPlaceholderCard from '../components/OffsetPlaceholderCard'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function Recommendations() {
  const qc = useQueryClient()
  const [showDismissed, setShowDismissed] = useState(false)

  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['recommendations', showDismissed],
    queryFn: () => fetchRecommendations(showDismissed),
  })

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  })

  const overlaps = useMemo(() => {
    const byCategory: Record<string, typeof subscriptions> = {}
    for (const sub of subscriptions) {
      const cat = sub.provider?.category
      if (!cat) continue
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(sub)
    }
    return Object.entries(byCategory).filter(([, group]) => group.length > 1)
  }, [subscriptions])

  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: dismissRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  })

  const active = recs.filter((r) => !r.dismissed)
  const dismissed = recs.filter((r) => r.dismissed)

  const sorted = [...active].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2),
  )

  const totalSavings = active.reduce(
    (sum, r) => sum + (r.potential_savings_annual ?? 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Recommendations</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Deterministic insights based on your usage and billing data.
          </p>
        </div>
        <button
          className="btn-secondary text-sm shrink-0"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Analyzing…' : '↻ Re-analyze'}
        </button>
      </div>

      {/* Summary if savings exist */}
      {totalSavings > 0 && (
        <div className="card p-5 border-l-4 border-l-sage-500 bg-sage-400/5">
          <p className="text-xs text-sage-600 font-medium uppercase tracking-wide mb-1">
            Potential annual savings
          </p>
          <p className="text-3xl font-semibold text-sage-700">
            ${totalSavings.toFixed(0)}
          </p>
          <p className="text-xs text-sage-600 mt-1">
            across {active.filter((r) => r.potential_savings_annual).length} recommendation
            {active.filter((r) => r.potential_savings_annual).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Offset placeholder — coming soon */}
      <OffsetPlaceholderCard />

      {/* Disclaimer */}
      <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-3">
        Ami's recommendations are based only on data you've entered. Ami cannot see your actual
        usage against plan limits (consumer AI apps don't offer public usage APIs). Use these
        as prompts to review your own usage, not definitive advice.
      </div>

      {/* Overlapping subscriptions warning */}
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

      {/* Recommendations list */}
      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm mb-3">
            {generateMutation.isSuccess
              ? 'No new insights — everything looks reasonable.'
              : 'No insights yet.'}
          </p>
          <button
            className="btn-secondary text-sm"
            onClick={() => generateMutation.mutate()}
          >
            Analyze now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onDismiss={() => dismissMutation.mutate(rec.id)}
            />
          ))}
        </div>
      )}

      {/* Dismissed toggle */}
      {dismissed.length > 0 && (
        <button
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => setShowDismissed((v) => !v)}
        >
          {showDismissed ? 'Hide' : 'Show'} {dismissed.length} dismissed
        </button>
      )}
      {showDismissed && dismissed.length > 0 && (
        <div className="space-y-3 opacity-50">
          {dismissed.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {generateMutation.isSuccess && (
        <p className="text-xs text-slate-400 text-center">
          Generated {generateMutation.data.generated} insight
          {generateMutation.data.generated !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  )
}
