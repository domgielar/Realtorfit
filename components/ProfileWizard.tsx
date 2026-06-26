'use client'

import { useState } from 'react'
import type { BuyerProfile } from '@/lib/matching'
import type { HomeType, CommStyle } from '@/lib/realtors'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const DEFAULTS: BuyerProfile = {
  priceMin: 250000,
  priceMax: 450000,
  region: 'Worcester',
  inState: 'in',
  firstTime: true,
  homeType: 'starter',
  timeline: '3mo',
  preApproved: false,
  experiencePref: 'noPref',
  commStyle: 'text',
}

const REGIONS = [
  'Worcester', 'Millbury', 'Shrewsbury', 'Auburn', 'Framingham',
  'Boston', 'Quincy', 'Cambridge', 'Leominster', 'Holden',
]

interface ChoiceOption {
  value: string
  label: string
}

interface ChoiceProps {
  label: string
  value: string
  options: ChoiceOption[]
  onChange: (value: string) => void
  hint?: string
}

function Choice({ label, value, options, onChange, hint }: ChoiceProps) {
  return (
    <div className="mb-6">
      <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
        {label}
      </label>
      {hint && (
        <p className="text-[13px] text-[--color-muted-brand] -mt-1 mb-3 leading-[1.45]">{hint}</p>
      )}
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

const usd = (n: number) => '$' + Number(n).toLocaleString('en-US')

interface ProfileWizardProps {
  onComplete: (profile: BuyerProfile) => void
  onBack: () => void
}

export default function ProfileWizard({ onComplete, onBack }: ProfileWizardProps) {
  const [step, setStep] = useState(0)
  const [p, setP] = useState<BuyerProfile>(DEFAULTS)
  const set = (patch: Partial<BuyerProfile>) => setP((prev) => ({ ...prev, ...patch }))

  const steps = [
    {
      title: "Your budget & where you're buying",
      body: (
        <>
          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              Purchase price range
            </label>
            <div className="flex gap-4 max-[520px]:flex-col">
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">
                  Min
                </span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                  {usd(p.priceMin)}
                </span>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="25000"
                  value={p.priceMin}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) =>
                    set({ priceMin: Math.min(+e.target.value, p.priceMax) })
                  }
                />
              </div>
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[12px] text-[--color-muted-brand] uppercase tracking-[0.08em]">
                  Max
                </span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                  {usd(p.priceMax)}
                </span>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="25000"
                  value={p.priceMax}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) =>
                    set({ priceMax: Math.max(+e.target.value, p.priceMin) })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[15px] font-semibold mb-2.5 text-[--color-ink]">
              City, town, or region
            </label>
            <select
              className="w-full px-3.5 py-3 text-[15px] border-[1.5px] border-[--color-line] rounded-[10px] bg-[--color-paper] text-[--color-ink]"
              value={p.region}
              onChange={(e) => set({ region: e.target.value })}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <Choice
            label="Are you buying in-state or out-of-state?"
            value={p.inState}
            onChange={(v) => set({ inState: v as 'in' | 'out' })}
            options={[
              { value: 'in', label: 'In-state' },
              { value: 'out', label: 'Out-of-state / relocating' },
            ]}
          />
        </>
      ),
    },
    {
      title: 'About you and the home',
      body: (
        <>
          <Choice
            label="Are you a first-time buyer?"
            value={p.firstTime ? 'yes' : 'no'}
            onChange={(v) => set({ firstTime: v === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes, first time' },
              { value: 'no', label: 'No, bought before' },
            ]}
          />
          <Choice
            label="What are you looking for?"
            value={p.homeType}
            onChange={(v) => set({ homeType: v as HomeType })}
            options={[
              { value: 'starter', label: 'Starter home' },
              { value: 'condo', label: 'Condo' },
              { value: 'luxury', label: 'Luxury home' },
              { value: 'multi-family', label: 'Multi-family' },
              { value: 'investment', label: 'Investment property' },
              { value: 'land', label: 'Land' },
            ]}
          />
          <Choice
            label="Do you have mortgage pre-approval?"
            value={p.preApproved ? 'yes' : 'no'}
            onChange={(v) => set({ preApproved: v === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'Not yet' },
            ]}
          />
        </>
      ),
    },
    {
      title: 'Timeline and the agent you want',
      body: (
        <>
          <Choice
            label="How soon are you looking to buy?"
            value={p.timeline}
            onChange={(v) => set({ timeline: v as BuyerProfile['timeline'] })}
            options={[
              { value: 'asap', label: 'As soon as possible' },
              { value: '3mo', label: 'Within 3 months' },
              { value: '6mo', label: 'Within 6 months' },
              { value: 'browsing', label: 'Just browsing' },
            ]}
          />
          <Choice
            label="What kind of agent fits you?"
            hint="Newer agents often offer lower commission to build their reputation. Experienced agents bring deeper expertise and connections."
            value={p.experiencePref}
            onChange={(v) => set({ experiencePref: v as BuyerProfile['experiencePref'] })}
            options={[
              { value: 'newer', label: 'Newer agent, lower commission' },
              { value: 'experienced', label: 'Experienced, more expertise' },
              { value: 'noPref', label: 'No strong preference' },
            ]}
          />
        </>
      ),
    },
    {
      title: 'How you like to communicate',
      body: (
        <Choice
          label="Preferred way to stay in touch"
          value={p.commStyle}
          onChange={(v) => set({ commStyle: v as CommStyle })}
          options={[
            { value: 'text', label: 'Texting' },
            { value: 'call', label: 'Phone calls' },
            { value: 'video', label: 'Video calls' },
            { value: 'in-person', label: 'In person' },
          ]}
        />
      ),
    },
  ]

  const isLast = step === steps.length - 1
  const goBack = () => (step === 0 ? onBack() : setStep(step - 1))
  const goNext = () => (isLast ? onComplete(p) : setStep(step + 1))

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-[--color-paper] max-[520px]:p-5">
      <div className="bg-white rounded-2xl w-full max-w-[620px] px-10 pt-9 pb-8 max-[520px]:px-5.5 shadow-card">
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

        <div className="min-h-65">{steps[step].body}</div>

        <Separator className="mt-7 bg-[--color-line]" />
        <div className="flex justify-between items-center pt-5.5">
          <Button
            className="rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-black! text-white! hover:bg-zinc-800!"
            onClick={goBack}
          >
            {step === 0 ? 'Back to start' : 'Back'}
          </Button>
          <Button
            className="rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-[--color-clay]! text-white! hover:bg-[--color-clay-deep]! active:translate-y-px"
            onClick={goNext}
          >
            {isLast ? 'See my matches' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
