import { format, parseISO, differenceInDays } from 'date-fns'
import clsx from 'clsx'
import type { Subscription } from '../types'

interface Props {
  sub: Subscription
  onEdit?: () => void
  onDelete?: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  chat: 'Chat AI',
  image: 'Image AI',
  audio: 'Audio AI',
  video: 'Video AI',
  coding: 'Coding AI',
  writing: 'Writing AI',
}

const VALUE_COLORS: Record<string, string> = {
  low:    'badge-red',
  medium: 'badge-amber',
  high:   'badge-green',
}

const USAGE_LABELS: Record<string, string> = {
  light:    'Light use',
  moderate: 'Moderate',
  heavy:    'Heavy use',
}

export default function ServiceCard({ sub, onEdit, onDelete }: Props) {
  const renewal = parseISO(sub.renewal_date)
  const daysUntil = differenceInDays(renewal, new Date())
  const renewalLabel = daysUntil === 0
    ? 'Renews today'
    : daysUntil < 0
    ? `Renewed ${Math.abs(daysUntil)}d ago`
    : daysUntil <= 7
    ? `Renews in ${daysUntil}d`
    : format(renewal, 'MMM d')

  const renewalUrgent = daysUntil >= 0 && daysUntil <= 7

  const monthlyCost = sub.monthly_cost ?? (
    sub.billing_interval === 'annual' ? sub.cost / 12 : sub.cost
  )

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: sub.provider?.logo_color ?? '#6B7280' }}
          >
            {sub.provider?.name.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="font-medium text-slate-800 leading-tight">
              {sub.provider?.name ?? 'Unknown'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {sub.plan?.name ?? sub.custom_plan_name ?? 'Custom plan'}
            </p>
          </div>
        </div>

        {/* Cost */}
        <div className="text-right shrink-0">
          <p className="font-semibold text-slate-800">
            ${monthlyCost.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </p>
          {sub.billing_interval === 'annual' && (
            <p className="text-xs text-slate-400">${sub.cost.toFixed(0)}/yr billed</p>
          )}
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4">
        {sub.provider?.category && (
          <span className="badge-gray">
            {CATEGORY_LABELS[sub.provider.category] ?? sub.provider.category}
          </span>
        )}
        <span className={VALUE_COLORS[sub.perceived_value]}>
          {sub.perceived_value === 'high' ? 'High value' : sub.perceived_value === 'medium' ? 'Medium value' : 'Low value'}
        </span>
        <span className="badge-gray">{USAGE_LABELS[sub.usage_estimate]}</span>
        <span className={clsx('badge', renewalUrgent ? 'badge-amber' : 'badge-gray')}>
          {renewalLabel}
        </span>
      </div>

      {/* Eco estimate */}
      {sub.estimated_co2e_kg_monthly != null && (
        <p className="text-xs text-slate-400 mt-3">
          ~{sub.estimated_co2e_kg_monthly.toFixed(2)} kg CO₂e/mo
          {sub.co2_miles_equivalent_monthly != null && sub.co2_miles_equivalent_monthly > 0 && (
            <span
              className="ml-1.5"
              title="Based on average gasoline vehicle emissions (0.404 kg CO₂e/mile)"
            >
              · ≈ driving {sub.co2_miles_equivalent_monthly} mi
            </span>
          )}
        </p>
      )}

      {/* Compute intensity */}
      {sub.compute_intensity_score != null && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-0.5">
            <span
              className="text-xs text-slate-400"
              title="Estimated GPU/CPU compute load relative to other AI categories (0 = minimal, 100 = maximum)"
            >
              ⚡ Compute intensity · {
                sub.compute_intensity_score < 30 ? 'Low' :
                sub.compute_intensity_score < 55 ? 'Moderate' :
                sub.compute_intensity_score < 75 ? 'High' : 'Very high'
              }
            </span>
            <span className="text-xs text-slate-400">{sub.compute_intensity_score}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full', {
                'bg-green-400':  sub.compute_intensity_score < 30,
                'bg-amber-400':  sub.compute_intensity_score >= 30 && sub.compute_intensity_score < 55,
                'bg-orange-400': sub.compute_intensity_score >= 55 && sub.compute_intensity_score < 75,
                'bg-red-400':    sub.compute_intensity_score >= 75,
              })}
              style={{ width: `${sub.compute_intensity_score}%` }}
            />
          </div>
        </div>
      )}

      {/* Water usage */}
      {sub.water_liters_monthly != null && sub.water_liters_monthly > 0 && (
        <p
          className="text-xs text-slate-400 mt-1.5"
          title="Estimated water used for cooling data center hardware (1.5 L per kWh)"
        >
          💧 ~{sub.water_liters_monthly.toFixed(2)} L water/mo
          <span className="ml-1">· ≈ {(sub.water_liters_monthly / 3.785).toFixed(2)} gal</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        {/* Service links */}
        {sub.provider?.account_url && (
          <a
            href={sub.provider.account_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs py-1 px-2"
          >
            Manage account ↗
          </a>
        )}
        {sub.provider?.billing_url && (
          <a
            href={sub.provider.billing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs py-1 px-2"
          >
            Billing ↗
          </a>
        )}
        {sub.provider?.link_notes && (
          <span
            className="text-xs text-slate-400 cursor-help select-none"
            title={sub.provider.link_notes}
          >
            ⓘ
          </span>
        )}

        {/* Spacer pushes edit/remove to the right */}
        <span className="flex-1" />

        {onEdit && (
          <button onClick={onEdit} className="btn-ghost text-xs py-1 px-2">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn-danger text-xs py-1 px-2">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
