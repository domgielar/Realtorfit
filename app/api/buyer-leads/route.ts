import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { BuyerProfile } from '@/lib/matching'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const profile: BuyerProfile = await request.json()

  const { error } = await supabaseAdmin
    .from('buyer_leads')
    .insert({
      price_min: profile.priceMin,
      price_max: profile.priceMax,
      region: profile.region,
      in_state: profile.inState,
      first_time: profile.firstTime,
      home_type: profile.homeType,
      timeline: profile.timeline,
      pre_approved: profile.preApproved,
      experience_pref: profile.experiencePref,
      comm_style: profile.commStyle,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
