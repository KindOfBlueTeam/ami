import clsx from 'clsx'
import { useUnitSystem } from '../contexts/UnitSystemContext'

export default function UnitSystemToggle() {
  const { unitSystem, setUnitSystem } = useUnitSystem()

  return (
    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
      <button
        className={clsx(
          'px-3 py-1.5 transition-colors',
          unitSystem === 'metric' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50',
        )}
        onClick={() => setUnitSystem('metric')}
      >
        🇬🇧 Metric
      </button>
      <button
        className={clsx(
          'px-3 py-1.5 transition-colors border-l border-slate-200',
          unitSystem === 'imperial' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50',
        )}
        onClick={() => setUnitSystem('imperial')}
      >
        🇺🇸 Imperial
      </button>
    </div>
  )
}
