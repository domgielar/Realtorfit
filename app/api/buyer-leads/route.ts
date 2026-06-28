import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { BuyerProfile } from '@/lib/matching'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const {
    matchedRealtors,
    ...profile
  }: BuyerProfile & { matchedRealtors?: { id: string; score: number }[] } = await request.json()

  // Get the authenticated buyer's user_id (if logged in)
  const supabaseAuth = await createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  // Insert the buyer lead
  const { data: lead, error } = await supabaseAdmin
    .from('buyer_leads')
    .insert({
      price_min: profile.priceMin,
      price_max: profile.priceMax,
      region: profile.region,
      region_lat: profile.regionLat ?? null,
      region_lng: profile.regionLng ?? null,
      region_radius_mi: profile.regionRadiusMi ?? null,
      in_state: profile.inState,
      first_time: profile.firstTime,
      home_type: profile.homeType,
      timeline: profile.timeline,
      pre_approved: profile.preApproved,
      experience_pref: profile.experiencePref,
      comm_style: profile.commStyle,
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert match rows (non-blocking — ignore errors)
  if (matchedRealtors?.length && lead) {
    const matchRows = matchedRealtors.map(({ id, score }) => ({
      buyer_lead_id: lead.id,
      realtor_id: id,
      fit_score: score,
      home_type: profile.homeType,
      region: profile.region,
      price_min: profile.priceMin,
      price_max: profile.priceMax,
      comm_style: profile.commStyle,
      first_time: profile.firstTime,
      timeline: profile.timeline,
    }))
    await supabaseAdmin.from('buyer_lead_matches').insert(matchRows)
  }

  return NextResponse.json({ id: lead.id }, { status: 201 })
}
