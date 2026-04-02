import { formatEnergy } from '../../utils/ecoMetrics'

// ─── Asset cutover ────────────────────────────────────────────────────────────
// To swap in final artwork: change GAUGE_ASSET to the final SVG path.
// The final SVG must use viewBox="0 0 200 120" with the needle pivot at (100, 110).
// No other code changes are required.
const GAUGE_ASSET = '/assets/eco/placeholders/compute-gauge-base.svg'

// Needle geometry — tied to the SVG coordinate space above.
// If the final SVG uses a different coordinate space, update these constants.
const PIVOT     = { x: 100, y: 110 }
const NEEDLE_R  = 68   // shorter than inner arc radius (70) so tip stays within the gauge
const VIEWBOX_W = 200
const VIEWBOX_H = 120
// ─────────────────────────────────────────────────────────────────────────────

export interface ComputeGaugeProps {
  /** Compute intensity score, 0–100 */
  score: number
  /** Human label: 'Low' | 'Moderate' | 'High' | 'Very High' */
  label: string
  /** Estimated energy draw for this subscription in kWh/month */
  energyKwhMonthly: number
  /** Optional tooltip text shown on hover */
  tooltipText?: string
}

export default function ComputeGauge({
  score,
  label,
  energyKwhMonthly,
  tooltipText,
}: ComputeGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score))

  // score 0 → 180° (left), score 100 → 0° (right), through top arc at 90°
  const angleDeg = 180 * (1 - clamped / 100)
  const angleRad = (angleDeg * Math.PI) / 180
  const tipX = PIVOT.x + NEEDLE_R * Math.cos(angleRad)
  const tipY = PIVOT.y - NEEDLE_R * Math.sin(angleRad)

  return (
    <div title={tooltipText}>
      {/* Gauge base image + needle overlay share the same bounding box */}
      <div className="relative w-full">
        <img
          src={GAUGE_ASSET}
          alt=""
          aria-hidden="true"
          className="w-full block"
          draggable={false}
        />
        {/* Needle rendered as an SVG overlay in the same coordinate space */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          aria-hidden="true"
        >
          <line
            x1={PIVOT.x} y1={PIVOT.y}
            x2={tipX}     y2={tipY}
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Cap covers the static pivot dot drawn in the base SVG */}
          <circle cx={PIVOT.x} cy={PIVOT.y} r="4.5" fill="#1e293b"/>
        </svg>
      </div>

      {/* Text labels below the gauge */}
      <div className="text-center mt-0.5 space-y-0.5">
        <div className="text-xs font-medium text-slate-600 leading-none">{label}</div>
        <div className="text-xs text-slate-400 leading-none">{formatEnergy(energyKwhMonthly)}</div>
      </div>
    </div>
  )
}
