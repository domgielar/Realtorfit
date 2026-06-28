'use client'

import { useEffect, useState } from 'react'
import type { MatchResult } from '@/lib/matching'
import FitScore from './FitScore'
import MessageThread from './MessageThread'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RealtorDetailProps {
  match: MatchResult | null
  onClose: () => void
  buyerUserId?: string | null
}

const usd = (n: number) => '$' + Number(n).toLocaleString('en-US')

export default function RealtorDetail({ match, onClose, buyerUserId }: RealtorDetailProps) {
  const [showMessages, setShowMessages] = useState(false)

  useEffect(() => {
    setShowMessages(false)
  }, [match?.realtor.id])

  return (
    <Dialog open={!!match} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-[rgba(31,46,61,0.45)] z-50 backdrop-filter-none" />
        <DialogPrimitive.Popup className="fixed right-0 top-0 z-50 w-[min(520px,100%)] h-full overflow-y-auto bg-[--color-paper] px-8.5 pt-8 pb-10 outline-none data-[state=open]:animate-[slide_0.28s_cubic-bezier(.2,.7,.2,1)] max-[520px]:px-5">
          {match && (
            <>
              <DialogTitle className="sr-only">
                {match.realtor.name} — Realtor Profile
              </DialogTitle>

              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    aria-label="Close"
                    className="absolute top-5 right-5.5 text-[30px] leading-none text-[--color-muted-brand] hover:text-[--color-ink] hover:bg-transparent h-auto w-auto p-0"
                  />
                }
              >
                ×
              </DialogClose>

              <div className="flex gap-4 items-start mt-2 mb-5.5">
                <span
                  className="text-[42px] w-18 h-18 shrink-0 grid place-items-center rounded-full bg-[--color-paper-deep]"
                  style={{ viewTransitionName: `realtor-photo-${match.realtor.id}` }}
                  aria-hidden="true"
                >
                  {match.realtor.photo}
                </span>
                <div>
                  <h2 className="font-(family-name:--font-display) text-[24px] m-0 mb-1 flex items-center gap-2 text-[--color-ink]">
                    {match.realtor.name}
                    {match.realtor.licenseVerified && (
                      <span
                        className="inline-grid place-items-center w-4.5 h-4.5 bg-[--color-sage] text-white rounded-full text-[11px] font-bold"
                        title="Verified license"
                      >
                        ✓
                      </span>
                    )}
                  </h2>
                  <p className="text-[14px] text-[--color-muted-brand] m-0 mb-2.5">
                    Serves {match.realtor.regions.slice(0, 3).join(', ')}
                    {match.realtor.regions.length > 3 ? ' +more' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.realtor.personality.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="h-auto rounded-full px-2.5 py-1 text-[12px] font-medium bg-[--color-paper-deep] text-[--color-ink-soft]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-auto">
                  <FitScore score={match.score} size={92} />
                </div>
              </div>

              <p className="text-[16px] text-[--color-ink-soft] leading-[1.6] m-0 mb-6">
                {match.realtor.bio}
              </p>

              <div className="grid grid-cols-2 gap-px mb-6 overflow-hidden rounded-[10px] border border-[--color-line] bg-[--color-line] max-[520px]:grid-cols-1">
                {[
                  { label: 'Experience', value: `${match.realtor.yearsExperience} years` },
                  { label: 'Homes sold', value: String(match.realtor.homesSold) },
                  { label: 'Commission', value: `${match.realtor.commissionRate}%` },
                  { label: 'Rating', value: match.realtor.reviewCount > 0 ? `★ ${match.realtor.rating} (${match.realtor.reviewCount})` : 'New — no reviews yet' },
                  { label: 'Avg response', value: `${match.realtor.avgResponseHours} hours` },
                  {
                    label: 'Works in',
                    value: `${usd(match.realtor.priceBand[0])}–${usd(match.realtor.priceBand[1])}`,
                  },
                  { label: 'Languages', value: match.realtor.languages.join(', ') },
                  {
                    label: 'Availability',
                    value: match.realtor.availableThisWeek ? 'This week' : 'Booking ahead',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white px-3.75 py-3.25 flex flex-col gap-0.5">
                    <span className="text-[12px] text-[--color-muted-brand]">{stat.label}</span>
                    <strong className="text-[15px] text-[--color-ink]">{stat.value}</strong>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[10px] p-5 mb-5.5 border border-[--color-line]">
                <h3 className="font-(family-name:--font-display) text-[18px] m-0 mb-3.5 text-[--color-ink]">
                  Why this is a {match.score}% fit for you
                </h3>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {match.reasons.map((r, i) => (
                    <li
                      key={i}
                      className={`text-[14px] flex gap-2.5 items-start ${
                        r.type === 'plus' ? 'text-[--color-ink]' : 'text-[--color-ink-soft]'
                      }`}
                    >
                      <span
                        className={`font-bold w-4 shrink-0 text-center ${
                          r.type === 'plus' ? 'text-[--color-sage]' : 'text-[--color-clay]'
                        }`}
                      >
                        {r.type === 'plus' ? '+' : '–'}
                      </span>
                      {r.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6.5">
                <span className="text-[12px] uppercase tracking-widest text-[--color-clay] font-semibold">
                  Recent deal
                </span>
                <p className="mt-1.5 mb-0 text-[15px] text-[--color-ink-soft] italic">
                  {match.realtor.recentDeal}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {buyerUserId ? (
                  <>
                    <Button
                      className="w-full rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-[--color-clay] text-white hover:bg-[--color-clay-deep] active:translate-y-px"
                      onClick={() => setShowMessages((v) => !v)}
                    >
                      {showMessages ? 'Hide messages' : `Message ${match.realtor.name.split(' ')[0]}`}
                    </Button>
                    {showMessages && (
                      <div className="bg-white rounded-2xl border border-[--color-line] p-4">
                        <MessageThread
                          buyerId={buyerUserId}
                          realtorId={match.realtor.id}
                          senderRole="buyer"
                          otherName={match.realtor.name.split(' ')[0]}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    className="w-full rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-[--color-clay] text-white opacity-60 cursor-default"
                    disabled
                  >
                    Sign in to message realtors
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-transparent border-[1.5px] border-[--color-line] text-[--color-ink] hover:border-[--color-clay] hover:text-[--color-clay-deep] hover:bg-transparent"
                  onClick={() => alert('Calendar booking is coming soon.')}
                >
                  Book an intro call
                </Button>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
