import { Button } from '@/components/ui/button'

const GRADIENT = 'linear-gradient(to right, #f5a878, #8c3820)'
const GRADIENT_HOVER = 'linear-gradient(to right, #f09060, #7a2e18)'

interface WelcomeProps {
  onStart: () => void
  onRealtorStart: () => void
}

function HeroButton({
  title,
  subtitle,
  onClick,
}: {
  title: string
  subtitle: string
  onClick?: () => void
}) {
  return (
    <Button
      onClick={onClick}
      className="group relative rounded-2xl px-9 py-6 h-auto font-semibold text-white! shadow-[0_8px_32px_rgba(140,56,32,0.45)] border border-white/20! active:scale-[0.98] transition-transform duration-100 overflow-hidden min-w-64"
      style={{ backgroundImage: GRADIENT }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.backgroundImage = GRADIENT_HOVER
        el.style.boxShadow = '0 12px 40px rgba(140,56,32,0.65)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.backgroundImage = GRADIENT
        el.style.boxShadow = '0 8px 32px rgba(140,56,32,0.45)'
      }}
    >
      {/* Shine sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]" />

      <span className="relative flex flex-col items-start gap-1">
        <span className="font-(family-name:--font-display) text-[20px] font-semibold tracking-[-0.01em] leading-tight">
          {title}
        </span>
        <span className="font-sans text-[12px] font-normal tracking-[0.06em] uppercase opacity-80">
          {subtitle}
        </span>
      </span>
    </Button>
  )
}

export default function Welcome({ onStart, onRealtorStart }: WelcomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 pt-16 pb-20 text-center">
      <header className="flex items-baseline gap-3 mb-10">
        <span
          className="font-(family-name:--font-display) text-2xl font-semibold tracking-[-0.01em] bg-clip-text text-transparent"
          style={{ backgroundImage: GRADIENT }}
        >
          RealtorFit
        </span>
        <span className="text-[13px] text-white/70">for homebuyers</span>
      </header>

      <h1
        className="font-(family-name:--font-display) font-semibold tracking-[-0.02em] leading-[1.04] m-0 mb-12 text-[clamp(38px,6vw,62px)] max-w-3xl bg-clip-text text-transparent"
        style={{ backgroundImage: GRADIENT }}
      >
        Find the realtor that fits your{' '}
        <span className="italic">budget, goals, and style.</span>
      </h1>

      <div className="flex flex-wrap justify-center gap-5">
        <HeroButton
          title="Build your buyer profile"
          subtitle="Find the right agent for you"
          onClick={onStart}
        />
        <HeroButton
          title="Sell to every client"
          subtitle="List your profile as a realtor"
          onClick={onRealtorStart}
        />
      </div>
    </div>
  )
}
