/**
 * Ecological metric helpers for Ami.
 * All values are approximate estimates — rough order-of-magnitude, not precise measurements.
 */

// ─── Conversions ──────────────────────────────────────────────────────────────

/** CO₂e kg → miles driven (0.404 kg CO₂e / mile, US average gasoline vehicle) */
export function co2KgToMiles(co2Kg: number): number {
  return co2Kg / 0.404
}

/** CO₂e kg → kWh of electricity (grid carbon intensity, default 0.386 kg CO₂e / kWh) */
export function co2KgToKwh(co2Kg: number, gridIntensity = 0.386): number {
  return co2Kg / gridIntensity
}

/** kWh → liters of cooling water (default 1.5 L / kWh, typical data center range 1–2 L / kWh) */
export function kwhToWaterLiters(kwh: number, litersPerKwh = 1.5): number {
  return kwh * litersPerKwh
}

/** Liters → US gallons */
export function litersToGallons(liters: number): number {
  return liters * 0.264172
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
 * < 1 kWh  →  Wh / month (rounded to integer)
 * ≥ 1 kWh  →  kWh / month (1 decimal place)
 *
 * Never use "watts" — these are energy (kWh), not power (W).
 */
export function formatEnergy(valueKwh: number): string {
  if (valueKwh < 1.0) {
    return `${Math.round(valueKwh * 1000)} Wh / month`
  }
  return `${valueKwh.toFixed(1)} kWh / month`
}
