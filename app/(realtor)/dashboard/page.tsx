'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Realtor } from '@/lib/realtors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const HOUSE_IMAGES = [
  '/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  '/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  '/johnson-U6Q6zVDgmSs-unsplash.jpg',
  '/webaliser-_TPTXZd9mOo-unsplash.jpg',
  '/dillon-kydd-XGvwt544g8k-unsplash.jpg',
]

function mapRow(row: Record<string, unknown>): Realtor {
  return {
    id: row.id as string,
    name: row.name as string,
    photo: row.photo as string,
    regions: row.regions as string[],
    yearsExperience: row.years_experience as number,
    homesSold: row.homes_sold as number,
    priceBand: [row.price_band_min as number, row.price_band_max as number],
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
  }
}

function profileStrength(r: Realtor): number {
  let score = 0
  if (r.photo && r.photo !== '🧑‍💼') score += 10
  if (r.bio && r.bio !== 'No bio provided yet.') score += 25
  if (r.recentDeal && r.recentDeal !== 'No recent deal listed yet.') score += 25
  if (r.regions.length > 0) score += 10
  if (r.specialties.length > 0) score += 10
  if (r.commStyles.length > 0) score += 10
  if (r.licenseVerified) score += 10
  return score
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function RealtorDashboard() {
  const router = useRouter()
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * HOUSE_IMAGES.length))
  const [realtor, setRealtor] = useState<Realtor | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setBgIndex((i) => (i + 1) % HOUSE_IMAGES.length), 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('realtors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        const mapped = mapRow(data as Record<string, unknown>)
        setRealtor(mapped)
        setAccepting(mapped.availableThisWeek)
      }

      setLoading(false)
    }
    load()
  }, [router])

  const handleAcceptingChange = async (checked: boolean) => {
    setAccepting(checked)
    if (!userId) return
    const supabase = createClient()
    await supabase
      .from('realtors')
      .update({ available_this_week: checked })
      .eq('user_id', userId)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen relative isolate">

      {/* Background photos */}
      {HOUSE_IMAGES.map((img, i) => (
        <div
          key={img}
          aria-hidden="true"
          className={`fixed inset-0 -z-20 scale-[1.03] bg-cover bg-center bg-fixed bg-no-repeat bg-[#d6b59a] transition-opacity duration-1000 ${
            i === bgIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 mix-blend-multiply"
        style={{
          background:
            'linear-gradient(to left, rgba(189,93,61,0.82) 0%, rgba(189,93,61,0.58) 22%, rgba(189,93,61,0.28) 52%, rgba(189,93,61,0.08) 78%, rgba(189,93,61,0.02) 100%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-6 space-y-5">

        {/* Nav */}
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="font-(family-name:--font-display) text-xl font-semibold text-white tracking-[-0.01em]"
          >
            Realtor<span className="text-[--color-clay]">Fit</span>
          </Link>
          <Button
            variant="ghost"
            className="rounded-full px-4 py-2 h-auto text-[14px] font-semibold text-white! bg-white/10! hover:bg-white/20! border border-white/20"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </nav>

        {/* Loading */}
        {loading && (
          <Card className="bg-white border-[--color-line] shadow-card rounded-2xl">
            <CardContent className="px-6 py-10 text-center text-[14px] text-[--color-muted]">
              Loading your profile…
            </CardContent>
          </Card>
        )}

        {/* No profile found */}
        {!loading && !realtor && (
          <Card className="bg-white border-[--color-line] shadow-card rounded-2xl">
            <CardContent className="px-6 py-10 text-center space-y-4">
              <p className="font-(family-name:--font-display) text-[22px] font-semibold text-[--color-ink]">
                No profile yet
              </p>
              <p className="text-[15px] text-[--color-ink-soft]">
                You haven&apos;t set up your realtor profile. Head back to the home page to create one.
              </p>
              <Button
                className="rounded-full px-6 py-2.5 h-auto text-[14px] font-semibold bg-black! text-white! hover:bg-zinc-800!"
                onClick={() => router.push('/')}
              >
                Go to home
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard — only when realtor loaded */}
        {!loading && realtor && (
          <>
            {/* Header */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardContent className="px-6 py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ fontSize: '36px', lineHeight: 1 }}>{realtor.photo}</span>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="font-(family-name:--font-display) text-[26px] font-semibold tracking-[-0.01em] text-[--color-ink]">
                          {greeting()}, {realtor.name.split(' ')[0]}
                        </h1>
                        {realtor.licenseVerified && (
                          <Badge className="h-auto rounded-full px-2.5 py-1 text-[12px] font-semibold border-0 bg-[#dff0e4] text-[#2d6b40]">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-[13px] text-[--color-muted] mt-0.5">{realtor.name}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <Switch
                      checked={accepting}
                      onCheckedChange={handleAcceptingChange}
                      className="data-[state=checked]:bg-[--color-sage]"
                    />
                    <span className="text-[14px] font-medium text-[--color-ink-soft]">
                      {accepting ? 'Accepting clients' : 'Not accepting'}
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Profile stats */}
            <div className="grid grid-cols-4 gap-4 max-[860px]:grid-cols-2 max-[520px]:grid-cols-2">
              {[
                { label: 'Commission', value: `${realtor.commissionRate.toFixed(2)}%` },
                { label: 'Experience', value: `${realtor.yearsExperience} yrs` },
                { label: 'Homes sold', value: realtor.homesSold >= 600 ? '600+' : String(realtor.homesSold) },
                { label: 'Avg response', value: `${realtor.avgResponseHours}h` },
              ].map((s) => (
                <Card key={s.label} className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
                  <CardContent className="p-5">
                    <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1.5">{s.label}</p>
                    <p className="font-(family-name:--font-display) text-[28px] font-semibold leading-none text-[--color-ink]">
                      {s.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile detail + Leads */}
            <div className="grid grid-cols-[1fr_320px] gap-5 items-start max-[900px]:grid-cols-1">

              {/* Left: profile detail */}
              <div className="space-y-5">

                <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
                  <CardHeader className="px-6 pt-5 pb-0">
                    <div className="pb-4">
                      <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Your profile</CardTitle>
                    </div>
                    <Separator className="bg-[--color-line]" />
                  </CardHeader>
                  <CardContent className="px-6 py-5 space-y-4">

                    {realtor.bio && realtor.bio !== 'No bio provided yet.' && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1">Bio</p>
                        <p className="text-[14px] text-[--color-ink-soft] leading-relaxed">{realtor.bio}</p>
                      </div>
                    )}

                    {realtor.regions.length > 0 && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1.5">Regions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {realtor.regions.map((r) => (
                            <span key={r} className="px-2.5 py-1 rounded-full bg-[--color-paper] text-[13px] text-[--color-ink-soft] border border-[--color-line]">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {realtor.specialties.length > 0 && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1.5">Specialties</p>
                        <div className="flex flex-wrap gap-1.5">
                          {realtor.specialties.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-full bg-[--color-paper] text-[13px] text-[--color-ink-soft] border border-[--color-line] capitalize">
                              {s.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {realtor.commStyles.length > 0 && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1.5">Preferred contact</p>
                        <div className="flex flex-wrap gap-1.5">
                          {realtor.commStyles.map((c) => (
                            <span key={c} className="px-2.5 py-1 rounded-full bg-[--color-paper] text-[13px] text-[--color-ink-soft] border border-[--color-line] capitalize">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {realtor.languages.length > 1 && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1">Languages</p>
                        <p className="text-[14px] text-[--color-ink-soft]">{realtor.languages.join(', ')}</p>
                      </div>
                    )}

                    {realtor.recentDeal && realtor.recentDeal !== 'No recent deal listed yet.' && (
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-[--color-muted] mb-1">Recent deal</p>
                        <p className="text-[14px] text-[--color-ink-soft] italic">&ldquo;{realtor.recentDeal}&rdquo;</p>
                      </div>
                    )}

                  </CardContent>
                </Card>

              </div>

              {/* Right: leads */}
              <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
                <CardHeader className="px-5 pt-5 pb-0">
                  <div className="pb-4">
                    <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Buyer leads</CardTitle>
                  </div>
                  <Separator className="bg-[--color-line]" />
                </CardHeader>
                <CardContent className="px-5 py-10 text-center">
                  <p className="text-[14px] text-[--color-ink-soft] mb-1">No leads yet.</p>
                  <p className="text-[13px] text-[--color-muted]">
                    Buyers who match your profile will appear here.
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Profile strength */}
            {(() => {
              const strength = profileStrength(realtor)
              return (
                <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
                  <CardContent className="px-6 py-5">
                    <div className="flex items-center justify-between gap-8 flex-wrap">
                      <div className="flex-1 min-w-56">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[14px] font-semibold text-[--color-ink]">Profile strength</span>
                          <span className="text-[14px] font-bold text-[--color-clay]">{strength}%</span>
                        </div>
                        <div className="h-2 bg-[--color-line] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[--color-sage] rounded-full transition-all duration-500"
                            style={{ width: `${strength}%` }}
                          />
                        </div>
                        <p className="text-[13px] text-[--color-muted] mt-2">
                          {strength < 50
                            ? 'Add a bio and recent deal to improve your match visibility.'
                            : strength < 80
                            ? 'Add a recent deal to boost your match visibility.'
                            : 'Great profile — buyers will see a strong, complete listing.'}
                        </p>
                      </div>
                      <Button
                        className="rounded-full px-6 py-2.5 h-auto text-[14px] font-semibold bg-black! text-white! hover:bg-zinc-800! shrink-0"
                        onClick={() => router.push('/')}
                      >
                        Edit profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}

            <div className="pb-4" />
          </>
        )}

      </div>
    </div>
  )
}
