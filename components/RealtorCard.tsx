import type { MatchResult } from '@/lib/matching'
import FitScore from './FitScore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface RealtorCardProps {
  match: MatchResult
  onView: (match: MatchResult) => void
}

export default function RealtorCard({ match, onView }: RealtorCardProps) {
  const { realtor, score, reasons } = match
  const topReasons = reasons.filter((r) => r.type === 'plus').slice(0, 3)

  return (
    <Card className="bg-white rounded-2xl border border-[--color-line] p-5.5 flex flex-col transition-[transform,box-shadow] duration-160 ease-linear hover:-translate-y-0.75 shadow-card hover:shadow-card-hover ring-0 gap-0 py-0 overflow-visible">
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3">
          <span
            className="text-[30px] w-13 h-13 shrink-0 grid place-items-center rounded-full bg-[--color-paper-deep]"
            aria-hidden="true"
          >
            {realtor.photo}
          </span>
          <div>
            <h3 className="text-[18px] m-0 mb-0.75 flex items-center gap-1.75 text-[--color-ink]">
              {realtor.name}
              {realtor.licenseVerified && (
                <span
                  className="inline-grid place-items-center w-4.5 h-4.5 bg-[--color-sage] text-white rounded-full text-[11px] font-bold"
                  title="Verified license"
                >
                  ✓
                </span>
              )}
            </h3>
            <p className="text-[13px] text-[--color-muted-brand] m-0">
              {realtor.yearsExperience} yrs · {realtor.homesSold} sold ·{' '}
              ★ {realtor.rating} ({realtor.reviewCount})
            </p>
          </div>
        </div>
        <FitScore score={score} size={76} showLabel={false} />
      </div>

      <ul className="list-none p-0 m-0 my-4 flex flex-col gap-1.75">
        {topReasons.map((r, i) => (
          <li key={i} className="text-[14px] text-[--color-ink-soft] pl-5 relative">
            <span className="absolute left-1 text-[--color-sage] font-bold">+</span>
            {r.text}
          </li>
        ))}
      </ul>

      <Separator className="bg-[--color-line]" />
      <div className="flex flex-wrap gap-3.5 text-[13px] text-[--color-muted-brand] py-3.5">
        <span>
          <strong className="text-[--color-ink]">{realtor.commissionRate}%</strong> commission
        </span>
        <span>
          <strong className="text-[--color-ink]">{realtor.avgResponseHours}h</strong> avg reply
        </span>
        <span
          className={
            realtor.availableThisWeek
              ? 'text-[--color-sage] font-semibold'
              : 'text-[--color-muted-brand]'
          }
        >
          {realtor.availableThisWeek ? 'Available this week' : 'Booking ahead'}
        </span>
      </div>

      <Button
        variant="outline"
        className="mt-auto rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold bg-transparent border-[1.5px] border-[--color-line] text-[--color-ink] hover:border-[--color-clay] hover:text-[--color-clay-deep] hover:bg-transparent"
        onClick={() => onView(match)}
      >
        View profile & why it&apos;s a {score}% fit
      </Button>
    </Card>
  )
}
