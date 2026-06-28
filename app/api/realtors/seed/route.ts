import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { REALTORS } from '@/lib/realtors'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  const rows = REALTORS.map((r) => ({
    id: r.id,
    name: r.name,
    photo: r.photo,
    regions: r.regions,
    years_experience: r.yearsExperience,
    homes_sold: r.homesSold,
    price_band_min: r.priceBand[0],
    price_band_max: r.priceBand[1],
    commission_rate: r.commissionRate,
    specialties: r.specialties,
    first_time_friendly: r.firstTimeFriendly,
    out_of_state_experienced: r.outOfStateExperienced,
    investment_experienced: r.investmentExperienced,
    languages: r.languages,
    comm_styles: r.commStyles,
    available_this_week: r.availableThisWeek,
    avg_response_hours: r.avgResponseHours,
    rating: r.rating,
    review_count: r.reviewCount,
    license_verified: r.licenseVerified,
    personality: r.personality,
    bio: r.bio,
    recent_deal: r.recentDeal,
  }))

  const { error } = await supabaseAdmin
    .from('realtors')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seeded: rows.length })
}
