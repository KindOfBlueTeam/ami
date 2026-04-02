interface Props {
  icon: React.ReactNode
  title: string
  phrase: string
}

export default function PerspectiveTile({ icon, title, phrase }: Props) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-50 rounded-lg">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-medium text-slate-600 leading-tight">{title}</p>
        <p className="text-xs text-slate-400 leading-snug mt-0.5">{phrase}</p>
      </div>
    </div>
  )
}
