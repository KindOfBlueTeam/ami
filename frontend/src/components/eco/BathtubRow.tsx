import { useId } from 'react'
import { BATHTUB_LITERS, litersToGallons } from '../../utils/ecoMetrics'
import { useUnitSystem } from '../../contexts/UnitSystemContext'

// ─── Asset cutover ────────────────────────────────────────────────────────────
// To swap in final artwork: change BATHTUB_ASSET to the final SVG path.
// The final SVG must use viewBox="0 0 90 55" with the fill area at FILL_AREA below.
const BATHTUB_ASSET = '/assets/eco/placeholders/bathtub-base.svg'

// Fill area geometry — must match the tub interior in the SVG asset.
const FILL_AREA = { x: 8, y: 16, width: 74, height: 26, rx: 2 } as const
const VIEWBOX_W = 90
const VIEWBOX_H = 55
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TUBS = 3
// Minimum fill height in SVG coordinate units (ensures a visible water sliver)
const MIN_FILL_H = 2

interface SingleTubProps {
  fillFrac: number
  clipId: string
}

function SingleTub({ fillFrac, clipId }: SingleTubProps) {
  const fillHeight = Math.max(MIN_FILL_H, FILL_AREA.height * fillFrac)
  const fillY = FILL_AREA.y + FILL_AREA.height - fillHeight

  return (
    <div className="relative w-full">
      <img
        src={BATHTUB_ASSET}
        alt=""
        aria-hidden="true"
        className="w-full block"
        draggable={false}
      />
      {fillFrac > 0 && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={FILL_AREA.x} y={FILL_AREA.y}
                width={FILL_AREA.width} height={FILL_AREA.height}
                rx={FILL_AREA.rx}
              />
            </clipPath>
          </defs>
          <rect
            x={FILL_AREA.x}
            y={fillY}
            width={FILL_AREA.width}
            height={fillHeight}
            fill="rgba(56, 189, 248, 0.38)"
            clipPath={`url(#${clipId})`}
          />
        </svg>
      )}
    </div>
  )
}

export interface BathtubRowProps {
  /** Estimated water usage in liters (pre-scaled for monthly or yearly display) */
  litersMonthly: number
  period?: 'month' | 'year'
  /** Optional tooltip text shown on hover */
  tooltipText?: string
}

export default function BathtubRow({ litersMonthly, period = 'month', tooltipText }: BathtubRowProps) {
  const { unitSystem } = useUnitSystem()
  const baseId = useId()
  const tubsNeeded = litersMonthly / BATHTUB_LITERS
  const numVisible = Math.min(Math.ceil(tubsNeeded), MAX_TUBS)
  const overflow = tubsNeeded > MAX_TUBS
  const periodLabel = period === 'year' ? 'yr' : 'mo'

  const volumeLabel = unitSystem === 'imperial'
    ? `~${litersToGallons(litersMonthly).toFixed(1)} gal`
    : `~${litersMonthly.toFixed(0)} L`

  if (litersMonthly <= 0 || numVisible === 0) return null

  function getFrac(i: number): number {
    // All visible tubs are full when we're capped (overflow case)
    if (overflow) return 1.0
    // All tubs except the last are full
    if (i < numVisible - 1) return 1.0
    // Last tub: show the partial fraction (0 remainder means exactly full)
    const rem = tubsNeeded % 1
    return rem === 0 ? 1.0 : rem
  }

  return (
    <div title={tooltipText}>
      <div className="flex gap-1 items-end">
        {Array.from({ length: numVisible }, (_, i) => (
          <div key={i} className="flex-1">
            <SingleTub fillFrac={getFrac(i)} clipId={`${baseId}-${i}`} />
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-400 text-center mt-0.5 leading-none">
        {volumeLabel} / {periodLabel}
        {overflow && <span className="ml-1 text-slate-300">(+more)</span>}
      </div>
    </div>
  )
}
