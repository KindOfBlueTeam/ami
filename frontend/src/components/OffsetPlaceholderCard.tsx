export default function OffsetPlaceholderCard() {
  return (
    <div className="card p-5">
      {/* Title + badge */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium text-slate-700">Offset your impact</h2>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 leading-none">
          Coming Soon
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-slate-500 leading-relaxed">
        You can reduce your AI footprint by using fewer services—but you can also offset what
        remains.
      </p>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">
        Carbon credits fund projects that remove or prevent CO₂ emissions elsewhere, helping
        balance your impact.
      </p>

      {/* Supporting line */}
      <p className="text-xs text-slate-400 mt-3">
        We're working on a simple way to estimate and offset your remaining AI-related emissions.
      </p>

      {/* Callout */}
      <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 mt-3 leading-relaxed">
        Offsetting is optional and works best alongside reducing usage.
      </p>
    </div>
  )
}
