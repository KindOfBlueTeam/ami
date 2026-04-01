import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import clsx from 'clsx'
import {
  fetchSubscriptions,
  fetchPeriods,
  createPeriod,
  deletePeriod,
  fetchEntries,
  createEntry,
  deleteEntry,
} from '../api/client'
import type { Subscription, UsagePeriod, UsageEntry } from '../types'

const ACTIVITY_TYPES = [
  { value: 'message',   label: 'Messages / prompts', unit: 'messages' },
  { value: 'image',     label: 'Images generated',   unit: 'images' },
  { value: 'audio_min', label: 'Audio generated',     unit: 'minutes' },
  { value: 'video_min', label: 'Video generated',     unit: 'minutes' },
  { value: 'session',   label: 'Sessions',            unit: 'sessions' },
]

function PeriodRow({
  period,
  selected,
  onSelect,
  onDelete,
}: {
  period: UsagePeriod
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm',
        selected
          ? 'border-sage-400 bg-sage-400/5 text-sage-700'
          : 'border-slate-200 hover:border-slate-300 text-slate-700',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {format(parseISO(period.period_start), 'MMM d')} –{' '}
          {format(parseISO(period.period_end), 'MMM d, yyyy')}
        </span>
        <div className="flex items-center gap-3">
          {period.estimated_co2e_kg != null && (
            <span className="text-xs text-slate-400">
              {period.estimated_co2e_kg.toFixed(3)} kg CO₂e
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this period and all its entries?')) onDelete()
            }}
            className="text-slate-300 hover:text-red-400 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </button>
  )
}

