'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

// ─── Placeholder data ────────────────────────────────────────────────────────

const AGENT = { name: 'Maria Alvarez', verified: true, photo: '👩🏽‍💼' }

const HOUSE_IMAGES = [
  '/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  '/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  '/johnson-U6Q6zVDgmSs-unsplash.jpg',
  '/webaliser-_TPTXZd9mOo-unsplash.jpg',
  '/dillon-kydd-XGvwt544g8k-unsplash.jpg',
]

const STATS = [
  { label: 'New leads',       value: '3',       sub: 'since yesterday' },
  { label: 'Unread messages', value: '7',       sub: '3 need replies'  },
  { label: 'Active buyers',   value: '4 / 8',   sub: 'of capacity'     },
  { label: 'This week',       value: '2 tours', sub: 'scheduled'       },
]

const INITIAL_LEADS = [
  { id: 1, fit: 94, type: 'First-time buyer', area: 'Worcester',  budget: '$275k–$450k', comm: 'Texts' },
  { id: 2, fit: 87, type: 'Starter home',     area: 'Shrewsbury', budget: '$300k–$500k', comm: 'Calls' },
  { id: 3, fit: 71, type: 'Condo buyer',      area: 'Framingham', budget: '$350k–$550k', comm: 'Video' },
]

const PIPELINE = [
  { stage: 'New',     count: 3 },
  { stage: 'Touring', count: 2 },
  { stage: 'Offer',   count: 1 },
  { stage: 'Closing', count: 1 },
]

const MESSAGES = [
  { id: 1, name: 'James T.',  preview: 'When can we schedule a tour?',        time: '10m', unread: 2 },
  { id: 2, name: 'Sarah M.',  preview: 'Got my pre-approval back, $420k...',  time: '1h',  unread: 1 },
  { id: 3, name: 'David L.',  preview: 'Thanks so much for yesterday!',       time: '3h',  unread: 0 },
  { id: 4, name: 'Priya K.',  preview: 'Can we push the walkthrough to Fri?', time: '5h',  unread: 0 },
]

const APPTS = [
  { time: '10:00 AM', label: 'Tour',         detail: '14 Oak St, Worcester' },
  { time: '2:30 PM',  label: 'Intro call',   detail: 'Sarah Martinez'       },
  { time: '4:00 PM',  label: 'Offer review', detail: '88 Elm Ave, Auburn'   },
]

const PROFILE_STRENGTH = 65
const PROFILE_NUDGE = 'Add a recent deal to boost your match visibility by ~15%.'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fitClass(score: number) {
  if (score >= 85) return 'bg-[#fdf3d7] text-[#8a6018]'
  if (score >= 70) return 'bg-[#dff0e4] text-[#2d6b40]'
  return 'bg-[#faeae4] text-[#9f4a2e]'
}

