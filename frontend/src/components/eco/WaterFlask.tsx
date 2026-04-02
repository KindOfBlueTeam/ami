import { useId } from 'react'

// ─── Asset cutover ────────────────────────────────────────────────────────────
// To swap in final artwork: change FLASK_ASSET to the final SVG path.
// The final SVG must use viewBox="0 0 80 120" with the fill area at FILL_AREA below.
// No other code changes are required.
const FLASK_ASSET = '/assets/eco/placeholders/water-flask-base.svg'

// Fill area geometry — must match the flask body in the SVG asset.
// If the final SVG uses a different body position or size, update these constants.
const FILL_AREA = { x: 10, y: 28, width: 60, height: 82, rx: 6 } as const
const VIEWBOX_W = 80
const VIEWBOX_H = 120
// ─────────────────────────────────────────────────────────────────────────────

const SCALE_MAX = 20  // visual scale tops out at 20 L

// Pre-computed Y positions for graduation marks in SVG coordinate space.
// y = FILL_AREA.y + FILL_AREA.height * (1 - liters / SCALE_MAX)
const GRAD_MARKS: Array<{ liters: number; y: number }> = [
  { liters: 1,  y: FILL_AREA.y + FILL_AREA.height * (1 - 1  / SCALE_MAX) },
  { liters: 5,  y: FILL_AREA.y + FILL_AREA.height * (1 - 5  / SCALE_MAX) },
  { liters: 10, y: FILL_AREA.y + FILL_AREA.height * (1 - 10 / SCALE_MAX) },
  { liters: 15, y: FILL_AREA.y + FILL_AREA.height * (1 - 15 / SCALE_MAX) },
  { liters: 20, y: FILL_AREA.y + FILL_AREA.height * (1 - 20 / SCALE_MAX) },
]

const SHOWER_LITERS = 50  // average 8-minute shower

function showerPhrase(liters: number, period: 'month' | 'year'): string {
  const count = liters / SHOWER_LITERS
  if (count < 0.15) return '< 1 shower'
  if (count < 0.75) {
    const every = Math.round(1 / count)
    const unit = period === 'year' ? 'yr' : 'mo'
    return `≈ 1 shower every ${every} ${unit}`
  }
  if (count < 1.5) return '≈ 1 shower'
  return `≈ ${Math.round(count)} showers`
}

export interface WaterFlaskProps {
  /** Estimated cooling water in liters (pre-scaled for the display period) */
  litersMonthly: number
  /** Same value converted to US gallons (use litersToGallons from ecoMetrics) */
  gallonsMonthly: number
  /** Controls the period label in the text below the flask */
  period?: 'month' | 'year'
  /** Controls whether labels show metric (L primary) or imperial (gal primary) */
  unitSystem?: 'metric' | 'imperial'
  /** Optional tooltip text shown on hover */
  tooltipText?: string
}

export default function WaterFlask({
  litersMonthly,
  gallonsMonthly,
  period = 'month',
  unitSystem = 'metric',
  tooltipText,
}: WaterFlaskProps) {
  const periodLabel = period === 'year' ? 'yr' : 'month'
  const isImperial  = unitSystem === 'imperial'
  const clipId = useId()
  const isOverScale = litersMonthly > SCALE_MAX
  const fillFrac = Math.min(litersMonthly / SCALE_MAX, 1.0)
  const fillHeight = FILL_AREA.height * fillFrac
  const fillY = FILL_AREA.y + FILL_AREA.height - fillHeight

  return (
    <div title={tooltipText}>
      {/* Flask base image + fill overlay share the same bounding box */}
      <div className="relative w-full">
        <img
          src={FLASK_ASSET}
          alt=""
          aria-hidden="true"
          className="w-full block"
          draggable={false}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          aria-hidden="true"
        >
          <defs>
            {/* Clip fill to the flask body shape */}
            <clipPath id={clipId}>
              <rect
                x={FILL_AREA.x}   y={FILL_AREA.y}
                width={FILL_AREA.width} height={FILL_AREA.height}
                rx={FILL_AREA.rx}
              />
            </clipPath>
          </defs>

          {/* Water fill — rises from the bottom of the flask body */}
          {fillHeight > 0 && (
            <rect
              x={FILL_AREA.x}
              y={fillY}
              width={FILL_AREA.width}
              height={fillHeight}
              fill="rgba(56, 189, 248, 0.32)"
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* Graduation marks — tinted cyan when submerged, slate when above waterline */}
          {GRAD_MARKS.map(({ liters, y }) => (
            <line
              key={liters}
              x1={FILL_AREA.x + FILL_AREA.width - 8}
              y1={y}
              x2={FILL_AREA.x + FILL_AREA.width}
              y2={y}
              stroke={y >= fillY ? 'rgba(56,189,248,0.65)' : 'rgba(148,163,184,0.45)'}
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Text labels below the flask */}
      <div className="text-center mt-0.5 space-y-0.5">
        {isImperial ? (
          <div className="text-xs font-medium text-slate-600 leading-none">
            ~{gallonsMonthly.toFixed(2)} gal / {periodLabel}
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-600 leading-none">
            ~{litersMonthly.toFixed(1)} L / {periodLabel}
          </div>
        )}
        <div className="text-xs text-slate-400 leading-none">
          {showerPhrase(litersMonthly, period)}
        </div>
      </div>
    </div>
  )
}
