/**
 * Real-world reference constants and humanization helpers for "In Perspective" equivalences.
 *
 * All values are illustrative household-scale averages — not precise measurements.
 * The goal is to make AI-related energy and water totals easier to understand for
 * anyone, regardless of technical background.
 */

// ─── Energy references (kWh) ────────────────────────────────────────────────

/** Average LED television (~100 W): kWh per hour of viewing */
export const TV_KWH_PER_HOUR = 0.1

/** Typical laptop (plugged in, active use): kWh per hour */
export const LAPTOP_KWH_PER_HOUR = 0.05

/** 100-watt incandescent bulb: kWh per hour */
export const BULB_100W_KWH_PER_HOUR = 0.1

/** Average US home electricity consumption: kWh per day */
export const HOME_KWH_PER_DAY = 30

/** Average electric vehicle energy consumption: kWh per mile */
export const EV_KWH_PER_MILE = 0.3

/** Sony PS5 typical power draw during active gameplay: kWh per hour */
export const PS5_KWH_PER_HOUR = 0.22

/** Discrete GPU at full computational load (e.g. ML training): kWh per hour */
export const GPU_KWH_PER_HOUR = 0.6

// ─── Water references (liters) ───────────────────────────────────────────────

/** Average 8-minute shower: liters */
export const SHOWER_LITERS = 50

/** Standard bathtub fill: liters */
export const BATHTUB_LITERS = 150

/** Recommended daily drinking water per person: liters */
export const DRINKING_LITERS_PER_DAY = 2

/** Average washing machine load: liters */
export const LAUNDRY_LITERS_PER_LOAD = 70

/** Watering a mature backyard tree: liters per month */
export const TREE_LITERS_PER_MONTH = 75

/** Typical lawn watering: gallons per square foot per session */
export const LAWN_GALLONS_PER_SQFT = 0.62
/** LAWN_GALLONS_PER_SQFT converted to liters per sq ft (× 3.785 L/gal) */
export const LAWN_LITERS_PER_SQFT = 0.62 * 3.785  // ≈ 2.35

/** Pet water bowl: 3 cups per fill (1 cup = 0.2366 L) */
export const PET_BOWL_LITERS = 3 * 0.2366  // ≈ 0.71

// ─── Tile data type ──────────────────────────────────────────────────────────