function stageColor(stage: string) {
  if (stage === 'New')     return 'text-[--color-clay]'
  if (stage === 'Touring') return 'text-[--color-gold]'
  if (stage === 'Offer')   return 'text-[--color-sage]'
  return 'text-[--color-ink]'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RealtorDashboard() {
  const router = useRouter()

  const [accepting, setAccepting] = useState(true)
  const [leads, setLeads]         = useState(INITIAL_LEADS)
  const dismiss = (id: number) => setLeads((prev) => prev.filter((l) => l.id !== id))

  // Cycling background — same cadence as the welcome page
  const [bgIndex, setBgIndex] = useState(() =>
    Math.floor(Math.random() * HOUSE_IMAGES.length)
  )
  useEffect(() => {
    const t = setInterval(() => setBgIndex((i) => (i + 1) % HOUSE_IMAGES.length), 10000)
    return () => clearInterval(t)
  }, [])

  // Entry animation — triggered when arriving from the realtor wizard
  const [avatarEmoji, setAvatarEmoji]   = useState(AGENT.photo)
  const [fromWizard, setFromWizard]     = useState(false)
  const [avatarLanded, setAvatarLanded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('rf_entry')
    if (!raw) return
    try {
      const { emoji } = JSON.parse(raw) as { emoji: string; name: string }
      localStorage.removeItem('rf_entry')
      setAvatarEmoji(emoji)
      setFromWizard(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAvatarLanded(true)))
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="min-h-screen relative isolate">

      {/* ── Background photos ── */}
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

      {/* ── Clay gradient overlay ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 mix-blend-multiply"
        style={{
          background:
            'linear-gradient(to left, rgba(189,93,61,0.82) 0%, rgba(189,93,61,0.58) 22%, rgba(189,93,61,0.28) 52%, rgba(189,93,61,0.08) 78%, rgba(189,93,61,0.02) 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Nav strip — sits on the photo, text white */}
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
            onClick={() => router.push('/')}
          >
            ← Back to home
          </Button>
        </nav>

        {/* ── Header card ── */}
        <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-(family-name:--font-display) text-[26px] font-semibold tracking-[-0.01em] text-[--color-ink]">
                  Good morning, {AGENT.name.split(' ')[0]}
                </h1>
                {AGENT.verified && (
                  <Badge className="h-auto rounded-full px-2.5 py-1 text-[12px] font-semibold border-0 bg-[#dff0e4] text-[#2d6b40]">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Switch
                    checked={accepting}
                    onCheckedChange={setAccepting}
                    className="data-[state=checked]:bg-[--color-sage]"
                  />
                  <span className="text-[14px] font-medium text-[--color-ink-soft]">
                    {accepting ? 'Accepting clients' : 'Not accepting'}
                  </span>
                </label>

                {/* Avatar — arrives large from the wizard and settles into its corner */}
                <span
                  title={AGENT.name}
                  style={{
                    fontSize: '36px',
                    lineHeight: 1,
                    display: 'block',
                    willChange: 'transform',
                    transform: fromWizard && !avatarLanded ? 'scale(3.2)' : 'scale(1)',
                    transition: fromWizard
                      ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : 'none',
                  }}
                >
                  {avatarEmoji}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Stat row ── */}
        <div className="grid grid-cols-4 gap-4 max-[860px]:grid-cols-2 max-[520px]:grid-cols-1">
          {STATS.map((s) => (
            <Card key={s.label} className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardContent className="p-5">
                <p className="text-[13px] text-[--color-muted-brand] mb-1.5">{s.label}</p>
                <p className="font-(family-name:--font-display) text-[28px] font-semibold leading-none text-[--color-ink] mb-1.5">
                  {s.value}
                </p>
                <p className="text-[12px] text-[--color-muted-brand]">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-[1fr_320px] gap-5 items-start max-[900px]:grid-cols-1">

          {/* Left column */}
          <div className="space-y-5">

            {/* New buyer leads */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardHeader className="px-6 pt-5 pb-0">
                <div className="flex items-center justify-between pb-4">
                  <CardTitle className="text-[16px] font-semibold text-[--color-ink]">
                    New buyer leads
                  </CardTitle>
                  <span className="text-[13px] text-[--color-clay] font-semibold">
                    {leads.length} waiting
                  </span>
                </div>
                <Separator className="bg-[--color-line]" />
              </CardHeader>

              {leads.length === 0 ? (
                <CardContent className="px-6 py-10 text-center text-[14px] text-[--color-muted-brand]">
                  No new leads right now — check back soon.
                </CardContent>
              ) : (
                <div>
                  {leads.map((lead, i) => (
                    <div key={lead.id}>
                      <div className="px-6 py-4 flex items-center gap-4 flex-wrap">
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold tabular-nums min-w-13 text-center ${fitClass(lead.fit)}`}>
                          {lead.fit}%
                        </span>
                        <div className="flex-1 min-w-35">
                          <p className="text-[14px] font-semibold text-[--color-ink] leading-snug">
                            {lead.type} · {lead.area}
                          </p>
                          <p className="text-[12px] text-[--color-muted-brand] mt-0.5">
                            {lead.budget} &middot; {lead.comm}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" className="rounded-full h-auto px-4 py-1.5 text-[13px] font-semibold bg-black! text-white! hover:bg-zinc-800!" onClick={() => dismiss(lead.id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full h-auto px-4 py-1.5 text-[13px] font-semibold bg-white! border-gray-200! text-[--color-ink-soft]! hover:bg-gray-50! hover:border-gray-300!" onClick={() => dismiss(lead.id)}>
                            Pass
                          </Button>
                        </div>
                      </div>
                      {i < leads.length - 1 && <Separator className="bg-[--color-line] mx-6" />}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pipeline */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardHeader className="px-6 pt-5 pb-0">
                <div className="pb-4">
                  <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Your pipeline</CardTitle>
                </div>
                <Separator className="bg-[--color-line]" />
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid grid-cols-4 gap-4 max-[520px]:grid-cols-2">
                  {PIPELINE.map((p) => (
                    <div key={p.stage} className="text-center">
                      <p className={`font-(family-name:--font-display) text-[38px] font-semibold leading-none mb-1.5 ${stageColor(p.stage)}`}>
                        {p.count}
                      </p>
                      <p className="text-[13px] text-[--color-muted-brand]">{p.stage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Messages */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center justify-between pb-4">
                  <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Messages</CardTitle>
                  <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-[13px] font-semibold text-[--color-clay] hover:bg-transparent hover:text-[--color-clay-deep]">
                    View all
                  </Button>
                </div>
                <Separator className="bg-[--color-line]" />
              </CardHeader>
              <div>
                {MESSAGES.map((m, i) => (
                  <div key={m.id}>
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[--color-paper-deep] shrink-0 grid place-items-center text-[15px] font-semibold text-[--color-ink-soft]">
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-[14px] truncate ${m.unread > 0 ? 'font-semibold text-[--color-ink]' : 'font-medium text-[--color-ink-soft]'}`}>
                            {m.name}
                          </span>
                          <span className="text-[11px] text-[--color-muted-brand] shrink-0">{m.time}</span>
                        </div>
                        <p className="text-[12px] text-[--color-muted-brand] truncate">{m.preview}</p>
                      </div>
                      {m.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[--color-clay] text-white text-[10px] font-bold grid place-items-center">
                          {m.unread}
                        </span>
                      )}
                    </div>
                    {i < MESSAGES.length - 1 && <Separator className="bg-[--color-line] mx-5" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* Today */}
            <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="pb-4">
                  <CardTitle className="text-[16px] font-semibold text-[--color-ink]">Today</CardTitle>
                </div>
                <Separator className="bg-[--color-line]" />
              </CardHeader>
              <CardContent className="px-5 py-5 space-y-4">
                {APPTS.map((a) => (
                  <div key={a.time} className="flex items-start gap-3.5">
                    <span className="text-[12px] text-[--color-muted-brand] font-medium tabular-nums w-17 shrink-0 pt-0.5">
                      {a.time}
                    </span>
                    <div className="flex-1">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-[--color-clay]">{a.label}</span>
                      <p className="text-[14px] text-[--color-ink] mt-0.5 leading-snug">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ── Profile strength ── */}
        <Card className="bg-white border-[--color-line] shadow-card rounded-2xl gap-0 py-0">
          <CardContent className="px-6 py-5">
            <div className="flex items-center justify-between gap-8 flex-wrap">
              <div className="flex-1 min-w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-[--color-ink]">Profile strength</span>
                  <span className="text-[14px] font-bold text-[--color-clay]">{PROFILE_STRENGTH}%</span>
                </div>
                <div className="h-2 bg-[--color-line] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[--color-sage] rounded-full transition-all duration-500"
                    style={{ width: `${PROFILE_STRENGTH}%` }}
                  />
                </div>
                <p className="text-[13px] text-[--color-muted-brand] mt-2">{PROFILE_NUDGE}</p>
              </div>
              <Button className="rounded-full px-6 py-2.5 h-auto text-[14px] font-semibold bg-black! text-white! hover:bg-zinc-800! shrink-0">
                Complete profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="pb-4" />
      </div>
    </div>
  )
}
