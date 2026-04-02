import { useMemo, type ReactNode } from 'react'
import PerspectiveTile from './PerspectiveTile'
import { getEnergyTiles, getWaterTiles } from '../../utils/ecoReferences'

// ─── Icons ────────────────────────────────────────────────────────────────────
// Simple 18×18 outline icons — slate-400 stroke, no fill, 1.5 stroke-width

const TvIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="17" height="12" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M7 18h6M10 14.5V18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const LaptopIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M3.5 4.5a1 1 0 011-1h11a1 1 0 011 1V13H3.5V4.5z" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M1 14.5h18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M2.5 10.5L10 3l7.5 7.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M4.5 9V17a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V9" stroke="#94a3b8" strokeWidth="1.5"/>
    <rect x="7.5" y="12" width="5" height="5.5" rx="0.5" stroke="#94a3b8" strokeWidth="1.2"/>
  </svg>
)

const EvIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M4 9.5l1.5-3.5h9L16 9.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinejoin="round"/>
    <rect x="1.5" y="9.5" width="17" height="5.5" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
    <circle cx="5.5" cy="16.5" r="1.8" stroke="#94a3b8" strokeWidth="1.2"/>
    <circle cx="14.5" cy="16.5" r="1.8" stroke="#94a3b8" strokeWidth="1.2"/>
    <path d="M8.5 12h3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const ShowerIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <circle cx="10" cy="7.5" r="3" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M4 4l3.5 3.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 13v1.5M10 13v2.5M13 13v1.5M8.5 16.5v1M11.5 16.5v1"
          stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const BathtubIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M2 10.5h16v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M4.5 10.5V6a1.5 1.5 0 013 0v1.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 17v1.5M15 17v1.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const WaterDropIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M10 3C7.5 7 5 9.5 5 12.5a5 5 0 0010 0C15 9.5 12.5 7 10 3z"
          stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7.5 14.5a2.5 2.5 0 002.5 1.5"
          stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const LaundryIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <rect x="2.5" y="2" width="15" height="17" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
    <circle cx="10" cy="12" r="4" stroke="#94a3b8" strokeWidth="1.5"/>
    <circle cx="6" cy="5.5" r="0.8" fill="#94a3b8"/>
    <path d="M8.5 12a1.5 1.5 0 011.5-1.5" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const TreeIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M10 2L4.5 10.5H8v2h4v-2h3.5L10 2z"
          stroke="#94a3b8" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M10 12.5v5.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const GamepadIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <rect x="2" y="6.5" width="16" height="9" rx="4" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M7 10.5V9M6.25 9.75h1.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="13.25" cy="9.25" r="0.8" fill="#94a3b8"/>
    <circle cx="11.25" cy="11.25" r="0.8" fill="#94a3b8"/>
    <path d="M6.5 6.5l.75-2h5.5l.75 2" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const ChipIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="10" height="10" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
    <rect x="7.5" y="7.5" width="5" height="5" rx="0.5" stroke="#94a3b8" strokeWidth="1"/>
    <path d="M7.5 2v3M10 2v3M12.5 2v3M7.5 15v3M10 15v3M12.5 15v3"
          stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M2 7.5h3M2 10h3M2 12.5h3M15 7.5h3M15 10h3M15 12.5h3"
          stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

const LawnIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M2 16h16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 16c0-4 2.5-6.5 5-8.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M15 16c0-4-2.5-6.5-5-8.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M10 7.5c0-2.5 1.5-4.5 2-5.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M10 7.5c0-2.5-1.5-4.5-2-5.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const PetBowlIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M3.5 9h13c0 4.5-2.9 7-6.5 7S3.5 13.5 3.5 9z" stroke="#94a3b8" strokeWidth="1.5"/>
    <path d="M3.5 9C3.5 7 5.5 5.5 10 5.5S16.5 7 16.5 9" stroke="#94a3b8" strokeWidth="1.3"/>
    <path d="M7.5 13.5a3 3 0 005 0" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const ICON_MAP: Record<string, ReactNode> = {
  tv:       <TvIcon />,
  laptop:   <LaptopIcon />,
  home:     <HomeIcon />,
  ev:       <EvIcon />,
  gamepad:  <GamepadIcon />,
  chip:     <ChipIcon />,
  shower:   <ShowerIcon />,
  bathtub:  <BathtubIcon />,
  drinking: <WaterDropIcon />,
  laundry:  <LaundryIcon />,
  tree:     <TreeIcon />,
  lawn:     <LawnIcon />,
  pet:      <PetBowlIcon />,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Total energy in kWh — pre-scaled for the selected period */
  kwhTotal: number
  /** Total water in liters — pre-scaled for the selected period */
  litersTotal: number
  period: 'month' | 'year'
}

export default function InPerspective({ kwhTotal, litersTotal, period }: Props) {
  const energyTiles = useMemo(
    () => getEnergyTiles(kwhTotal, period),
    [kwhTotal, period],
  )
  const waterTiles = useMemo(
    () => getWaterTiles(litersTotal, period),
    [litersTotal, period],
  )

  const periodPhrase = period === 'year' ? "this year's" : "this month's"

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-slate-600">In Perspective</h2>
        <p className="text-xs text-slate-300">
          {periodPhrase} estimated AI impact
        </p>
      </div>

      {/* Two-column card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Energy card */}
        <div className="card p-5">
          <div className="mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide leading-none mb-1.5">
              Energy in Perspective
            </p>
            <p className="text-2xl font-semibold text-slate-800 leading-none">
              {kwhTotal.toFixed(1)}
              <span className="text-sm font-normal text-slate-400 ml-1">kWh</span>
            </p>
          </div>
          <div className="space-y-3.5">
            {energyTiles.map((tile) => (
              <PerspectiveTile
                key={tile.key}
                icon={ICON_MAP[tile.key]}
                title={tile.title}
                phrase={tile.phrase}
              />
            ))}
          </div>
        </div>

        {/* Water card */}
        <div className="card p-5">
          <div className="mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide leading-none mb-1.5">
              Water in Perspective
            </p>
            <p className="text-2xl font-semibold text-slate-800 leading-none">
              {litersTotal.toFixed(0)}
              <span className="text-sm font-normal text-slate-400 ml-1">L</span>
            </p>
          </div>
          <div className="space-y-3.5">
            {waterTiles.map((tile) => (
              <PerspectiveTile
                key={tile.key}
                icon={ICON_MAP[tile.key]}
                title={tile.title}
                phrase={tile.phrase}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Transparency note */}
      <p className="text-xs text-slate-300 leading-relaxed">
        Estimates are based on average household energy and water usage and are intended
        to help make your AI impact easier to understand. Not precise measurements.
      </p>
    </div>
  )
}
