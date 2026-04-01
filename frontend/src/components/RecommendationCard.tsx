import clsx from 'clsx'
import type { Recommendation } from '../types'

interface Props {
  rec: Recommendation
  onDismiss?: () => void
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  annual:    { label: 'Save with annual',     color: 'border-l-blue-400',   icon: '💰' },
  downgrade: { label: 'Consider downgrading', color: 'border-l-amber-400',  icon: '⬇' },
  cancel:    { label: 'Consider cancelling',  color: 'border-l-red-400',    icon: '✕' },
  overlap:   { label: 'Overlapping services', color: 'border-l-orange-400', icon: '⚠' },
  eco:       { label: 'Eco footprint',        color: 'border-l-emerald-400',icon: '🌿' },
  keep:      { label: 'Looking good',         color: 'border-l-sage-500',   icon: '✓' },
  upgrade:   { label: 'Consider upgrading',   color: 'border-l-purple-400', icon: '⬆' },
}

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-red-400',
  medium: 'bg-amber-400',
  low:    'bg-slate-300',
}

export default function RecommendationCard({ rec, onDismiss }: Props) {
  const config = TYPE_CONFIG[rec.rec_type] ?? TYPE_CONFIG.keep

  return (
    <div className={clsx('card p-5 border-l-4', config.color, 'hover:shadow-md transition-shadow')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">{config.icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {config.label}
              </p>
              <span className={clsx('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[rec.priority])} />
            </div>
            <p className="font-medium text-slate-800 text-sm leading-snug">{rec.reason}</p>
            {rec.detail && (
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.detail}</p>
            )}
            {rec.provider && (
              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className="w-4 h-4 rounded text-white text-xs flex items-center justify-center font-medium"
                  style={{ backgroundColor: rec.provider.logo_color }}
                >
                  {rec.provider.name.charAt(0)}
                </div>
                <span className="text-xs text-slate-400">{rec.provider.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {rec.potential_savings_annual != null && (
            <span className="badge-green text-xs">
              Save ${rec.potential_savings_annual.toFixed(0)}/yr
            </span>
          )}
          {rec.estimated_co2e_change != null && (
            <span className="badge-green text-xs">
              {rec.estimated_co2e_change < 0
                ? `−${Math.abs(rec.estimated_co2e_change).toFixed(2)} kg CO₂e/mo`
                : `+${rec.estimated_co2e_change.toFixed(2)} kg CO₂e/mo`}
            </span>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
