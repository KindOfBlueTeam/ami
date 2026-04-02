import { milesToKm } from '../../utils/ecoMetrics'

interface Props {
  /** Total CO₂ driving equivalent in miles (pre-scaled for the selected period) */
  distanceMi: number
  unit: 'mi' | 'km'
  period?: 'month' | 'year'
}

// Clean side-profile car SVG, facing right (front = right side)
function CarSvg() {
  return (
    <svg viewBox="0 0 60 26" width="54" height="23" aria-hidden="true">
      {/* Chassis */}
      <rect x="1" y="11" width="58" height="10" rx="2" fill="#64748b" />
      {/* Cabin */}
      <path
        d="M 11 11 L 16 3.5 Q 18 2 22 2 L 40 2 Q 44 2 46 3.5 L 50 11 Z"
        fill="#475569"
      />
      {/* Window glass */}
      <path
        d="M 17 11 L 21 5.5 Q 22.5 4 25.5 4 L 38 4 Q 41 4 42.5 5.5 L 45 11 Z"
        fill="#bae6fd"
        opacity="0.82"
      />
      {/* Headlight (front = right) */}
      <rect x="57" y="12.5" width="2" height="3" rx="0.5" fill="#fef9c3" />
      {/* Tail light (rear = left) */}
      <rect x="1" y="12.5" width="1.5" height="3" rx="0.5" fill="#fca5a5" />
      {/* Front wheel */}
      <circle cx="44" cy="22" r="5" fill="#1e293b" />
      <circle cx="44" cy="22" r="2.2" fill="#94a3b8" />
      {/* Rear wheel */}
      <circle cx="16" cy="22" r="5" fill="#1e293b" />
      <circle cx="16" cy="22" r="2.2" fill="#94a3b8" />
    </svg>
  )
}

export default function DrivingRoad({ distanceMi, unit, period = 'month' }: Props) {
  const distance = unit === 'km' ? milesToKm(distanceMi) : distanceMi
  const displayDist = Math.round(distance).toLocaleString()
  const periodLabel = period === 'year' ? 'per year' : 'per month'

  return (
    <div>
      {/* Road strip */}
      <div className="relative rounded-lg bg-slate-50 border border-slate-100 overflow-hidden" style={{ height: 56 }}>
        {/* Road surface (inset band) */}
        <div
          className="absolute inset-x-0 bg-slate-100"
          style={{ top: 10, bottom: 10 }}
        />
        {/* Edge lines */}
        <div className="absolute inset-x-0 h-px bg-slate-200" style={{ top: 10 }} />
        <div className="absolute inset-x-0 h-px bg-slate-200" style={{ bottom: 10 }} />
        {/* Center dashes — rendered as a border-dashed div */}
        <div
          className="absolute inset-x-0 border-t border-dashed border-slate-200"
          style={{ top: 28 }}
        />
        {/* Distance markers at 33% and 66% */}
        <div
          className="absolute bg-slate-200/60"
          style={{ left: '33%', top: 12, bottom: 12, width: 1 }}
        />
        <div
          className="absolute bg-slate-200/60"
          style={{ left: '66%', top: 12, bottom: 12, width: 1 }}
        />
        {/* End marker — slightly more prominent */}
        <div
          className="absolute bg-slate-300"
          style={{ right: 64, top: 6, bottom: 6, width: 1 }}
        />

        {/* Car — left side, vertically centered on road band */}
        <div
          className="absolute flex items-center"
          style={{ left: 10, top: 10, bottom: 10 }}
        >
          <CarSvg />
        </div>

        {/* Distance label — right side, inside road */}
        <div
          className="absolute right-3 flex flex-col items-end justify-center"
          style={{ top: 10, bottom: 10 }}
        >
          <span className="text-sm font-semibold text-slate-700 leading-none">
            {displayDist}
          </span>
          <span className="text-xs text-slate-400 leading-none mt-0.5">{unit}</span>
        </div>
      </div>

      {/* Supporting label */}
      <p className="text-xs text-slate-400 mt-1.5">
        Equivalent to driving {displayDist} {unit} {periodLabel}
      </p>
    </div>
  )
}
