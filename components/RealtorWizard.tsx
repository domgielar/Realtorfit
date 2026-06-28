'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Realtor, HomeType, CommStyle } from '@/lib/realtors'
import { registerRealtor } from '@/lib/realtors'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import LocationPicker, { type LocationSelection } from '@/components/LocationPicker'

const AVATARS = [
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨🏽‍💼', '👩🏽‍💼', '👨🏼‍💼',
  '👩🏼‍💼', '👨🏿‍💼', '👩🏿‍💼', '👩🏾‍💼', '👩🏻‍💼', '🧔', '👩🏼‍🦰',
]

const LANGUAGES = [
  'English', 'Spanish', 'Portuguese', 'French',
  'Mandarin', 'Cantonese', 'Hindi', 'Tamil',
  'Arabic', 'Vietnamese', 'Korean', 'Russian', 'Polish',
]

const PERSONALITY_TAGS = [
  'Patient', 'Aggressive negotiator', 'Investment-focused',
  'Great with first-time buyers', 'Responsive', 'Local expert',
  'Data-driven', 'Multilingual',
]

interface Draft {
  name: string
  photo: string
  yearsExperience: number
  homesSold: number
  regions: string[]
  serviceLocation: LocationSelection | null
  specialties: HomeType[]
  priceMin: number
  priceMax: number
  commissionRate: number
  commStyles: CommStyle[]
  availableThisWeek: boolean
  avgResponseHours: number
  firstTimeFriendly: boolean
  outOfStateExperienced: boolean
  investmentExperienced: boolean
  languages: string[]
  personality: string[]
  bio: string
  recentDeal: string
}

const DEFAULTS: Draft = {
  name: '',
  photo: '🧑‍💼',
  yearsExperience: 5,
  homesSold: 50,
  regions: [],
  serviceLocation: null,
  specialties: [],
  priceMin: 250000,
  priceMax: 700000,
  commissionRate: 2.5,
  commStyles: [],
  availableThisWeek: true,
  avgResponseHours: 2,
  firstTimeFriendly: false,
  outOfStateExperienced: false,
  investmentExperienced: false,
  languages: ['English'],
  personality: [],
  bio: '',
  recentDeal: '',
}