export interface TileData {
  key: string
  title: string
  phrase: string
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Round a number to a human-friendly value.
 * < 10   → nearest 1
 * < 50   → nearest 2
 * < 200  → nearest 5
 * < 2000 → nearest 10
 * else   → nearest 100
 */
function roundH(n: number): number {
  if (n <= 0) return 0
  if (n < 10)   return Math.round(n)
  if (n < 50)   return Math.round(n / 2) * 2
  if (n < 200)  return Math.round(n / 5) * 5
  if (n < 2000) return Math.round(n / 10) * 10
  return Math.round(n / 100) * 100
}

/**
 * Humanize a total-hours figure into a natural phrase.
 *
 * Short totals  → "≈ N hrs of X"
 * Day-scale     → "≈ N days of X"
 * Week-scale    → "≈ N weeks of X"
 * Large totals  → normalize to per-day framing: "≈ N hrs/day of X"
 */
function humanizeHours(
  hours: number,
  activity: string,
  period: 'month' | 'year',
): [phrase: string, score: number] {
  const daysInPeriod = period === 'year' ? 365 : 30

  if (hours < 0.5)  return [`less than 30 min of ${activity}`, 4]
  if (hours < 1)    return [`less than one hour of ${activity}`, 5]

  const days = hours / 24
  if (days < 1)   return [`≈ ${roundH(hours)} hr${roundH(hours) !== 1 ? 's' : ''} of ${activity}`, 9]
  if (days < 1.5) return [`about a day of ${activity}`, 10]
  if (days < 7) {
    const d = roundH(days)
    return [`≈ ${d} day${d !== 1 ? 's' : ''} of ${activity}`, 9]
  }
  if (days < 30) {
    const w = roundH(days / 7)
    return [`≈ ${w} week${w !== 1 ? 's' : ''} of ${activity}`, 9]
  }

  // Normalize to per-day framing for the given period
  const hpd = hours / daysInPeriod
  if (hpd < 0.25) {
    const mins = Math.round(hpd * 60)
    return [`≈ ${mins} min/day of ${activity}`, 8]
  }
  if (hpd < 1) {
    const mins = Math.round(hpd * 60)
    return [`≈ ${mins} min/day of ${activity}`, 8]
  }
  // Round to nearest 0.5 below 5, nearest 1 at or above 5
  const rounded = hpd >= 5 ? Math.round(hpd) : Math.round(hpd * 2) / 2
  const hStr = rounded === Math.floor(rounded) ? String(rounded) : rounded.toFixed(1)
  const score = hpd > 12 ? 7 : 9   // > 12 hrs/day is technically true but extreme
  return [`≈ ${hStr} hr${rounded !== 1 ? 's' : ''}/day of ${activity}`, score]
}

/**
 * Humanize a count of discrete physical things (showers, loads, bathtubs).
 *
 * Very small  → "less than one X" or, in monthly context, "≈ one X every N months"
 * Near-1      → "≈ 1 X"
 * Multiple    → "≈ N Xs"
 */
function humanizeCount(
  count: number,
  singular: string,
  plural: string,
  period: 'month' | 'year',
): [phrase: string, score: number] {
  if (count < 0.15) {
    return [`less than one ${singular}`, 3]
  }
  if (count < 0.75) {
    if (period === 'month') {
      const every = Math.round(1 / count)
      return [
        `≈ one ${singular} every ${every} month${every !== 1 ? 's' : ''}`,
        every <= 4 ? 7 : 5,
      ]
    }
    // In yearly context, a fraction < 1 reads cleanly as "≈ one X"
    return [`≈ one ${singular}`, 7]
  }
  if (count < 1.5) return [`≈ 1 ${singular}`, 10]
  const r = roundH(count)
  return [`≈ ${r} ${plural}`, 10]
}

/**
 * Humanize a days figure (e.g. days of home electricity, days of drinking water).
 *
 * Sub-hour    → "less than one hour of X"
 * Hours       → "≈ N hrs of X"
 * Days        → "≈ N days of X"
 * Weeks       → "≈ N weeks of X"
 * Months      → "≈ N months of X"
 */
function humanizeDays(days: number, what: string): [phrase: string, score: number] {
  if (days < 0.04) return [`less than one hour of ${what}`, 3]
  if (days < 0.5) {
    const h = Math.round(days * 24)
    return [`≈ ${h} hr${h !== 1 ? 's' : ''} of ${what}`, 7]
  }
  if (days < 1.5) return [`≈ 1 day of ${what}`, 10]
  if (days < 7) {
    const d = roundH(days)
    return [`≈ ${d} day${d !== 1 ? 's' : ''} of ${what}`, 10]
  }
  if (days < 60) {
    const w = roundH(days / 7)
    return [`≈ ${w} week${w !== 1 ? 's' : ''} of ${what}`, 9]
  }
  const m = roundH(days / 30)
  return [`≈ ${m} month${m !== 1 ? 's' : ''} of ${what}`, 8]
}

// ─── Per-tile phrase generators ──────────────────────────────────────────────

type ScoredTile = TileData & { score: number }

function tileTV(kwh: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeHours(kwh / TV_KWH_PER_HOUR, 'TV watching', period)
  return { key: 'tv', title: 'Watching TV', phrase, score }
}

function tileLaptop(kwh: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeHours(kwh / LAPTOP_KWH_PER_HOUR, 'laptop use', period)
  return { key: 'laptop', title: 'Using a laptop', phrase, score }
}

function tileHome(kwh: number, _period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeDays(kwh / HOME_KWH_PER_DAY, 'home electricity')
  return { key: 'home', title: 'Home electricity', phrase, score }
}

function tilePS5(kwh: number, _period: 'month' | 'year'): ScoredTile {
  const hours = kwh / PS5_KWH_PER_HOUR
  const r = Math.round(hours)
  const phrase = r <= 0
    ? 'less than one hour at full load'
    : `≈ ${r} hr${r !== 1 ? 's' : ''} at full load`
  return { key: 'gamepad', title: 'Playing on a PS5', phrase, score: 9 }
}

function tileGPU(kwh: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeHours(kwh / GPU_KWH_PER_HOUR, 'GPU at full load', period)
  return { key: 'chip', title: 'GPU at full load', phrase, score }
}

function tileEV(kwh: number, _period: 'month' | 'year'): ScoredTile {
  const miles = kwh / EV_KWH_PER_MILE
  let phrase: string
  let score = 9
  if (miles < 1) {
    phrase = `less than 1 mile of EV driving`
    score = 4
  } else {
    const r = roundH(miles)
    const rStr = r >= 1000 ? r.toLocaleString() : String(r)
    phrase = `≈ ${rStr} mile${r !== 1 ? 's' : ''} of EV driving`
  }
  return { key: 'ev', title: 'Charging an EV', phrase, score }
}

function tileShower(liters: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeCount(liters / SHOWER_LITERS, 'shower', 'showers', period)
  return { key: 'shower', title: 'Taking showers', phrase, score }
}

function tileBathtub(liters: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeCount(liters / BATHTUB_LITERS, 'bathtub', 'bathtubs', period)
  return { key: 'bathtub', title: 'Filling a bathtub', phrase, score }
}

function tileDrinking(liters: number, _period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeDays(liters / DRINKING_LITERS_PER_DAY, 'drinking water')
  return { key: 'drinking', title: 'Drinking water', phrase, score }
}

function tileLaundry(liters: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeCount(
    liters / LAUNDRY_LITERS_PER_LOAD, 'laundry load', 'laundry loads', period,
  )
  return { key: 'laundry', title: 'Doing laundry', phrase, score }
}

function tileLawn(liters: number, _period: 'month' | 'year'): ScoredTile {
  const sqft = liters / LAWN_LITERS_PER_SQFT
  let phrase: string
  let score = 9
  if (sqft < 1) {
    phrase = 'less than 1 sq ft of lawn watered'
    score = 3
  } else {
    const r = roundH(sqft)
    phrase = `≈ ${r >= 1000 ? r.toLocaleString() : r} sq ft of lawn watered`
  }
  return { key: 'lawn', title: 'Watering a lawn', phrase, score }
}

function tilePet(liters: number, period: 'month' | 'year'): ScoredTile {
  const [phrase, score] = humanizeCount(
    liters / PET_BOWL_LITERS, 'pet water bowl', 'pet water bowls', period,
  )
  return { key: 'pet', title: 'Water for a pet', phrase, score }
}

function tileTree(liters: number, _period: 'month' | 'year'): ScoredTile {
  const months = liters / TREE_LITERS_PER_MONTH
  let phrase: string
  let score = 9
  if (months < 0.05) {
    phrase = `less than a week of watering a tree`
    score = 3
  } else if (months < 0.5) {
    const w = Math.max(1, Math.round(months * 4.33))
    phrase = `≈ ${w} week${w !== 1 ? 's' : ''} of watering a tree`
    score = 7
  } else if (months < 1.5) {
    phrase = `≈ 1 month of watering a tree`
    score = 10
  } else if (months < 12) {
    const m = roundH(months)
    phrase = `≈ ${m} month${m !== 1 ? 's' : ''} of watering a tree`
    score = 10
  } else {
    const y = roundH(months / 12)
    phrase = `≈ ${y} year${y !== 1 ? 's' : ''} of watering a tree`
    score = 8
  }
  return { key: 'tree', title: 'Watering a tree', phrase, score }
}

// ─── Public tile selection ────────────────────────────────────────────────────

/**
 * Returns the best 6 energy perspective tiles for the given kWh total and period.
 *
 * Tile selection strategy:
 *   - Personal scale: TV, laptop, PS5, GPU (relatable daily activities)
 *   - Household scale: home electricity (familiar baseline)
 *   - Broader/lifestyle: EV driving (puts it in a journey context)
 *
 * Tiles are scored by readability: direct counts and day/week framings score highest;
 * "less than one" and extreme per-day values score lower. The top 6 by score are returned.
 */
export function getEnergyTiles(kwhTotal: number, period: 'month' | 'year'): TileData[] {
  const candidates: ScoredTile[] = [
    tileTV(kwhTotal, period),
    tileLaptop(kwhTotal, period),
    tileHome(kwhTotal, period),
    tileEV(kwhTotal, period),
    tilePS5(kwhTotal, period),
    tileGPU(kwhTotal, period),
  ]
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ key, title, phrase }) => ({ key, title, phrase }))
}

/**
 * Returns the best 6 water perspective tiles for the given liters total and period.
 *
 * Tile selection strategy:
 *   - Personal scale: showers, drinking water, pet bowl (relatable daily activities)
 *   - Household scale: laundry, bathtub, lawn watering
 *   - Broader/lifestyle: tree watering (living system context)
 *
 * 7 candidates, top 6 by readability score are returned.
 */
export function getWaterTiles(litersTotal: number, period: 'month' | 'year'): TileData[] {
  const candidates: ScoredTile[] = [
    tileShower(litersTotal, period),
    tileBathtub(litersTotal, period),
    tileDrinking(litersTotal, period),
    tileLaundry(litersTotal, period),
    tileTree(litersTotal, period),
    tileLawn(litersTotal, period),
    tilePet(litersTotal, period),
  ]
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ key, title, phrase }) => ({ key, title, phrase }))
}
