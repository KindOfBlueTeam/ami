import { useId } from 'react'

// ─── Geometry ──────────────────────────────────────────────────────────────────
// Fully inline SVG — no external asset dependency.
// viewBox 0 0 80 120
//
// Layout:
//   Smoke column  y  8–58 (50 units) — smoke fills upward from y=58
//   Chimney rim   y 58–68 (10 units) — wider flare at stack top
//   Chimney body  y 68–120 (52 units) — the stack itself
//
const VIEWBOX_W = 80
const VIEWBOX_H = 120
const SMOKE = { x: 22, y: 8, width: 36, height: 50, rx: 4 } as const

// Graduation y positions (at 25%, 50%, 75% fill levels)
const GRAD_MARKS = [0.25, 0.5, 0.75].map(
  (f) => SMOKE.y + SMOKE.height * (1 - f),
)

/**
 * Value (kg CO₂e) at which the smoke column appears 100% full.
 * Callers should override for yearly / aggregate contexts.
 */
const DEFAULT_SCALE_MAX = 3

export interface SmokeStackProps {
  /** CO₂e in kg — pre-scaled for the display period */
  co2Kg: number
  /** Fill reaches 100% at this value. Default 3 kg (monthly per-service). */
  scaleMax?: number
  tooltipText?: string
}

export default function SmokeStack({
  co2Kg,
  scaleMax = DEFAULT_SCALE_MAX,
  tooltipText,
}: SmokeStackProps) {
  const clipId = useId()
  const isOverScale = co2Kg > scaleMax
  const fillFrac   = Math.min(co2Kg / scaleMax, 1.0)
  const fillHeight = SMOKE.height * fillFrac
  const fillY      = SMOKE.y + SMOKE.height - fillHeight

  return (
    <div title={tooltipText}>
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full block"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={SMOKE.x} y={SMOKE.y}
              width={SMOKE.width} height={SMOKE.height}
              rx={SMOKE.rx}
            />
          </clipPath>
        </defs>

        {/* ── Chimney ──────────────────────────────────────────────────────── */}
        {/* Body */}
        <rect x="30" y="68" width="20" height="52" rx="2" fill="#64748b" />
        {/* Rim — slightly wider flare at top */}
        <rect x="26" y="58" width="28" height="12" rx="2" fill="#475569" />

        {/* ── Smoke column ─────────────────────────────────────────────────── */}
        {/* Empty column background */}
        <rect
          x={SMOKE.x} y={SMOKE.y}
          width={SMOKE.width} height={SMOKE.height}
          rx={SMOKE.rx}
          fill="rgba(248,250,252,0.7)"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {/* Smoke fill — rises upward from chimney opening */}
        {fillHeight > 0 && (
          <rect
            x={SMOKE.x}
            y={fillY}
            width={SMOKE.width}
            height={fillHeight}
            fill="rgba(100,116,132,0.42)"
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Graduation marks */}
        {GRAD_MARKS.map((y) => (
          <line
            key={y}
            x1={SMOKE.x + SMOKE.width - 7}
            y1={y}
            x2={SMOKE.x + SMOKE.width}
            y2={y}
            stroke={y >= fillY ? 'rgba(71,85,105,0.55)' : 'rgba(148,163,184,0.28)'}
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {isOverScale && (
        <p className="text-[10px] text-slate-300 text-center italic leading-none mt-0.5">
          beyond scale
        </p>
      )}
    </div>
  )
}
