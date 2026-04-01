import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, updateSettings } from '../api/client'
import type { AppSettings } from '../types'

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-slate-50 last:border-0 gap-6">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            value === o.value
              ? 'badge-sage font-medium cursor-default'
              : 'badge badge-gray hover:bg-slate-200 transition-colors cursor-pointer'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const qc = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  const [local, setLocal] = useState<AppSettings>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) setLocal(settings)
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleSave = () => {
    updateMutation.mutate(local)
  }

  const set = (key: keyof AppSettings) => (v: string) =>
    setLocal((prev) => ({ ...prev, [key]: v }))

  if (isLoading) return <p className="text-slate-400 text-sm">Loading…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Preferences and configuration.</p>
      </div>

      {/* Preferences card */}
      <div className="card px-6 py-2">
        <Row
          label="Eco priority"
          sub="How much weight to give environmental impact in recommendations."
        >
          <ChipGroup
            value={(local.eco_priority ?? 'medium') as any}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            onChange={set('eco_priority')}
          />
        </Row>

        <Row
          label="Optimization style"
          sub="What Ami should prioritize in recommendations."
        >
          <ChipGroup
            value={(local.optimization_style ?? 'balanced') as any}
            options={[
              { value: 'cost', label: 'Cost' },
              { value: 'value', label: 'Value' },
              { value: 'eco', label: 'Eco' },
              { value: 'balanced', label: 'Balanced' },
            ]}
            onChange={set('optimization_style')}
          />
        </Row>

        <Row
          label="Eco tradeoff"
          sub="Would you pay more for a greener AI option?"
        >
          <ChipGroup
            value={(local.eco_tradeoff ?? 'maybe') as any}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'maybe', label: 'Maybe' },
              { value: 'no', label: 'No' },
            ]}
            onChange={set('eco_tradeoff')}
          />
        </Row>

        <Row
          label="Grid carbon intensity"
          sub="kg CO₂e per kWh. Default is US average (EPA 2023)."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              className="input w-28 text-sm"
              value={local.carbon_intensity_kwh ?? '0.386'}
              onChange={(e) => set('carbon_intensity_kwh')(e.target.value)}
            />
            <span className="text-xs text-slate-400">kg/kWh</span>
          </div>
        </Row>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving…' : 'Save preferences'}
        </button>
        {saved && <span className="text-xs text-sage-600">Saved ✓</span>}
      </div>

      {/* About */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-medium text-slate-600">About Ami</h2>
        <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            Ami is a local-first AI subscription tracker. All data is stored in a SQLite file
            on your device. No network requests are made to external services.
          </p>
          <p>
            <strong className="text-slate-500">V1 scope:</strong> Consumer AI subscriptions only.
            API platform billing (OpenAI API, Anthropic API, etc.) is not tracked — those have
            different billing models and are out of scope for this tool.
          </p>
          <p>
            <strong className="text-slate-500">Environmental estimates:</strong> kWh and CO₂e
            figures are rough approximations based on published research. They should be read as
            directional indicators, not precise measurements.
          </p>
          <p>Version 0.1.0 · Local prototype</p>
        </div>
      </div>
    </div>
  )
}
