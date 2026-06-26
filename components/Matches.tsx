'use client'

import { useMemo, useState } from 'react'
import { rankRealtors } from '@/lib/matching'
import type { BuyerProfile, MatchResult } from '@/lib/matching'
import { REALTORS } from '@/lib/realtors'
import RealtorCard from './RealtorCard'
import { Button } from '@/components/ui/button'

const ALL_LANGS = [...new Set(REALTORS.flatMap((r) => r.languages))].sort()

interface MatchesProps {
  buyer: BuyerProfile
  onView: (match: MatchResult) => void
  onEdit: () => void
}

export default function Matches({ buyer, onView, onEdit }: MatchesProps) {
  const [maxCommission, setMaxCommission] = useState(3)
  const [minExperience, setMinExperience] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [firstTimeOnly, setFirstTimeOnly] = useState(false)
  const [language, setLanguage] = useState('any')

  const ranked = useMemo(() => rankRealtors(buyer, REALTORS), [buyer])

  const filtered = ranked.filter(({ realtor }) => {
    if (realtor.commissionRate > maxCommission) return false
    if (realtor.yearsExperience < minExperience) return false
    if (availableOnly && !realtor.availableThisWeek) return false
    if (firstTimeOnly && !realtor.firstTimeFriendly) return false
    if (language !== 'any' && !realtor.languages.includes(language)) return false
    return true
  })

  const best = ranked[0]

  return (
    <div className="max-w-285 mx-auto px-6 pb-20 pt-9">
      <header className="flex justify-between items-start gap-5 mb-7 max-[860px]:flex-col">
        <div>
          <p className="uppercase tracking-[0.14em] text-[12px] font-semibold text-[--color-clay] m-0 mb-4.5">
            Your matches
          </p>
          <h1 className="font-(family-name:--font-display) font-semibold tracking-[-0.02em] m-0 my-1.5 mb-2 capitalize text-[--color-ink] text-[clamp(26px,4vw,36px)]">
            {filtered.length} realtor{filtered.length === 1 ? '' : 's'} for a{' '}
            {buyer.homeType.replace('-', ' ')} near {buyer.region}
          </h1>
          {best && (
            <p className="text-[16px] text-[--color-ink-soft] m-0">
              Top match: <strong>{best.realtor.name}</strong> at{' '}
              <strong>{best.score}%</strong> —{' '}
              {best.reasons.find((r) => r.type === 'plus')?.text.toLowerCase()}.
            </p>
          )}
        </div>
        <Button
          className="rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold shrink-0 bg-black! text-white! hover:bg-zinc-800!"
          onClick={onEdit}
        >
          Edit profile
        </Button>
      </header>

      <div className="grid gap-8 grid-cols-[248px_1fr] max-[860px]:grid-cols-1">
        <aside className="sticky top-6 self-start bg-white rounded-2xl p-5.5 border border-[--color-line] max-[860px]:static shadow-card">
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
        </aside>

        <section className="grid grid-cols-2 gap-5 content-start max-[860px]:grid-cols-1">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-15 px-5 text-[--color-ink-soft]">
              <p>No realtors match these filters yet.</p>
              <p className="text-[--color-muted-brand] text-[14px]">
                Loosen a filter to see more agents.
              </p>
            </div>
          ) : (
            filtered.map((match) => (
              <RealtorCard key={match.realtor.id} match={match} onView={onView} />
            ))
          )}
        </section>
      </div>
    </div>
  )
}
