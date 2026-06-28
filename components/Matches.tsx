'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { rankRealtors } from '@/lib/matching'
import type { BuyerProfile, MatchResult } from '@/lib/matching'
import { REALTORS } from '@/lib/realtors'
import type { Realtor } from '@/lib/realtors'
import { getRealtors } from '@/lib/supabase/queries'
import RealtorCard from './RealtorCard'
import BuyerProfilePanel from './BuyerProfilePanel'
import { createClient } from '@/lib/supabase/client'

interface MatchesProps {
  buyer: BuyerProfile
  onView: (match: MatchResult) => void
  onEdit: () => void
  onSignOut?: () => void
  selectedId?: string | null
  userId?: string
}

const usd = (n: number) => '$' + Number(n).toLocaleString('en-US')

const HOME_LABEL: Record<string, string> = {
  starter: 'Starter home',
  investment: 'Investment property',
  luxury: 'Luxury home',
  condo: 'Condo',
  'multi-family': 'Multi-family',
  land: 'Land',
}

const TIMELINE_LABEL: Record<string, string> = {
  asap: 'ASAP',
  '3mo': 'Within 3 months',
  '6mo': 'Within 6 months',
  browsing: 'Just browsing',
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-[13px]" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-[13px] font-medium text-right" style={{ color: 'var(--color-ink)' }}>{value}</span>
    </div>
  )
}

