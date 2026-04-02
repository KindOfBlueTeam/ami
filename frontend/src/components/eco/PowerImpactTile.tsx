import ComputeGauge from './ComputeGauge'

export interface PowerImpactTileProps {
  /** Compute intensity score 0–100 */
  score: number
  /** Human label: Low / Moderate / High / Very High */
  label: string
  /** Energy in kWh — pre-scaled for the display period */
  energyKwh: number
  period: 'month' | 'year'
  tooltipText?: string
}

export default function PowerImpactTile({
  score,
  label,
  energyKwh,
  period,
  tooltipText,
}: PowerImpactTileProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex flex-col">
      {/* Micro label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 leading-none mb-2">
        Power
      </p>

      {/*
        flex-1 lets this area grow to fill tile height so the gauge is vertically
        centered when the three tiles are equal-height in a CSS grid row.
        Cap width at 133px so the 200×120 gauge viewBox renders at ~80px tall.
      */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full" style={{ maxWidth: 133 }}>
          <ComputeGauge
            score={score}
            label={label}
            energyKwhMonthly={energyKwh}
            period={period}
            tooltipText={tooltipText}
          />
        </div>
      </div>
    </div>
  )
}
