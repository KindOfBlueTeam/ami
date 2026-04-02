import { useUnitSystem } from '../../contexts/UnitSystemContext'
import { milesToKm, kgToLbs } from '../../utils/ecoMetrics'

export interface Co2ImpactTileProps {
  /** CO₂e in kg — pre-scaled for the display period */
  co2Kg: number
  /** Driving equivalent in miles — pre-scaled */
  milesEq: number
  period: 'month' | 'year'
  /**
   * Bar fills to 100% at this kg value.
   * Default 3 kg (monthly per-service). Pass larger values for yearly / dashboard aggregate.
   */
  scaleMax?: number
  tooltipText?: string
}

export default function Co2ImpactTile({
  co2Kg,
  milesEq,
  period,
  scaleMax = 3,
  tooltipText,
}: Co2ImpactTileProps) {
  const { unitSystem } = useUnitSystem()
  const periodShort = period === 'year' ? 'yr' : 'mo'

  const co2Display   = unitSystem === 'imperial' ? kgToLbs(co2Kg)      : co2Kg
  const co2Unit      = unitSystem === 'imperial' ? 'lbs'                : 'kg'
  const distance     = unitSystem === 'imperial' ? milesEq              : milesToKm(milesEq)
  const distanceUnit = unitSystem === 'imperial' ? 'mi'                 : 'km'

  // Scale bar always uses kg internally for consistency across unit switches
  const fillPct = Math.min((co2Kg / scaleMax) * 100, 100)

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex flex-col" title={tooltipText}>
      {/* Micro label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-none mb-2">
        CO₂
      </p>

      {/* flex-1 centers the emoji vertically when the tile is stretched to match siblings */}
      <div className="flex-1 flex items-center justify-center" aria-hidden="true">
        <span className="text-6xl">🚗</span>
        <span className="text-6xl">💨</span>
      </div>

      {/* Intensity bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-slate-300 rounded-full"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Values */}
      <div className="space-y-0.5 text-center">
        <p className="text-xs font-medium text-slate-600 leading-none">
          ~{co2Display.toFixed(2)}{' '}
          <span className="font-normal text-slate-400">{co2Unit} / {periodShort}</span>
        </p>
        {milesEq > 0 && (
          <p className="text-xs text-slate-400 leading-none">
            ≈ {Math.round(distance).toLocaleString()} {distanceUnit} driving
          </p>
        )}
      </div>
    </div>
  )
}
