import { createClient } from '@/lib/supabase/client'
import type { Realtor } from '@/lib/realtors'
import type { BuyerProfile } from '@/lib/matching'

export interface ConversationPreview {
  realtorId: string
  realtorName: string
  realtorPhoto: string
  lastMessage: string
  lastMessageAt: string
  lastSenderRole: 'buyer' | 'realtor'
}

export async function getRealtors(): Promise<Realtor[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !data || data.length === 0) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    photo: row.photo as string,
    regions: row.regions as string[],
    serviceLat: row.service_lat != null ? Number(row.service_lat) : undefined,
    serviceLng: row.service_lng != null ? Number(row.service_lng) : undefined,
    serviceRadiusMi: row.service_radius_mi != null ? Number(row.service_radius_mi) : undefined,
    yearsExperience: row.years_experience as number,
    homesSold: row.homes_sold as number,
    priceBand: [row.price_band_min, row.price_band_max] as [number, number],
    commissionRate: Number(row.commission_rate),
    specialties: row.specialties as Realtor['specialties'],
    firstTimeFriendly: row.first_time_friendly as boolean,
    outOfStateExperienced: row.out_of_state_experienced as boolean,
    investmentExperienced: row.investment_experienced as boolean,
    languages: row.languages as string[],
    commStyles: row.comm_styles as Realtor['commStyles'],
    availableThisWeek: row.available_this_week as boolean,
    avgResponseHours: Number(row.avg_response_hours),
    rating: Number(row.rating),
    reviewCount: row.review_count as number,
    licenseVerified: row.license_verified as boolean,
    personality: row.personality as string[],
    bio: row.bio as string,
    recentDeal: row.recent_deal as string,
  }))
}

export async function getBuyerProfile(userId: string): Promise<BuyerProfile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('buyer_leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return {
    priceMin: data.price_min as number,
    priceMax: data.price_max as number,
    region: data.region as string,
    regionLat: data.region_lat != null ? Number(data.region_lat) : undefined,
    regionLng: data.region_lng != null ? Number(data.region_lng) : undefined,
    regionRadiusMi: data.region_radius_mi != null ? Number(data.region_radius_mi) : undefined,
    inState: data.in_state as BuyerProfile['inState'],
    firstTime: data.first_time as boolean,
    homeType: data.home_type as BuyerProfile['homeType'],
    timeline: data.timeline as BuyerProfile['timeline'],
    preApproved: data.pre_approved as boolean,
    experiencePref: data.experience_pref as BuyerProfile['experiencePref'],
    commStyle: data.comm_style as BuyerProfile['commStyle'],
  }
}

export async function getBuyerConversations(buyerId: string): Promise<ConversationPreview[]> {
  const supabase = createClient()

  const { data: msgs } = await supabase
    .from('messages')
    .select('realtor_id, content, created_at, sender_role')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (!msgs || msgs.length === 0) return []

  // Deduplicate — keep only the latest message per realtor
  const seen = new Set<string>()
  const previews: { realtorId: string; content: string; createdAt: string; senderRole: string }[] = []
  for (const m of msgs) {
    if (!seen.has(m.realtor_id)) {
      seen.add(m.realtor_id)
      previews.push({ realtorId: m.realtor_id, content: m.content, createdAt: m.created_at, senderRole: m.sender_role })
    }
  }

  const { data: realtors } = await supabase
    .from('realtors')
    .select('id, name, photo')
    .in('id', previews.map((p) => p.realtorId))

  const realtorMap = new Map((realtors ?? []).map((r) => [r.id as string, r]))

  return previews.map((p) => {
    const r = realtorMap.get(p.realtorId)
    return {
      realtorId: p.realtorId,
      realtorName: (r?.name as string) ?? 'Realtor',
      realtorPhoto: (r?.photo as string) ?? '',
      lastMessage: p.content as string,
      lastMessageAt: p.createdAt as string,
      lastSenderRole: p.senderRole as 'buyer' | 'realtor',
    }
  })
}
