import { createClient } from '@/lib/supabase/client'
import type { Realtor } from '@/lib/realtors'

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