function EntryRow({ entry, onDelete }: { entry: UsageEntry; onDelete: () => void }) {
  const at = ACTIVITY_TYPES.find((a) => a.value === entry.activity_type)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <div>
        <span className="text-sm text-slate-700">
          {entry.quantity} {at?.unit ?? entry.unit}
        </span>
        <span className="text-xs text-slate-400 ml-2">{at?.label ?? entry.activity_type}</span>
        {entry.notes && (
          <span className="text-xs text-slate-400 ml-2">· {entry.notes}</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {entry.estimated_co2e_kg != null && (
          <span className="text-xs text-slate-400">
            {entry.estimated_co2e_kg.toFixed(4)} kg CO₂e
          </span>
        )}
        <span className="text-xs text-slate-300">{format(parseISO(entry.entry_date), 'MMM d')}</span>
        <button
          onClick={() => confirm('Delete entry?') && onDelete()}
          className="text-slate-300 hover:text-red-400 text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function Usage() {
  const qc = useQueryClient()

  const [selectedSubId, setSelectedSubId] = useState<number | null>(null)
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null)
  const [showNewPeriod, setShowNewPeriod] = useState(false)
  const [showNewEntry, setShowNewEntry] = useState(false)

  const [periodForm, setPeriodForm] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  const [entryForm, setEntryForm] = useState({
    activity_type: 'message',
    quantity: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  })

  const { data: subs = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  })

  const { data: periods = [] } = useQuery({
    queryKey: ['periods', selectedSubId],
    queryFn: () => fetchPeriods(selectedSubId!),
    enabled: selectedSubId != null,
  })

  const { data: entries = [] } = useQuery({
    queryKey: ['entries', selectedPeriodId],
    queryFn: () => fetchEntries(selectedPeriodId!),
    enabled: selectedPeriodId != null,
  })

  const createPeriodMutation = useMutation({
    mutationFn: createPeriod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periods', selectedSubId] })
      setShowNewPeriod(false)
    },
  })

  const deletePeriodMutation = useMutation({
    mutationFn: deletePeriod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periods', selectedSubId] })
      if (selectedPeriodId != null) setSelectedPeriodId(null)
    },
  })

  const createEntryMutation = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries', selectedPeriodId] })
      setShowNewEntry(false)
      setEntryForm({ activity_type: 'message', quantity: '', entry_date: format(new Date(), 'yyyy-MM-dd'), notes: '' })
    },
  })

  const deleteEntryMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries', selectedPeriodId] }),
  })

  const selectedSub = subs.find((s) => s.id === selectedSubId)
  const activeSubs = subs.filter((s) => s.status === 'active')

  const actType = ACTIVITY_TYPES.find((a) => a.value === entryForm.activity_type)

  const totalCo2Period = entries.reduce((s, e) => s + (e.estimated_co2e_kg ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Usage</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Track your AI activity and its estimated environmental footprint.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: subscription selector */}
        <div className="col-span-1 space-y-2">
          <p className="label">Service</p>
          {activeSubs.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubId(s.id)
                setSelectedPeriodId(null)
              }}
              className={clsx(
                'w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-colors',
                selectedSubId === s.id
                  ? 'border-sage-400 bg-sage-400/5 text-sage-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700',
              )}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: s.provider?.logo_color ?? '#6B7280' }}
              >
                {s.provider?.name.charAt(0)}
              </div>
              <span className="font-medium">{s.provider?.name}</span>
            </button>
          ))}
          {activeSubs.length === 0 && (
            <p className="text-xs text-slate-400">No active subscriptions.</p>
          )}
        </div>

        {/* Middle: periods */}
        <div className="col-span-1 space-y-2">
          {selectedSubId && (
            <>
              <div className="flex items-center justify-between">
                <p className="label">Billing period</p>
                <button
                  className="text-xs text-sage-600 hover:text-sage-700"
                  onClick={() => setShowNewPeriod(true)}
                >
                  + Add
                </button>
              </div>

              {showNewPeriod && (
                <div className="card p-3 space-y-2">
                  <div>
                    <label className="label">Start</label>
                    <input
                      type="date"
                      className="input text-xs"
                      value={periodForm.start}
                      onChange={(e) => setPeriodForm((f) => ({ ...f, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">End</label>
                    <input
                      type="date"
                      className="input text-xs"
                      value={periodForm.end}
                      onChange={(e) => setPeriodForm((f) => ({ ...f, end: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary text-xs py-1 flex-1"
                      onClick={() => setShowNewPeriod(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary text-xs py-1 flex-1"
                      disabled={createPeriodMutation.isPending}
                      onClick={() =>
                        createPeriodMutation.mutate({
                          subscription_id: selectedSubId,
                          period_start: periodForm.start,
                          period_end: periodForm.end,
                          notes: null,
                          estimated_kwh: null,
                          estimated_co2e_kg: null,
                        } as any)
                      }
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {periods.map((p) => (
                  <PeriodRow
                    key={p.id}
                    period={p}
                    selected={selectedPeriodId === p.id}
                    onSelect={() => setSelectedPeriodId(p.id)}
                    onDelete={() => deletePeriodMutation.mutate(p.id)}
                  />
                ))}
                {periods.length === 0 && !showNewPeriod && (
                  <p className="text-xs text-slate-400">No periods yet.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: entries */}
        <div className="col-span-1">
          {selectedPeriodId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="label">Activity entries</p>
                <button
                  className="text-xs text-sage-600 hover:text-sage-700"
                  onClick={() => setShowNewEntry(true)}
                >
                  + Add
                </button>
              </div>

              {showNewEntry && (
                <div className="card p-3 space-y-2">
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input text-xs"
                      value={entryForm.activity_type}
                      onChange={(e) => setEntryForm((f) => ({ ...f, activity_type: e.target.value }))}
                    >
                      {ACTIVITY_TYPES.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity ({actType?.unit})</label>
                    <input
                      type="number"
                      min="0"
                      className="input text-xs"
                      placeholder="0"
                      value={entryForm.quantity}
                      onChange={(e) => setEntryForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input text-xs"
                      value={entryForm.entry_date}
                      onChange={(e) => setEntryForm((f) => ({ ...f, entry_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Notes <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                    <input
                      className="input text-xs"
                      placeholder="optional…"
                      value={entryForm.notes}
                      onChange={(e) => setEntryForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary text-xs py-1 flex-1"
                      onClick={() => setShowNewEntry(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary text-xs py-1 flex-1"
                      disabled={createEntryMutation.isPending || !entryForm.quantity}
                      onClick={() =>
                        createEntryMutation.mutate({
                          period_id: selectedPeriodId,
                          entry_date: entryForm.entry_date,
                          activity_type: entryForm.activity_type,
                          quantity: parseFloat(entryForm.quantity),
                          unit: actType?.unit ?? 'units',
                          notes: entryForm.notes || null,
                          estimated_kwh: null,
                          estimated_co2e_kg: null,
                        } as any)
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {entries.length > 0 && (
                <div className="card px-4 py-1">
                  {entries.map((e) => (
                    <EntryRow
                      key={e.id}
                      entry={e}
                      onDelete={() => deleteEntryMutation.mutate(e.id)}
                    />
                  ))}
                </div>
              )}

              {entries.length === 0 && !showNewEntry && (
                <p className="text-xs text-slate-400">No entries yet.</p>
              )}

              {totalCo2Period > 0 && (
                <div className="card p-3 text-center">
                  <p className="text-xs text-slate-400">Period total</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {totalCo2Period.toFixed(4)} kg CO₂e
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Methodology note */}
      <div className="card p-4 bg-slate-50/50 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-500">About these estimates:</strong> Energy figures are rough
        approximations based on published research (typically 0.003 kWh/message for chat AI,
        0.02 kWh/image for image generation). Actual consumption varies by model, hardware, and
        data center. CO₂e uses the US average grid intensity of 0.386 kg/kWh. These numbers
        are directionally useful, not precise.
      </div>
    </div>
  )
}
