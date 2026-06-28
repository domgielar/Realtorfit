// Mock realtor records. This shape is the schema contract — the Supabase table
// must match it exactly when a real backend is added.
// All data here is invented for the demo.

export type HomeType = 'starter' | 'investment' | 'luxury' | 'condo' | 'multi-family' | 'land'
export type CommStyle = 'text' | 'call' | 'video' | 'in-person'

export interface Realtor {
  id: string
  name: string
  photo: string
  regions: string[]
  serviceLat?: number
  serviceLng?: number
  serviceRadiusMi?: number
  yearsExperience: number
  homesSold: number
  priceBand: [number, number]
  commissionRate: number
  specialties: HomeType[]
  firstTimeFriendly: boolean
  outOfStateExperienced: boolean
  investmentExperienced: boolean
  languages: string[]
  commStyles: CommStyle[]
  availableThisWeek: boolean
  avgResponseHours: number
  rating: number
  reviewCount: number
  licenseVerified: boolean
  personality: string[]
  bio: string
  recentDeal: string
}

export async function registerRealtor(realtor: Realtor, userId?: string | null): Promise<string> {
  const res = await fetch('/api/realtors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ realtor, userId: userId ?? null }),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to register realtor')
  }
  const { id } = await res.json()
  return id
}

export const REALTORS: Realtor[] = [
  {
    id: 'r-maria',
    name: 'Maria Alvarez',
    photo: '👩🏽‍💼',
    regions: ['Worcester', 'Shrewsbury', 'Auburn', 'Millbury'],
    yearsExperience: 4,
    homesSold: 61,
    priceBand: [250000, 500000],
    commissionRate: 2.0,
    specialties: ['starter', 'condo'],
    firstTimeFriendly: true,
    outOfStateExperienced: false,
    investmentExperienced: false,
    languages: ['English', 'Spanish'],
    commStyles: ['text', 'video', 'in-person'],
    availableThisWeek: true,
    avgResponseHours: 2,
    rating: 4.9,
    reviewCount: 38,
    licenseVerified: true,
    personality: ['patient', 'great for first-time buyers'],
    bio: 'I love walking first-time buyers through every step so nothing feels scary. No question is too small.',
    recentDeal: 'Closed a 2-bed condo in Worcester $12k under asking.',
  },
  {
    id: 'r-james',
    name: 'James Whitfield',
    photo: '👨🏼‍💼',
    regions: ['Worcester', 'Boston', 'Newton', 'Brookline'],
    yearsExperience: 18,
    homesSold: 540,
    priceBand: [600000, 2500000],
    commissionRate: 3.0,
    specialties: ['luxury', 'investment'],
    firstTimeFriendly: false,
    outOfStateExperienced: true,
    investmentExperienced: true,
    languages: ['English'],
    commStyles: ['call', 'in-person'],
    availableThisWeek: false,
    avgResponseHours: 6,
    rating: 4.7,
    reviewCount: 211,
    licenseVerified: true,
    personality: ['aggressive negotiator', 'investment-focused'],
    bio: 'Two decades of high-stakes negotiation. If you want every dollar squeezed out of a deal, I am your agent.',
    recentDeal: 'Negotiated a $1.8M Brookline townhouse $90k below list.',
  },
  {
    id: 'r-priya',
    name: 'Priya Nair',
    photo: '👩🏾‍💼',
    regions: ['Worcester', 'Framingham', 'Marlborough', 'Westborough'],
    yearsExperience: 9,
    homesSold: 188,
    priceBand: [350000, 750000],
    commissionRate: 2.5,
    specialties: ['starter', 'multi-family', 'investment'],
    firstTimeFriendly: true,
    outOfStateExperienced: true,
    investmentExperienced: true,
    languages: ['English', 'Hindi', 'Tamil'],
    commStyles: ['text', 'call', 'video', 'in-person'],
    availableThisWeek: true,
    avgResponseHours: 3,
    rating: 4.8,
    reviewCount: 96,
    licenseVerified: true,
    personality: ['patient', 'investment-focused', 'great for first-time buyers'],
    bio: 'I help buyers think about resale value and rental potential, even on their first home. Numbers-driven, never pushy.',
    recentDeal: 'Helped an out-of-state buyer close a duplex remotely in 5 weeks.',
  },
  {
    id: 'r-derek',
    name: 'Derek Olsen',
    photo: '🧔🏼',
    regions: ['Millbury', 'Sutton', 'Grafton', 'Worcester'],
    yearsExperience: 2,
    homesSold: 19,
    priceBand: [200000, 425000],
    commissionRate: 1.75,
    specialties: ['starter', 'land'],
    firstTimeFriendly: true,
    outOfStateExperienced: false,
    investmentExperienced: false,
    languages: ['English'],
    commStyles: ['text', 'call', 'video', 'in-person'],
    availableThisWeek: true,
    avgResponseHours: 1,
    rating: 4.6,
    reviewCount: 11,
    licenseVerified: true,
    personality: ['patient', 'great for first-time buyers'],
    bio: 'Newer agent, hungry, and I answer my phone. Lower commission while I build my reputation — you get my full attention.',
    recentDeal: 'First-time buyer into a Millbury starter home, $5k seller credit for repairs.',
  },
  {
    id: 'r-lin',
    name: 'Lin Chen',
    photo: '👩🏻‍💼',
    regions: ['Quincy', 'Boston', 'Cambridge', 'Worcester'],
    yearsExperience: 12,
    homesSold: 305,
    priceBand: [400000, 900000],
    commissionRate: 2.75,
    specialties: ['condo', 'luxury', 'investment'],
    firstTimeFriendly: false,
    outOfStateExperienced: true,
    investmentExperienced: true,
    languages: ['English', 'Mandarin', 'Cantonese'],
    commStyles: ['call', 'video', 'in-person'],
    availableThisWeek: true,
    avgResponseHours: 4,
    rating: 4.8,
    reviewCount: 142,
    licenseVerified: true,
    personality: ['aggressive negotiator', 'investment-focused'],
    bio: 'Urban condo and investment specialist. I move fast in competitive markets and know how to win multiple-offer situations.',
    recentDeal: 'Won a Cambridge condo for clients in a 9-offer bidding war.',
  },
  {
    id: 'r-tasha',
    name: 'Tasha Brooks',
    photo: '👩🏿‍💼',
    regions: ['Worcester', 'Leominster', 'Fitchburg', 'Gardner'],
    yearsExperience: 6,
    homesSold: 102,
    priceBand: [225000, 475000],
    commissionRate: 2.25,
    specialties: ['starter', 'multi-family'],
    firstTimeFriendly: true,
    outOfStateExperienced: false,
    investmentExperienced: true,
    languages: ['English'],
    commStyles: ['text', 'call', 'in-person'],
    availableThisWeek: true,
    avgResponseHours: 2,
    rating: 4.9,
    reviewCount: 73,
    licenseVerified: true,
    personality: ['patient', 'great for first-time buyers', 'investment-focused'],
    bio: 'Grew up in Central Mass and know these neighborhoods block by block. I am big on school districts and long-term value.',
    recentDeal: 'Got a first-time buyer a 3-family in Worcester to house-hack.',
  },
  {
    id: 'r-omar',
    name: 'Omar Haddad',
    photo: '👨🏽‍💼',
    regions: ['Worcester', 'Holden', 'Paxton', 'Rutland'],
    yearsExperience: 3,
    homesSold: 34,
    priceBand: [300000, 600000],
    commissionRate: 2.0,
    specialties: ['starter', 'condo', 'land'],
    firstTimeFriendly: true,
    outOfStateExperienced: true,
    investmentExperienced: false,
    languages: ['English', 'Arabic'],
    commStyles: ['text', 'video', 'call'],
    availableThisWeek: true,
    avgResponseHours: 2,
    rating: 4.7,
    reviewCount: 22,
    licenseVerified: true,
    personality: ['patient', 'great for first-time buyers'],
    bio: 'I specialize in relocating buyers — I do video tours and handle a lot remotely so you can buy with confidence from afar.',
    recentDeal: 'Closed for a family moving from Texas, fully remote until final walkthrough.',
  },
  {
    id: 'r-grace',
    name: 'Grace Sullivan',
    photo: '👩🏼‍🦰',
    regions: ['Worcester', 'Shrewsbury', 'Northborough', 'Boylston'],
    yearsExperience: 22,
    homesSold: 690,
    priceBand: [450000, 1200000],
    commissionRate: 3.0,
    specialties: ['luxury', 'condo'],
    firstTimeFriendly: false,
    outOfStateExperienced: true,
    investmentExperienced: false,
    languages: ['English'],
    commStyles: ['call', 'in-person'],
    availableThisWeek: false,
    avgResponseHours: 8,
    rating: 4.6,
    reviewCount: 318,
    licenseVerified: true,
    personality: ['aggressive negotiator'],
    bio: 'The most experienced agent in the region. My network opens doors and off-market listings others cannot reach.',
    recentDeal: 'Sourced an off-market $950k Shrewsbury home before it ever listed.',
  },
]
