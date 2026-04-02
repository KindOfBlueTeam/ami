import { kwhToBulbHours } from '../../utils/ecoMetrics'

// Maximum bulbs rendered individually; extras shown as +N overflow badge
const MAX_VISIBLE = 16

// Tiny inline bulb SVG — warm yellow fill, 12×16 coordinate space
function Bulb() {
  return (
    <svg viewBox="0 0 12 16" width="11" height="15" aria-hidden="true">
      {/* Glass globe */}
      <ellipse cx="6" cy="6" rx="4.5" ry="4.5" fill="#fbbf24" />
      {/* Neck */}
      <rect x="4" y="10" width="4" height="2.5" rx="0.5" fill="#fde68a" />
      {/* Base */}
      <rect x="3.5" y="12.5" width="5" height="1.5" rx="0.5" fill="#d97706" />
    </svg>
  )
}

export interface BulbGridProps {
  /** Estimated monthly (or yearly, pre-scaled) energy in kWh */
  energyKwh: number
  /** Optional tooltip */
  tooltipText?: string
  period?: 'month' | 'year'
}

export default function BulbGrid({ energyKwh, tooltipText, period = 'month' }: BulbGridProps) {
  const bulbCount = Math.round(kwhToBulbHours(energyKwh))
  const visible = Math.min(bulbCount, MAX_VISIBLE)
  const overflow = bulbCount - visible
  const periodLabel = period === 'year' ? 'yr' : 'mo'

  if (bulbCount === 0) return null

  return (
    <div title={tooltipText}>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: visible }, (_, i) => <Bulb key={i} />)}
        {overflow > 0 && (
          <span className="text-xs text-slate-400 font-medium self-end leading-none ml-0.5">
            +{overflow}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-400 leading-none mt-0.5">
        ~{bulbCount} bulb-hrs / {periodLabel}
      </div>
    </div>
  )
}

// Re-export for convenience
export { kwhToBulbHours }
