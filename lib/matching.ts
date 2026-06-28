// Fit-score engine. Pure functions: a buyer profile + a realtor go in,
// { score, reasons } comes out. Keep all scoring rules here, never in components.

import type { Realtor, HomeType, CommStyle } from './realtors'

export interface BuyerProfile {
  priceMin: number
  priceMax: number
  region: string
  regionLat?: number
  regionLng?: number
  regionRadiusMi?: number
  inState: 'in' | 'out'
  firstTime: boolean
  homeType: HomeType
  timeline: 'asap' | '3mo' | '6mo' | 'browsing'
  preApproved: boolean
  experiencePref: 'newer' | 'experienced' | 'noPref'
  commStyle: CommStyle
}

export interface Reason {
  type: 'plus' | 'minus'
  text: string
}

export interface ScoreResult {
  score: number
  reasons: Reason[]
}

export interface MatchResult extends ScoreResult {
  realtor: Realtor
}

interface Factor {
  weight: number
  value: number
  plus?: string | null
  minus?: string | null
}

const HOME_TYPE_LABEL: Record<HomeType, string> = {
  starter: 'starter homes',
  investment: 'investment properties',
  luxury: 'luxury homes',
  condo: 'condos',
  'multi-family': 'multi-family homes',
  land: 'land',
}

const COMM_LABEL: Record<CommStyle, string> = {
  text: 'texting',
  call: 'phone calls',
  video: 'video calls',
  'in-person': 'in-person meetings',
}

const usd = (n: number): string =>
  '$' + Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 })

