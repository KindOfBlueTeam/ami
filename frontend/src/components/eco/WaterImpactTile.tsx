import WaterFlask from './WaterFlask'
import BathtubRow from './BathtubRow'
import { litersToGallons } from '../../utils/ecoMetrics'
import { useUnitSystem } from '../../contexts/UnitSystemContext'

export interface WaterImpactTileProps {
  /** Water in liters — pre-scaled for the display period */
  litersMonthly: number
  period: 'month' | 'year'
  /**
   * Show the BathtubRow graphic below the flask.
   * Use true on the Dashboard (aggregate story); false on per-service cards.
   */
  showBathtubs?: boolean
  tooltipText?: string
}

export default function WaterImpactTile({
  litersMonthly,
  period,
  showBathtubs = false,
  tooltipText,
}: WaterImpactTileProps) {
  const { unitSystem } = useUnitSystem()

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex flex-col">
      {/* Micro label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-500 leading-none mb-2">
        Water
      </p>

      {/*
        Flask viewBox is 80×120 (aspect 2:3).
        Fix width at 53px → graphic height = 53 × (120/80) ≈ 80px, matching the gauge.
        No fixed-height wrapper — WaterFlask renders its own text labels below the
        graphic and they must flow naturally in the column.
      */}
      <div className="flex-1 flex items-center justify-center">
        <div style={{ width: 53 }}>
          <WaterFlask
            litersMonthly={litersMonthly}
            gallonsMonthly={litersToGallons(litersMonthly)}
            period={period}
            unitSystem={unitSystem}
            tooltipText={tooltipText}
          />
        </div>
      </div>

      {/* Bathtub equivalence — dashboard only */}
      {showBathtubs && litersMonthly > 0 && (
        <div className="mt-2">
          <BathtubRow litersMonthly={litersMonthly} period={period} />
        </div>
      )}
    </div>
  )
}
