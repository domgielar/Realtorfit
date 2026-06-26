'use client'

import { Badge } from '@/components/ui/badge'

interface FitScoreProps {
  score: number
  size?: number
  showLabel?: boolean
}

type Tier = { label: string; key: 'gold' | 'sage' | 'clay' | 'muted' }

function tier(score: number): Tier {
  if (score >= 85) return { label: 'Excellent fit', key: 'gold' }
  if (score >= 70) return { label: 'Strong fit',   key: 'sage' }
  if (score >= 50) return { label: 'Decent fit',   key: 'clay' }
  return              { label: 'Loose fit',     key: 'muted' }
}

const tierColor: Record<Tier['key'], string> = {
  gold:  'var(--color-gold)',
  sage:  'var(--color-sage)',
  clay:  'var(--color-clay)',
  muted: 'var(--color-muted-brand)',
}

export default function FitScore({ score, size = 84, showLabel = true }: FitScoreProps) {
  const stroke = size > 70 ? 7 : 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const { label, key } = tier(score)
  const color = tierColor[key]

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <svg width={size} height={size} role="img" aria-label={`${score} percent fit`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ring-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-800 ease-[cubic-bezier(.2,.7,.2,1)]"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={size > 70 ? 22 : 17}
          fontFamily="var(--font-display)"
          fontWeight={600}
          fill="var(--color-ink)"
        >
          {score}
          <tspan fontSize={size > 70 ? 11 : 9} dy="-6">%</tspan>
        </text>
      </svg>
      {showLabel && (
        <Badge
          data-tier={key}
          variant="outline"
          className="h-auto rounded-full px-2.5 py-0.75 text-[11px] font-semibold
            data-[tier=gold]:border-[--color-gold] data-[tier=gold]:text-[--color-gold]
            data-[tier=sage]:border-[--color-sage] data-[tier=sage]:text-[--color-sage]
            data-[tier=clay]:border-[--color-clay] data-[tier=clay]:text-[--color-clay]
            data-[tier=muted]:border-[--color-muted-brand] data-[tier=muted]:text-[--color-muted-brand]"
        >
          {label}
        </Badge>
      )}
    </div>
  )
}