function haversineDistanceMi(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// A factor only counts toward the score when it's relevant to this buyer, so
// irrelevant factors never quietly penalize an agent.
export function scoreRealtor(buyer: BuyerProfile, realtor: Realtor): ScoreResult {
  const factors: Factor[] = []

  // --- Location (always matters most) ---
  let servesArea: boolean
  if (
    buyer.regionLat != null && buyer.regionLng != null &&
    realtor.serviceLat != null && realtor.serviceLng != null
  ) {
    const dist = haversineDistanceMi(
      buyer.regionLat, buyer.regionLng,
      realtor.serviceLat, realtor.serviceLng,
    )
    const totalRadius = (buyer.regionRadiusMi ?? 25) + (realtor.serviceRadiusMi ?? 25)
    servesArea = dist <= totalRadius
  } else {
    servesArea = realtor.regions.some(
      (r) => r.toLowerCase() === String(buyer.region || '').toLowerCase(),
    )
  }
  const areaLabel = buyer.region || 'your area'
  factors.push({
    weight: 20,
    value: servesArea ? 1 : 0,
    plus: servesArea ? `Serves ${areaLabel}` : null,
    minus: servesArea ? null : `Doesn't cover ${areaLabel}`,
  })

  // --- Price-range overlap ---
  const [blo, bhi] = [Number(buyer.priceMin) || 0, Number(buyer.priceMax) || 0]
  const [rlo, rhi] = realtor.priceBand
  const buyerSpan = Math.max(1, bhi - blo)
  const overlap = Math.max(0, Math.min(bhi, rhi) - Math.max(blo, rlo))
  const overlapRatio = Math.min(1, overlap / buyerSpan)
  factors.push({
    weight: 18,
    value: overlapRatio,
    plus:
      overlapRatio > 0.5
        ? 'Regularly works in your price range'
        : overlapRatio > 0
          ? 'Sometimes works in your price range'
          : null,
    minus:
      overlapRatio === 0
        ? `Usually works ${rlo > bhi ? 'above' : 'below'} your budget (${usd(rlo)}–${usd(rhi)})`
        : null,
  })

  // --- Specialty / home type ---
  const isSpecialty = realtor.specialties.includes(buyer.homeType)
  factors.push({
    weight: 15,
    value: isSpecialty ? 1 : 0.4,
    plus: isSpecialty ? `Specializes in ${HOME_TYPE_LABEL[buyer.homeType]}` : null,
    minus: isSpecialty ? null : `Not a ${HOME_TYPE_LABEL[buyer.homeType]} specialist`,
  })

  // --- Experience preference (the commission tradeoff) ---
  const isNewer = realtor.yearsExperience <= 5
  const isVeteran = realtor.yearsExperience >= 10
  if (buyer.experiencePref === 'newer') {
    factors.push({
      weight: 12,
      value: isNewer ? 1 : 0.3,
      plus: isNewer ? `Newer agent at a lower ${realtor.commissionRate}% commission` : null,
      minus: isNewer ? null : 'More established (and pricier) than you asked for',
    })
  } else if (buyer.experiencePref === 'experienced') {
    factors.push({
      weight: 12,
      value: isVeteran ? 1 : 0.35,
      plus: isVeteran
        ? `${realtor.yearsExperience} years and ${realtor.homesSold}+ homes sold`
        : null,
      minus: isVeteran ? null : 'Less experienced than you asked for',
    })
  } else {
    factors.push({ weight: 4, value: 0.8 }) // no preference: light, neutral
  }

  // --- First-time buyer support (only if relevant) ---
  if (buyer.firstTime) {
    factors.push({
      weight: 10,
      value: realtor.firstTimeFriendly ? 1 : 0.2,
      plus: realtor.firstTimeFriendly ? 'Great with first-time buyers' : null,
      minus: realtor.firstTimeFriendly ? null : 'Less focused on first-time buyers',
    })
  }

  // --- Communication style ---
  const matchesComm = realtor.commStyles.includes(buyer.commStyle)
  factors.push({
    weight: 8,
    value: matchesComm ? 1 : 0.3,
    plus: matchesComm ? `Comfortable with ${COMM_LABEL[buyer.commStyle]}` : null,
    minus: matchesComm ? null : `Prefers other channels over ${COMM_LABEL[buyer.commStyle]}`,
  })

  // --- Availability vs. timeline ---
  const urgent = buyer.timeline === 'asap' || buyer.timeline === '3mo'
  factors.push({
    weight: urgent ? 8 : 4,
    value: realtor.availableThisWeek ? 1 : urgent ? 0.4 : 0.8,
    plus: realtor.availableThisWeek ? 'Available this week' : null,
    minus: realtor.availableThisWeek ? null : urgent ? 'Limited availability right now' : null,
  })

  // --- Out-of-state experience (only if relevant) ---
  if (buyer.inState === 'out') {
    factors.push({
      weight: 6,
      value: realtor.outOfStateExperienced ? 1 : 0.3,
      plus: realtor.outOfStateExperienced ? 'Experienced with out-of-state buyers' : null,
      minus: realtor.outOfStateExperienced ? null : 'Limited out-of-state experience',
    })
  }

  // --- Investment experience (only if relevant) ---
  if (buyer.homeType === 'investment') {
    factors.push({
      weight: 5,
      value: realtor.investmentExperienced ? 1 : 0.3,
      plus: realtor.investmentExperienced ? 'Strong on investment numbers' : null,
      minus: realtor.investmentExperienced ? null : 'Less focused on investment deals',
    })
  }

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0)
  const weighted = factors.reduce((s, f) => s + f.weight * f.value, 0)
  const score = Math.round((weighted / totalWeight) * 100)

  const plus = factors.filter((f) => f.plus).map((f): Reason => ({ type: 'plus', text: f.plus! }))
  const minus = factors
    .filter((f) => f.minus)
    .map((f): Reason => ({ type: 'minus', text: f.minus! }))

  // Show the strongest positives, then a couple of honest caveats.
  const reasons: Reason[] = [...plus.slice(0, 5), ...minus.slice(0, 2)]

  return { score, reasons }
}

// Rank every realtor for a buyer, best fit first.
export function rankRealtors(buyer: BuyerProfile, realtors: Realtor[]): MatchResult[] {
  return realtors
    .map((realtor): MatchResult => {
      const { score, reasons } = scoreRealtor(buyer, realtor)
      return { realtor, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
}
