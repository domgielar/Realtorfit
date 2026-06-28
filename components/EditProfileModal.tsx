'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Realtor, HomeType, CommStyle } from '@/lib/realtors'
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

function ToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-[--color-ink] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border-[1.5px] transition-colors ${
              value === o.value
                ? 'bg-black border-black text-white'
                : 'bg-white border-gray-300 text-[--color-ink] hover:border-gray-500'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function MultiToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string[]
  options: { value: string; label: string }[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div>
      <p className="text-[13px] font-semibold text-[--color-ink] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border-[1.5px] transition-colors ${
              value.includes(o.value)
                ? 'bg-black border-black text-white'
                : 'bg-white border-gray-300 text-[--color-ink] hover:border-gray-500'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const usd = (n: number) => '$' + Number(n).toLocaleString('en-US')

interface Props {
  realtor: Realtor
  userId: string
  onSave: (updated: Realtor) => void
  onClose: () => void
}

export default function EditProfileModal({ realtor, userId, onSave, onClose }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [name, setName] = useState(realtor.name)
  const [photo, setPhoto] = useState(realtor.photo)
  const [bio, setBio] = useState(
    realtor.bio === 'No bio provided yet.' ? '' : realtor.bio
  )
  const [recentDeal, setRecentDeal] = useState(
    realtor.recentDeal === 'No recent deal listed yet.' ? '' : realtor.recentDeal
  )
  const [yearsExperience, setYearsExperience] = useState(realtor.yearsExperience)
  const [homesSold, setHomesSold] = useState(realtor.homesSold)
  const [specialties, setSpecialties] = useState<HomeType[]>(realtor.specialties)
  const [priceMin, setPriceMin] = useState(realtor.priceBand[0])
  const [priceMax, setPriceMax] = useState(realtor.priceBand[1])
  const [commissionRate, setCommissionRate] = useState(realtor.commissionRate)
  const [commStyles, setCommStyles] = useState<CommStyle[]>(realtor.commStyles)
  const [avgResponseHours, setAvgResponseHours] = useState(realtor.avgResponseHours)
  const [firstTimeFriendly, setFirstTimeFriendly] = useState(realtor.firstTimeFriendly)
  const [outOfStateExperienced, setOutOfStateExperienced] = useState(realtor.outOfStateExperienced)
  const [investmentExperienced, setInvestmentExperienced] = useState(realtor.investmentExperienced)
  const [languages, setLanguages] = useState<string[]>(realtor.languages)
  const [personality, setPersonality] = useState<string[]>(realtor.personality)
  const [serviceLocation, setServiceLocation] = useState<LocationSelection | null>(
    realtor.serviceLat != null && realtor.serviceLng != null
      ? {
          label: realtor.regions[0] ?? 'Your service area',
          lat: realtor.serviceLat,
          lng: realtor.serviceLng,
          radiusMi: realtor.serviceRadiusMi ?? 25,
        }
      : null
  )

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('realtors')
        .update({
          name: name.trim(),
          photo,
          bio: bio.trim() || 'No bio provided yet.',
          recent_deal: recentDeal.trim() || 'No recent deal listed yet.',
          years_experience: yearsExperience,
          homes_sold: homesSold,
          specialties,
          price_band_min: priceMin,
          price_band_max: priceMax,
          commission_rate: commissionRate,
          comm_styles: commStyles,
          avg_response_hours: avgResponseHours,
          first_time_friendly: firstTimeFriendly,
          out_of_state_experienced: outOfStateExperienced,
          investment_experienced: investmentExperienced,
          languages,
          personality,
          ...(serviceLocation && {
            regions: [serviceLocation.label],
            service_lat: serviceLocation.lat,
            service_lng: serviceLocation.lng,
            service_radius_mi: serviceLocation.radiusMi,
          }),
        })
        .eq('user_id', userId)

      if (dbError) throw dbError

      onSave({
        ...realtor,
        name: name.trim(),
        photo,
        bio: bio.trim() || 'No bio provided yet.',
        recentDeal: recentDeal.trim() || 'No recent deal listed yet.',
        yearsExperience,
        homesSold,
        specialties,
        priceBand: [priceMin, priceMax],
        commissionRate,
        commStyles,
        avgResponseHours,
        firstTimeFriendly,
        outOfStateExperienced,
        investmentExperienced,
        languages,
        personality,
        ...(serviceLocation && {
          regions: [serviceLocation.label],
          serviceLat: serviceLocation.lat,
          serviceLng: serviceLocation.lng,
          serviceRadiusMi: serviceLocation.radiusMi,
        }),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-[--color-line] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-(family-name:--font-display) text-[20px] font-semibold text-[--color-ink]">
            Edit profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[--color-muted] hover:bg-[--color-paper] transition-colors text-[18px]"
          >
            ✕
          </button>
        </div>

        {/* Form — scrollable middle */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-7">

          {/* Avatar */}
          <div>
            <p className="text-[13px] font-semibold text-[--color-ink] mb-2.5">Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setPhoto(a)}
                  className={`w-11 h-11 text-[20px] rounded-full grid place-items-center transition-all ${
                    photo === a
                      ? 'bg-black ring-2 ring-black ring-offset-2'
                      : 'bg-[--color-paper-deep] hover:bg-[--color-line]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-[--color-line]" />

          {/* Name */}
          <div>
            <label className="block text-[13px] font-semibold text-[--color-ink] mb-2">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[13px] font-semibold text-[--color-ink] mb-2">
              Bio{' '}
              <span className="font-normal text-[--color-muted]">— shown to buyers</span>
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers what makes you different and why they should choose you…"
              className="w-full px-3.5 py-2.5 text-[14px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay] resize-none leading-[1.55]"
            />
          </div>

          {/* Recent deal */}
          <div>
            <label className="block text-[13px] font-semibold text-[--color-ink] mb-2">
              Recent deal{' '}
              <span className="font-normal text-[--color-muted]">— one line</span>
            </label>
            <input
              type="text"
              value={recentDeal}
              onChange={(e) => setRecentDeal(e.target.value)}
              placeholder="e.g. Helped a family close on a 3-bed in Worcester $8k under asking."
              className="w-full px-3.5 py-2.5 text-[14px] border-[1.5px] border-gray-300 rounded-[10px] bg-white text-[--color-ink] outline-none focus:border-[--color-clay]"
            />
          </div>

          <Separator className="bg-[--color-line]" />

          {/* Service area */}
          <div>
            <p className="text-[13px] font-semibold text-[--color-ink] mb-1">Service area</p>
            <p className="text-[12px] text-[--color-muted] mb-3">
              Pin where you work and set your radius. Buyers searching in this area will see your profile.
            </p>
            <LocationPicker
              value={serviceLocation}
              onChange={(sel) => setServiceLocation(sel)}
              placeholder="Search for your city or area…"
              minRadius={5}
              maxRadius={100}
            />
          </div>

          <Separator className="bg-[--color-line]" />

          {/* Experience & homes sold */}
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
              <span className="text-[11px] text-[--color-muted] uppercase tracking-wider">Years of experience</span>
              <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                {yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}
              </span>
              <input
                type="range" min="0" max="35" step="1" value={yearsExperience}
                className="w-full accent-[--color-clay]"
                onChange={(e) => setYearsExperience(+e.target.value)}
              />
            </div>
            <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
              <span className="text-[11px] text-[--color-muted] uppercase tracking-wider">Homes sold</span>
              <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">
                {homesSold >= 600 ? '600+' : homesSold}
              </span>
              <input
                type="range" min="0" max="600" step="5" value={homesSold}
                className="w-full accent-[--color-clay]"
                onChange={(e) => setHomesSold(+e.target.value)}
              />
            </div>
          </div>

          <Separator className="bg-[--color-line]" />

          {/* Specialties */}
          <MultiToggleGroup
            label="Specialties"
            value={specialties}
            options={[
              { value: 'starter', label: 'Starter homes' },
              { value: 'condo', label: 'Condos' },
              { value: 'luxury', label: 'Luxury homes' },
              { value: 'multi-family', label: 'Multi-family' },
              { value: 'investment', label: 'Investment properties' },
              { value: 'land', label: 'Land' },
            ]}
            onChange={(v) => setSpecialties(v as HomeType[])}
          />

          {/* Price band */}
          <div>
            <p className="text-[13px] font-semibold text-[--color-ink] mb-2">Price range you work in</p>
            <div className="flex gap-4 max-[480px]:flex-col">
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[11px] text-[--color-muted] uppercase tracking-wider">Min</span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{usd(priceMin)}</span>
                <input
                  type="range" min="100000" max="3000000" step="25000" value={priceMin}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) => setPriceMin(Math.min(+e.target.value, priceMax))}
                />
              </div>
              <div className="flex-1 bg-[--color-paper] rounded-[10px] px-3.5 py-3">
                <span className="text-[11px] text-[--color-muted] uppercase tracking-wider">Max</span>
                <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{usd(priceMax)}</span>
                <input
                  type="range" min="100000" max="3000000" step="25000" value={priceMax}
                  className="w-full accent-[--color-clay]"
                  onChange={(e) => setPriceMax(Math.max(+e.target.value, priceMin))}
                />
              </div>
            </div>
          </div>

          {/* Commission rate */}
          <div className="bg-[--color-paper] rounded-[10px] px-3.5 py-3">
            <span className="text-[11px] text-[--color-muted] uppercase tracking-wider">Commission rate</span>
            <span className="block text-[18px] font-semibold mt-0.5 mb-2 text-[--color-ink]">{commissionRate.toFixed(2)}%</span>
            <input
              type="range" min="1.0" max="3.5" step="0.25" value={commissionRate}
              className="w-full accent-[--color-clay]"
              onChange={(e) => setCommissionRate(+e.target.value)}
            />
          </div>

          <Separator className="bg-[--color-line]" />

          {/* Comm styles */}
          <MultiToggleGroup
            label="How you prefer to communicate"
            value={commStyles}
            options={[
              { value: 'text', label: 'Texting' },
              { value: 'call', label: 'Phone calls' },
              { value: 'video', label: 'Video calls' },
              { value: 'in-person', label: 'In person' },
            ]}
            onChange={(v) => setCommStyles(v as CommStyle[])}
          />

          {/* Avg response time */}
          <ToggleGroup
            label="Average response time"
            value={String(avgResponseHours)}
            options={[
              { value: '0.5', label: 'Under 1 hour' },
              { value: '2', label: '1–3 hours' },
              { value: '4', label: '3–6 hours' },
              { value: '8', label: '6+ hours' },
            ]}
            onChange={(v) => setAvgResponseHours(+v)}
          />

          {/* First-time buyers */}
          <ToggleGroup
            label="Do you work with first-time buyers?"
            value={firstTimeFriendly ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: "Yes, it's a strength" },
              { value: 'no', label: 'I focus on experienced buyers' },
            ]}
            onChange={(v) => setFirstTimeFriendly(v === 'yes')}
          />

          {/* Out-of-state */}
          <ToggleGroup
            label="Out-of-state or relocating buyers?"
            value={outOfStateExperienced ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes, I handle remote buying' },
              { value: 'no', label: 'Primarily local buyers' },
            ]}
            onChange={(v) => setOutOfStateExperienced(v === 'yes')}
          />

          {/* Investment experience */}
          <ToggleGroup
            label="Investment property experience?"
            value={investmentExperienced ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes, I run the numbers' },
              { value: 'no', label: 'Not my focus' },
            ]}
            onChange={(v) => setInvestmentExperienced(v === 'yes')}
          />

          <Separator className="bg-[--color-line]" />

          {/* Languages */}
          <MultiToggleGroup
            label="Languages you speak"
            value={languages}
            options={LANGUAGES.map((l) => ({ value: l, label: l }))}
            onChange={(v) => setLanguages(v)}
          />

          {/* Personality */}
          <MultiToggleGroup
            label="How would you describe your approach?"
            value={personality}
            options={PERSONALITY_TAGS.map((t) => ({ value: t, label: t }))}
            onChange={(v) => setPersonality(v)}
          />

        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white border-t border-[--color-line] px-6 py-4 rounded-b-2xl flex items-center gap-4">
          {error && <p className="text-[13px] text-red-600 flex-1">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="ghost"
              className="rounded-full px-5 py-2 h-auto text-[14px] text-[--color-ink-soft]!"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full px-6 py-2 h-auto text-[14px] font-semibold bg-[--color-clay]! text-white! hover:bg-[--color-clay-deep]! disabled:opacity-40"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
