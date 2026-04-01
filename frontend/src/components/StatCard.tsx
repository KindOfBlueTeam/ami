import clsx from 'clsx'

interface Props {
  label: string
  value: string
  sub?: string
  accent?: 'sage' | 'amber' | 'red' | 'blue' | 'default'
  className?: string
}

const accents = {
  sage:    'border-t-sage-500',
  amber:   'border-t-amber-400',
  red:     'border-t-red-400',
  blue:    'border-t-blue-400',
  default: 'border-t-slate-200',
}

export default function StatCard({ label, value, sub, accent = 'default', className }: Props) {
  return (
    <div className={clsx('card p-5 border-t-2', accents[accent], className)}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
    </div>
  )
}
