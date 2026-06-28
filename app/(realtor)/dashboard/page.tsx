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
import MessageThread from '@/components/MessageThread'
import EditProfileModal from '@/components/EditProfileModal'

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
    serviceLat: row.service_lat != null ? Number(row.service_lat) : undefined,
    serviceLng: row.service_lng != null ? Number(row.service_lng) : undefined,
    serviceRadiusMi: row.service_radius_mi != null ? Number(row.service_radius_mi) : undefined,
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

interface StrengthFactor {
  label: string
  pts: number
  done: boolean
  hint: string
}

function profileStrength(r: Realtor): { score: number; factors: StrengthFactor[] } {
  const factors: StrengthFactor[] = [
    {
      label: 'Bio',
      pts: 30,
      done: !!(r.bio && r.bio !== 'No bio provided yet.'),
      hint: 'Write a bio buyers will see',
    },
    {
      label: 'Recent deal',
      pts: 25,
      done: !!(r.recentDeal && r.recentDeal !== 'No recent deal listed yet.'),
      hint: 'Add a deal you\'re proud of',
    },
    {
      label: 'Specialties',
      pts: 20,
      done: r.specialties.length > 0,
      hint: 'Select the home types you work with',
    },
    {
      label: 'Communication styles',
      pts: 15,
      done: r.commStyles.length > 0,
      hint: 'Choose how you prefer to communicate',
    },
    {
      label: 'Personality tags',
      pts: 10,
      done: r.personality.length > 0,
      hint: 'Describe your approach to buyers',
    },
  ]
  const score = factors.reduce((sum, f) => sum + (f.done ? f.pts : 0), 0)
  return { score, factors }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface BuyerLead {
  id: string
  fitScore: number
  priceMin: number
  priceMax: number
  region: string
  firstTime: boolean
  homeType: string
  timeline: string
  commStyle: string
  createdAt: string
}

const TIMELINE_LABEL: Record<string, string> = {
  asap: 'Ready now',
  '3mo': 'In 3 months',
  '6mo': 'In 6 months',
  browsing: 'Just browsing',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RealtorDashboard() {
  const router = useRouter()
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * HOUSE_IMAGES.length))
  const [realtor, setRealtor] = useState<Realtor | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<BuyerLead[]>([])
  const [conversations, setConversations] = useState<{ buyerId: string; preview: string; time: string }[]>([])
  const [openConvId, setOpenConvId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

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

        const { data: leadRows } = await supabase
          .from('buyer_lead_matches')
          .select('id, fit_score, price_min, price_max, region, first_time, home_type, timeline, comm_style, created_at')
          .eq('realtor_id', mapped.id)
          .order('fit_score', { ascending: false })
          .limit(20)

        if (leadRows) {
          setLeads(leadRows.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            fitScore: r.fit_score as number,
            priceMin: r.price_min as number,
            priceMax: r.price_max as number,
            region: r.region as string,
            firstTime: r.first_time as boolean,
            homeType: r.home_type as string,
            timeline: r.timeline as string,
            commStyle: r.comm_style as string,
            createdAt: r.created_at as string,
          })))
        }
      }

      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (!realtor) return
    const supabase = createClient()
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('messages')
        .select('buyer_id, content, created_at')
        .eq('realtor_id', realtor.id)
        .order('created_at', { ascending: false })
        .limit(200)
      if (!data) return
      const byBuyer: Record<string, { content: string; created_at: string }> = {}
      for (const row of data) {
        const bid = row.buyer_id as string
        if (!byBuyer[bid]) byBuyer[bid] = { content: row.content as string, created_at: row.created_at as string }
      }
      setConversations(
        Object.entries(byBuyer)
          .map(([buyerId, { content, created_at }]) => ({ buyerId, preview: content, time: created_at }))
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      )
    }
    fetchConversations()
    const interval = setInterval(fetchConversations, 15000)
    return () => clearInterval(interval)
  }, [realtor?.id])

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
          className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat bg-[#d6b59a] transition-opacity duration-1000 ${
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
                  <div className="pb-4 flex items-center justify-between">
                    <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Buyer leads</CardTitle>
                    {leads.length > 0 && (
                      <span className="text-[13px] font-semibold text-white bg-[--color-clay] rounded-full px-2.5 py-0.5">
                        {leads.length}
                      </span>
                    )}
                  </div>
                  <Separator className="bg-[--color-line]" />
                </CardHeader>
                {leads.length === 0 ? (
                  <CardContent className="px-5 py-10 text-center">
                    <p className="text-[14px] text-[--color-ink-soft] mb-1">No leads yet.</p>
                    <p className="text-[13px] text-[--color-muted]">
                      Buyers who match your profile will appear here.
                    </p>
                  </CardContent>
                ) : (
                  <CardContent className="px-5 py-4 space-y-3 max-h-120 overflow-y-auto">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-3.5 rounded-xl border border-[--color-line] bg-[--color-paper] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold tabular-nums ${
                              lead.fitScore >= 85 ? 'bg-[#fdf3d7] text-[#8a6018]'
                              : lead.fitScore >= 70 ? 'bg-[#dff0e4] text-[#2d6b40]'
                              : 'bg-[#faeae4] text-[--color-clay-deep]'
                            }`}>
                              {lead.fitScore}%
                            </span>
                            <span className="text-[13px] font-semibold text-[--color-ink] capitalize truncate">
                              {lead.homeType.replace('-', ' ')} · {lead.region}
                            </span>
                          </div>
                          <span className="text-[11px] text-[--color-muted] shrink-0">{timeAgo(lead.createdAt)}</span>
                        </div>
                        <p className="text-[13px] text-[--color-ink-soft]">
                          ${lead.priceMin.toLocaleString()} – ${lead.priceMax.toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-white border border-[--color-line] text-[11px] text-[--color-ink-soft]">
                            {TIMELINE_LABEL[lead.timeline] ?? lead.timeline}
                          </span>
                          {lead.firstTime && (
                            <span className="px-2 py-0.5 rounded-full bg-[#fef3e2] text-[11px] text-[#92600a] font-medium">
                              First-time
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-white border border-[--color-line] text-[11px] text-[--color-ink-soft] capitalize">
                            {lead.commStyle}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>

            </div>

            {/* Messages */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="pb-4 flex items-center justify-between">
                  <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Messages</CardTitle>
                  {conversations.length > 0 && (
                    <span className="text-[13px] font-semibold text-white bg-[--color-clay] rounded-full px-2.5 py-0.5">
                      {conversations.length}
                    </span>
                  )}
                </div>
                <Separator className="bg-[--color-line]" />
              </CardHeader>
              {conversations.length === 0 ? (
                <CardContent className="px-5 py-10 text-center">
                  <p className="text-[14px] text-[--color-ink-soft] mb-1">No messages yet.</p>
                  <p className="text-[13px] text-[--color-muted]">
                    When a buyer messages you, their conversation will appear here.
                  </p>
                </CardContent>
              ) : (
                <CardContent className="px-5 py-4 space-y-3">
                  {conversations.map((conv) => (
                    <div key={conv.buyerId}>
                      <button
                        className="w-full text-left p-3.5 rounded-xl border border-[--color-line] bg-[--color-paper] hover:bg-[--color-paper-deep] transition-colors"
                        onClick={() => setOpenConvId(openConvId === conv.buyerId ? null : conv.buyerId)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold text-[--color-ink]">
                            Buyer {conv.buyerId.slice(0, 6).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-[--color-muted] shrink-0">{timeAgo(conv.time)}</span>
                        </div>
                        <p className="text-[13px] text-[--color-ink-soft] truncate mt-1">{conv.preview}</p>
                      </button>
                      {openConvId === conv.buyerId && (
                        <div className="mt-2 px-1">
                          <MessageThread
                            buyerId={conv.buyerId}
                            realtorId={realtor.id}
                            senderRole="realtor"
                            otherName={`Buyer ${conv.buyerId.slice(0, 6).toUpperCase()}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Profile strength */}
            {(() => {
              const { score } = profileStrength(realtor)
              const r = 40
              const circ = 2 * Math.PI * r
              const offset = circ * (1 - score / 100)
              const color = '#000000'
              return (
                <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
                  <CardContent className="px-6 py-5">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <svg width="96" height="96" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
                          <circle
                            cx="48" cy="48" r={r} fill="none"
                            stroke={color} strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            transform="rotate(-90 48 48)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                          />
                          <text x="48" y="48" textAnchor="middle" dominantBaseline="central"
                            style={{ fontSize: '20px', fontWeight: 700, fill: color, fontFamily: 'var(--font-sans)' }}>
                            {score}%
                          </text>
                        </svg>
                        <div>
                          <p className="text-[15px] font-semibold text-[--color-ink]">Profile strength</p>
                          <p className="text-[13px] text-[--color-muted] mt-0.5">
                            {score === 100 ? 'Complete' : `${100 - score}% left to complete`}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="rounded-full px-6 py-2.5 h-auto text-[14px] font-semibold bg-black! text-white! hover:bg-zinc-800! shrink-0"
                        onClick={() => setEditOpen(true)}
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

      {editOpen && realtor && userId && (
        <EditProfileModal
          realtor={realtor}
          userId={userId}
          onSave={(updated) => setRealtor(updated)}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}
