import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Realtor } from '@/lib/realtors'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('realtors')
    .select('id, name, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: data.length, realtors: data })
}

export async function POST(request: Request) {
  const { realtor, userId }: { realtor: Realtor; userId?: string | null } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('realtors')
    .insert({
      name: realtor.name,
      photo: realtor.photo,
      regions: realtor.regions,
      years_experience: realtor.yearsExperience,
      homes_sold: realtor.homesSold,
      price_band_min: realtor.priceBand[0],
      price_band_max: realtor.priceBand[1],
      commission_rate: realtor.commissionRate,
      specialties: realtor.specialties,
      first_time_friendly: realtor.firstTimeFriendly,
      out_of_state_experienced: realtor.outOfStateExperienced,
      investment_experienced: realtor.investmentExperienced,
      languages: realtor.languages,
      comm_styles: realtor.commStyles,
      available_this_week: realtor.availableThisWeek,
      avg_response_hours: realtor.avgResponseHours,
      rating: realtor.rating,
      review_count: realtor.reviewCount,
      license_verified: realtor.licenseVerified,
      personality: realtor.personality,
      bio: realtor.bio,
      recent_deal: realtor.recentDeal,
      user_id: userId ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
