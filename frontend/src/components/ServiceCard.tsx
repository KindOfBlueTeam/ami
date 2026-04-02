import { format, parseISO, differenceInDays } from 'date-fns'
import clsx from 'clsx'
import type { Subscription } from '../types'
import PowerImpactTile from './eco/PowerImpactTile'
import Co2ImpactTile from './eco/Co2ImpactTile'
import WaterImpactTile from './eco/WaterImpactTile'
import ProviderLogo from './ProviderLogo'
import { computeIntensityLabel } from '../utils/ecoMetrics'

interface Props {
  sub: Subscription
  onEdit?: () => void
  onDelete?: () => void
  displayMode?: 'monthly' | 'yearly'
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


export default function ServiceCard({ sub, onEdit, onDelete, displayMode = 'monthly' }: Props) {
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

  // Scale eco values by period multiplier
  const multiplier = displayMode === 'yearly' ? 12 : 1
  const period: 'month' | 'year' = displayMode === 'yearly' ? 'year' : 'month'

  const energyKwh  = (sub.estimated_kwh_monthly ?? 0) * multiplier
  const waterL     = (sub.water_liters_monthly ?? 0) * multiplier
  const co2Kg      = (sub.estimated_co2e_kg_monthly ?? 0) * multiplier
  const milesEq    = (sub.co2_miles_equivalent_monthly ?? 0) * multiplier

  const hasGauge = sub.compute_intensity_score != null && sub.estimated_kwh_monthly != null
  const hasFlask = sub.water_liters_monthly != null && sub.water_liters_monthly > 0
  const hasCo2   = sub.estimated_co2e_kg_monthly != null
  const hasEco   = hasGauge || hasFlask || hasCo2

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between gap-3">
        {/* Provider logo + name */}
        <div className="flex items-center gap-3">
          <ProviderLogo
            name={sub.provider?.name ?? '?'}
            logoColor={sub.provider?.logo_color}
            size="md"
          />
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
        <span className={
          sub.billing_interval === 'annual'  ? 'badge-green' :
          sub.billing_interval === 'monthly' ? 'badge-amber' :
                                               'badge-red'
        }>
          {sub.billing_interval === 'annual'  ? 'Annual billing'  :
           sub.billing_interval === 'monthly' ? 'Monthly billing' :
                                                'Daily billing'}
        </span>
        <span className={clsx('badge', renewalUrgent ? 'badge-amber' : 'badge-gray')}>
          {renewalLabel}
        </span>
      </div>

      {/* Eco impact — three equal resource tiles: Power → CO₂ → Water */}
      {hasEco && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-[10px] uppercase tracking-wide text-slate-300 leading-none mb-2.5">
            Estimated resource impact
          </p>
          <div className="grid grid-cols-3 gap-2">
            {hasGauge && (
              <PowerImpactTile
                score={sub.compute_intensity_score!}
                label={computeIntensityLabel(sub.compute_intensity_score!)}
                energyKwh={energyKwh}
                period={period}
                tooltipText="Relative estimate based on workload type and your usage level"
              />
            )}
            {hasCo2 && (
              <Co2ImpactTile
                co2Kg={co2Kg}
                milesEq={milesEq}
                period={period}
                scaleMax={period === 'year' ? 60 : 5}
                tooltipText="Based on average US grid carbon intensity (0.386 kg CO₂e / kWh)"
              />
            )}
            {hasFlask && (
              <WaterImpactTile
                litersMonthly={waterL}
                period={period}
                tooltipText="Estimated from energy usage using typical data center cooling (~1–2 L per kWh)"
              />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-50">
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