export default function Matches({ buyer, onView, onEdit, onSignOut, selectedId, userId }: MatchesProps) {
  const [maxCommission, setMaxCommission] = useState(3)
  const [minExperience, setMinExperience] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [firstTimeOnly, setFirstTimeOnly] = useState(false)
  const [language, setLanguage] = useState('any')
  const [messagesOpen, setMessagesOpen] = useState(false)

  const [allRealtors, setAllRealtors] = useState<Realtor[]>(REALTORS)
  const [loadingRealtors, setLoadingRealtors] = useState(true)
  const leadPosted = useRef(false)

  useEffect(() => {
    getRealtors().then((live) => {
      if (live.length > 0) setAllRealtors(live)
    }).finally(() => setLoadingRealtors(false))
  }, [])

  const ALL_LANGS = useMemo(() => [...new Set(allRealtors.flatMap((r) => r.languages))].sort(), [allRealtors])

  const ranked = useMemo(() => rankRealtors(buyer, allRealtors), [buyer, allRealtors])

  useEffect(() => {
    if (loadingRealtors || ranked.length === 0 || leadPosted.current) return
    leadPosted.current = true
    const matchedRealtors = ranked
      .slice(0, 10)
      .map((m) => ({ id: m.realtor.id, score: m.score }))
    fetch('/api/buyer-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...buyer, matchedRealtors }),
    }).catch(() => {})
  }, [loadingRealtors, ranked, buyer])

  const filtered = ranked.filter(({ realtor }) => {
    if (realtor.commissionRate > maxCommission) return false
    if (realtor.yearsExperience < minExperience) return false
    if (availableOnly && !realtor.availableThisWeek) return false
    if (firstTimeOnly && !realtor.firstTimeFriendly) return false
    if (language !== 'any' && !realtor.languages.includes(language)) return false
    return true
  })

  const best = ranked[0]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onSignOut?.()
  }

  return (
    <div className="max-w-285 mx-auto px-6 pb-20 pt-9">
      <header className="flex justify-between items-start gap-5 mb-7 max-[860px]:flex-col">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-card border border-[--color-line]">
          <p className="uppercase tracking-[0.14em] text-[12px] font-semibold text-[--color-clay] m-0 mb-1.5">
            Your matches
          </p>
          <h1 className="font-(family-name:--font-display) font-semibold tracking-[-0.02em] m-0 mb-2 capitalize text-[--color-ink] text-[clamp(22px,4vw,32px)]">
            {filtered.length} realtor{filtered.length === 1 ? '' : 's'} for a{' '}
            {buyer.homeType.replace('-', ' ')} near {buyer.region}
          </h1>
          {best && (
            <p className="text-[15px] text-[--color-ink-soft] m-0">
              Top match: <strong>{best.realtor.name}</strong> at{' '}
              <strong>{best.score}%</strong> —{' '}
              {best.reasons.find((r) => r.type === 'plus')?.text.toLowerCase()}.
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-8 grid-cols-[248px_1fr] max-[860px]:grid-cols-1">
        <aside className="sticky top-6 self-start bg-white rounded-2xl p-5.5 border border-[--color-line] max-[860px]:static shadow-card">

          {/* Filters */}
          <h2 className="text-[14px] uppercase tracking-widest text-[--color-muted-brand] m-0 mb-4.5">
            Refine
          </h2>

          <label className="block text-[14px] text-[--color-ink-soft] mb-5 cursor-pointer">
            Max commission:{' '}
            <strong className="text-[--color-ink]">{maxCommission.toFixed(2)}%</strong>
            <input
              type="range"
              min="1.5"
              max="3"
              step="0.25"
              value={maxCommission}
              className="w-full mt-2 accent-[--color-clay]"
              onChange={(e) => setMaxCommission(+e.target.value)}
            />
          </label>

          <label className="block text-[14px] text-[--color-ink-soft] mb-5 cursor-pointer">
            Min experience:{' '}
            <strong className="text-[--color-ink]">{minExperience} yrs</strong>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={minExperience}
              className="w-full mt-2 accent-[--color-clay]"
              onChange={(e) => setMinExperience(+e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2.25 text-[14px] text-[--color-ink-soft] mb-5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[--color-clay]"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available this week
          </label>

          <label className="flex items-center gap-2.25 text-[14px] text-[--color-ink-soft] mb-5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[--color-clay]"
              checked={firstTimeOnly}
              onChange={(e) => setFirstTimeOnly(e.target.checked)}
            />
            Good with first-time buyers
          </label>

          <label className="block text-[14px] text-[--color-ink-soft] mb-5 cursor-pointer">
            Language
            <select
              className="w-full mt-2 px-2.5 py-2.25 border-[1.5px] border-[--color-line] rounded-lg bg-[--color-paper] text-[14px] text-[--color-ink]"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="any">Any</option>
              {ALL_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          {/* Your profile section */}
          <div
            className="border-t pt-5 mt-1"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h2 className="text-[14px] uppercase tracking-widest m-0 mb-3.5" style={{ color: 'var(--color-muted)' }}>
              Your Profile
            </h2>

            <div className="space-y-2 mb-4">
              <ProfileRow label="Budget" value={`${usd(buyer.priceMin)} – ${usd(buyer.priceMax)}`} />
              <ProfileRow label="Location" value={buyer.region || '—'} />
              <ProfileRow label="Looking for" value={HOME_LABEL[buyer.homeType] ?? buyer.homeType} />
              <ProfileRow label="Timeline" value={TIMELINE_LABEL[buyer.timeline] ?? buyer.timeline} />
              <ProfileRow label="Pre-approved" value={buyer.preApproved ? 'Yes' : 'Not yet'} />
              <ProfileRow label="First-time buyer" value={buyer.firstTime ? 'Yes' : 'No'} />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onEdit}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-clay)' }}
              >
                Edit profile
              </button>
              <button
                onClick={() => setMessagesOpen(true)}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold border transition-colors"
                style={{
                  color: 'var(--color-ink-soft)',
                  borderColor: 'var(--color-line)',
                  background: 'var(--color-paper)',
                }}
              >
                Messages
              </button>
              {onSignOut && (
                <button
                  onClick={handleSignOut}
                  className="w-full py-1.5 text-[12px] transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </aside>

        <section className="grid grid-cols-2 gap-5 content-start max-[860px]:grid-cols-1">
          {loadingRealtors && (
            <p className="col-span-2 text-[13px] text-[--color-muted] mb-1">
              Loading live agents…
            </p>
          )}
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-15 px-5 text-[--color-ink-soft]">
              <p>No realtors match these filters yet.</p>
              <p className="text-[--color-muted-brand] text-[14px]">
                Loosen a filter to see more agents.
              </p>
            </div>
          ) : (
            filtered.map((match) => (
              <RealtorCard
                key={match.realtor.id}
                match={match}
                onView={onView}
                selectedId={selectedId}
              />
            ))
          )}
        </section>
      </div>

      {/* LinkedIn-style messages popup — bottom-right, triggered by Messages button in sidebar */}
      {userId && (
        <BuyerProfilePanel
          open={messagesOpen}
          onClose={() => setMessagesOpen(false)}
          userId={userId}
        />
      )}
    </div>
  )
}