function Choice({
  label, value, options, onChange, hint,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="mb-6">
      <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">{label}</label>
      {hint && <p className="text-[13px] text-[--color-muted-brand] -mt-1 mb-3 leading-[1.45]">{hint}</p>}
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <Button
            key={o.value}
            type="button"
            className={`rounded-full px-4 py-2.25 h-auto text-[14px] font-medium border-[1.5px] ${
              value === o.value
                ? 'bg-black! border-black! text-white! hover:bg-zinc-800!'
                : 'bg-white! border-gray-300! text-black! hover:border-gray-500! hover:bg-white!'
            }`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function MultiChoice({
  label, value, options, onChange, hint,
}: {
  label: string
  value: string[]
  options: { value: string; label: string }[]
  onChange: (v: string[]) => void
  hint?: string
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div className="mb-6">
      <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">{label}</label>
      {hint && <p className="text-[13px] text-[--color-muted-brand] -mt-1 mb-3 leading-[1.45]">{hint}</p>}
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <Button
            key={o.value}
            type="button"
            className={`rounded-full px-4 py-2.25 h-auto text-[14px] font-medium border-[1.5px] ${
              value.includes(o.value)
                ? 'bg-black! border-black! text-white! hover:bg-zinc-800!'
                : 'bg-white! border-gray-300! text-black! hover:border-gray-500! hover:bg-white!'
            }`}
            onClick={() => toggle(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

const usd = (n: number) => '$' + Number(n).toLocaleString('en-US')

interface Props {
  onComplete: () => void
  onBack: () => void
}

export default function RealtorWizard({ onComplete, onBack }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [p, setP] = useState<Draft>(DEFAULTS)
  const set = (patch: Partial<Draft>) => setP((prev) => ({ ...prev, ...patch }))

  // Grow-and-land transition to dashboard
  const [growing, setGrowing] = useState(false)

  const handleGoToDashboard = () => {
    localStorage.setItem('rf_entry', JSON.stringify({ emoji: p.photo, name: p.name.split(' ')[0] }))
    setGrowing(true)
    setTimeout(() => router.push('/dashboard'), 950)
  }

  const steps = [
    {
      title: 'Tell us about you',
      canProceed: p.name.trim().length > 0,
      body: (
        <>
          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              Your full name
            </label>
            <input
              type="text"
              placeholder="e.g. Maria Alvarez"
              value={p.name}
              onChange={(e) => set({ name: e.target.value })}
              className="w-full px-3.5 py-3 text-[15px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay]"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-3 text-[--color-ink]">
              Pick an avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set({ photo: a })}
                  className={`w-12 h-12 text-[22px] rounded-full grid place-items-center transition-all ${
                    p.photo === a
                      ? 'bg-black ring-2 ring-black ring-offset-2'
                      : 'bg-[--color-paper-deep] hover:bg-[--color-line]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 max-[520px]:grid-cols-1">
            <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
              <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">
                Years of experience
              </span>
              <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                {p.yearsExperience} {p.yearsExperience === 1 ? 'year' : 'years'}
              </span>
              <input
                type="range" min="0" max="35" step="1" value={p.yearsExperience}
                className="w-full accent-[--color-clay]"
                onChange={(e) => set({ yearsExperience: +e.target.value })}
              />
            </div>
            <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
              <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">
                Homes sold
              </span>
              <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                {p.homesSold >= 600 ? '600+' : p.homesSold}
              </span>
              <input
                type="range" min="0" max="600" step="5" value={p.homesSold}
                className="w-full accent-[--color-clay]"
                onChange={(e) => set({ homesSold: +e.target.value })}
              />
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Where do you work?',
      canProceed: p.serviceLocation !== null,
      body: (
        <div className="mb-6">
          <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
            Your service area
          </label>
          <p className="text-[13px] text-[--color-muted-brand] -mt-1 mb-3 leading-[1.45]">
            Pin the center of where you work and set a radius. Buyers searching in this area will see your profile.
          </p>
          <LocationPicker
            value={p.serviceLocation}
            onChange={(sel) => set({ serviceLocation: sel, regions: [sel.label] })}
            placeholder="Search for your city or area…"
            minRadius={5}
            maxRadius={100}
          />
        </div>
      ),
    },
    {
      title: 'What you sell',
      canProceed: p.specialties.length > 0,
      body: (
        <>
          <MultiChoice
            label="Your specialties"
            value={p.specialties}
            onChange={(v) => set({ specialties: v as HomeType[] })}
            options={[
              { value: 'starter', label: 'Starter homes' },
              { value: 'condo', label: 'Condos' },
              { value: 'luxury', label: 'Luxury homes' },
              { value: 'multi-family', label: 'Multi-family' },
              { value: 'investment', label: 'Investment properties' },
              { value: 'land', label: 'Land' },
            ]}
          />
          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              Price range you typically work in
            </label>
            <div className="flex gap-4 max-[520px]:flex-col">
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">Min</span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{usd(p.priceMin)}</span>
                <input
                  type="range" min="100000" max="3000000" step="25000" value={p.priceMin}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) => set({ priceMin: Math.min(+e.target.value, p.priceMax) })}
                />
              </div>
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">Max</span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{usd(p.priceMax)}</span>
                <input
                  type="range" min="100000" max="3000000" step="25000" value={p.priceMax}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) => set({ priceMax: Math.max(+e.target.value, p.priceMin) })}
                />
              </div>
            </div>
          </div>
          <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
            <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">Commission rate</span>
            <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{p.commissionRate.toFixed(2)}%</span>
            <input
              type="range" min="1.0" max="3.5" step="0.25" value={p.commissionRate}
              className="w-full accent-[--color-clay]"
              onChange={(e) => set({ commissionRate: +e.target.value })}
            />
          </div>
        </>
      ),
    },
    {
      title: 'How you work',
      canProceed: p.commStyles.length > 0,
      body: (
        <>
          <MultiChoice
            label="How do you prefer to communicate?"
            value={p.commStyles}
            onChange={(v) => set({ commStyles: v as CommStyle[] })}
            options={[
              { value: 'text', label: 'Texting' },
              { value: 'call', label: 'Phone calls' },
              { value: 'video', label: 'Video calls' },
              { value: 'in-person', label: 'In person' },
            ]}
          />
          <Choice
            label="Available this week?"
            value={p.availableThisWeek ? 'yes' : 'no'}
            onChange={(v) => set({ availableThisWeek: v === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes, ready now' },
              { value: 'no', label: 'Booking a bit ahead' },
            ]}
          />
          <Choice
            label="Average response time"
            value={String(p.avgResponseHours)}
            onChange={(v) => set({ avgResponseHours: +v })}
            options={[
              { value: '0.5', label: 'Under 1 hour' },
              { value: '2', label: '1–3 hours' },
              { value: '4', label: '3–6 hours' },
              { value: '8', label: '6+ hours' },
            ]}
          />
          <Choice
            label="Do you work with first-time buyers?"
            value={p.firstTimeFriendly ? 'yes' : 'no'}
            onChange={(v) => set({ firstTimeFriendly: v === 'yes' })}
            options={[
              { value: 'yes', label: "Yes, it's a strength" },
              { value: 'no', label: 'I focus on experienced buyers' },
            ]}
          />
          <Choice
            label="Out-of-state or relocating buyers?"
            value={p.outOfStateExperienced ? 'yes' : 'no'}
            onChange={(v) => set({ outOfStateExperienced: v === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes, I handle remote buying' },
              { value: 'no', label: 'Primarily local buyers' },
            ]}
          />
          <Choice
            label="Investment property experience?"
            value={p.investmentExperienced ? 'yes' : 'no'}
            onChange={(v) => set({ investmentExperienced: v === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes, I run the numbers' },
              { value: 'no', label: 'Not my focus' },
            ]}
          />
        </>
      ),
    },
    {
      title: 'Your story',
      canProceed: true,
      body: (
        <>
          <MultiChoice
            label="Languages you speak"
            value={p.languages}
            onChange={(v) => set({ languages: v })}
            options={LANGUAGES.map((l) => ({ value: l, label: l }))}
          />
          <MultiChoice
            label="How would you describe your approach?"
            value={p.personality}
            onChange={(v) => set({ personality: v })}
            options={PERSONALITY_TAGS.map((t) => ({ value: t, label: t }))}
          />
          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              Your bio{' '}
              <span className="text-[13px] font-normal text-[--color-muted-brand]">(shown to buyers)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell buyers what makes you different and why they should choose you..."
              value={p.bio}
              onChange={(e) => set({ bio: e.target.value })}
              className="w-full px-3.5 py-3 text-[15px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay] resize-none leading-[1.55]"
            />
          </div>
          <div className="mb-2">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              A recent deal you&apos;re proud of{' '}
              <span className="text-[13px] font-normal text-[--color-muted-brand]">(one line)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Helped a family close on a 3-bed in Worcester $8k under asking."
              value={p.recentDeal}
              onChange={(e) => set({ recentDeal: e.target.value })}
              className="w-full px-3.5 py-3 text-[15px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay]"
            />
          </div>
        </>
      ),
    },
  ]

  const isLast = step === steps.length - 1
  const canProceed = steps[step].canProceed

  const goBack = () => (step === 0 ? onBack() : setStep(step - 1))
  const goNext = useCallback(async () => {
    if (!canProceed || submitting) return
    if (isLast) {
      const realtor: Realtor = {
        id: '',
        name: p.name.trim(),
        photo: p.photo,
        regions: p.regions,
        serviceLat: p.serviceLocation?.lat,
        serviceLng: p.serviceLocation?.lng,
        serviceRadiusMi: p.serviceLocation?.radiusMi,
        yearsExperience: p.yearsExperience,
        homesSold: p.homesSold,
        priceBand: [p.priceMin, p.priceMax],
        commissionRate: p.commissionRate,
        specialties: p.specialties,
        firstTimeFriendly: p.firstTimeFriendly,
        outOfStateExperienced: p.outOfStateExperienced,
        investmentExperienced: p.investmentExperienced,
        languages: p.languages,
        commStyles: p.commStyles,
        availableThisWeek: p.availableThisWeek,
        avgResponseHours: p.avgResponseHours,
        rating: 0,
        reviewCount: 0,
        licenseVerified: false,
        personality: p.personality,
        bio: p.bio || 'No bio provided yet.',
        recentDeal: p.recentDeal || 'No recent deal listed yet.',
      }
      setSubmitting(true)
      setSubmitError(null)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setSubmitError('You must be signed in to create a realtor profile. Please go back and log in.')
          setSubmitting(false)
          return
        }
        await registerRealtor(realtor, user.id)
        setDone(true)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setSubmitting(false)
      }
    } else {
      setStep(step + 1)
    }
  }, [canProceed, submitting, isLast, p, step])

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 max-[520px]:p-5">
        <div className="bg-white rounded-2xl w-full max-w-155 px-10 pt-9 pb-8 max-[520px]:px-5.5 shadow-card text-center overflow-visible">
          {/* Emoji grows from its position — no overlay, background stays visible */}
          <div
            style={{
              fontSize: '64px',
              lineHeight: 1,
              display: 'inline-block',
              marginBottom: '16px',
              transform: growing ? 'scale(3.2)' : 'scale(1)',
              transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.8, 1)',
              transformOrigin: 'center center',
            }}
          >
            {p.photo}
          </div>

          {/* Rest of the card fades out while the emoji grows */}
          <div
            style={{
              opacity: growing ? 0 : 1,
              transition: 'opacity 0.35s ease',
              pointerEvents: growing ? 'none' : undefined,
            }}
          >
            <h2 className="font-(family-name:--font-display) text-[28px] font-semibold tracking-[-0.01em] mb-2 text-[--color-ink]">
              You&apos;re live, {p.name.split(' ')[0]}!
            </h2>
            <p className="text-[16px] text-[--color-ink-soft] mb-1 max-w-md mx-auto">
              Your profile is active. Buyers searching near{' '}
              <strong>{p.serviceLocation?.label ?? p.regions[0] ?? 'your area'}</strong>{' '}
              within <strong>{p.serviceLocation?.radiusMi ?? 25} miles</strong> will now see you in their matches.
            </p>
            <p className="text-[13px] text-[--color-muted-brand] mb-8">
              License verification is pending — a verified badge will appear once confirmed.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-[--color-paper] rounded-xl text-left">
              <div>
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-wider block mb-0.5">Commission</span>
                <strong className="text-[--color-ink] text-[16px]">{p.commissionRate.toFixed(2)}%</strong>
              </div>
              <div>
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-wider block mb-0.5">Experience</span>
                <strong className="text-[--color-ink] text-[16px]">{p.yearsExperience} {p.yearsExperience === 1 ? 'yr' : 'yrs'}</strong>
              </div>
              <div>
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-wider block mb-0.5">Homes sold</span>
                <strong className="text-[--color-ink] text-[16px]">{p.homesSold >= 600 ? '600+' : p.homesSold}</strong>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                className="rounded-full px-8 py-3 h-auto text-[16px] font-semibold bg-black! text-white! hover:bg-zinc-800! w-full"
                onClick={handleGoToDashboard}
              >
                Go to my dashboard →
              </Button>
              <Button
                variant="ghost"
                className="rounded-full px-8 py-3 h-auto text-[15px] font-medium text-[--color-ink-soft]! hover:bg-transparent! hover:text-[--color-ink]! w-full"
                onClick={onComplete}
              >
                Back to home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-[--color-paper] max-[520px]:p-5">
      <div className="bg-white rounded-2xl w-full max-w-155 px-10 pt-9 pb-8 max-[520px]:px-5.5 shadow-card">
        <div className="flex gap-2 mb-4.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.25 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[--color-clay]' : 'bg-[--color-paper-deep]'
              }`}
            />
          ))}
        </div>
        <p className="text-[13px] text-[--color-muted-brand] m-0 mb-1 font-medium">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="font-(family-name:--font-display) text-[26px] font-semibold tracking-[-0.01em] m-0 mb-6.5 text-[--color-ink]">
          {steps[step].title}
        </h2>

        <div>{steps[step].body}</div>

        <Separator className="mt-4 bg-[--color-line]" />
        {submitError && (
          <p className="text-sm text-red-600 mt-3">{submitError}</p>
        )}
        <div className="flex justify-between items-center pt-5.5">
          <Button
            className="rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-black! text-white! hover:bg-zinc-800!"
            onClick={goBack}
            disabled={submitting}
          >
            {step === 0 ? 'Back to start' : 'Back'}
          </Button>
          <Button
            className={`rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-[--color-clay]! text-white! hover:bg-[--color-clay-deep]! active:translate-y-px ${
              !canProceed || submitting ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            onClick={goNext}
            disabled={!canProceed || submitting}
          >
            {submitting ? 'Saving…' : isLast ? 'Create my profile' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
