/**
 * Ecological metric helpers for Ami.
 * All values are approximate estimates — rough order-of-magnitude, not precise measurements.
 */

// ─── Constants ─────────────────────────────────────────────────────────────────
// All documented as approximate; chosen from midpoints of commonly-cited ranges.

/** Grid carbon intensity (kg CO₂e / kWh) — US average, EPA eGRID 2022 */
export const GRID_INTENSITY_KG_PER_KWH = 0.386

/** Data center cooling water (liters / kWh) — typical range 1–2 L / kWh */
export const LITERS_PER_KWH = 1.5

/** Standard bathtub capacity in liters (~150 L for a typical US bathtub) */
export const BATHTUB_LITERS = 150

/** Energy draw of a 100-watt incandescent bulb for one hour (Wh) */
export const BULB_WH = 100

// ─── Conversions ──────────────────────────────────────────────────────────────

/** CO₂e kg → miles driven (0.404 kg CO₂e / mile, US average gasoline vehicle) */
export function co2KgToMiles(co2Kg: number): number {
  return co2Kg / 0.404
}

/** CO₂e kg → kWh of electricity (grid carbon intensity, default 0.386 kg CO₂e / kWh) */
export function co2KgToKwh(co2Kg: number, gridIntensity = GRID_INTENSITY_KG_PER_KWH): number {
  return co2Kg / gridIntensity
}

/** kWh → liters of cooling water (default 1.5 L / kWh, typical data center range 1–2 L / kWh) */
export function kwhToWaterLiters(kwh: number, litersPerKwh = LITERS_PER_KWH): number {
  return kwh * litersPerKwh
}

/** Liters → US gallons */
export function litersToGallons(liters: number): number {
  return liters * 0.264172
}

/** kWh → number of 100 W bulb-hours (1 kWh = 10 bulb-hours at 100 W) */
export function kwhToBulbHours(kwh: number): number {
  return (kwh * 1000) / BULB_WH
}

/** Liters → number of standard bathtubs (1 bathtub ≈ 150 L) */
export function litersToBathtubs(liters: number): number {
  return liters / BATHTUB_LITERS
}

/** Miles → kilometers */
export function milesToKm(miles: number): number {
  return miles * 1.60934
}

/** kg → pounds */
export function kgToLbs(kg: number): number {
  return kg * 2.20462
}

/** Scale a monthly value to yearly */
export function toYearly(monthly: number): number {
  return monthly * 12
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/** Map a compute intensity score (0–100) to a human-readable label */
export function computeIntensityLabel(score: number): string {
  if (score <= 25) return 'Low'
  if (score <= 50) return 'Moderate'
  if (score <= 75) return 'High'
  return 'Very High'
}

/**
 * Format an energy value for display.
 * < 1 kWh  →  Wh / month (or Wh / yr)   (rounded to integer)
 * ≥ 1 kWh  →  kWh / month (or kWh / yr) (1 decimal place)
 *
 * Never use "watts" — these are energy (kWh), not power (W).
 */
export function formatEnergy(valueKwh: number, period: 'month' | 'year' = 'month'): string {
  const label = period === 'year' ? 'yr' : 'month'
  if (valueKwh < 1.0) {
    return `${Math.round(valueKwh * 1000)} Wh / ${label}`
  }
  return `${valueKwh.toFixed(1)} kWh / ${label}`
}
