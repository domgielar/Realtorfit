'use client'

import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import Welcome from '@/components/Welcome'
import Login from '@/components/Login'
import ProfileWizard from '@/components/ProfileWizard'
import RealtorWizard from '@/components/RealtorWizard'
import Matches from '@/components/Matches'
import RealtorDetail from '@/components/RealtorDetail'
import type { BuyerProfile, MatchResult } from '@/lib/matching'

type View = 'welcome' | 'wizard' | 'matches' | 'realtor-wizard' | 'login'

const HOUSE_IMAGES = [
  '/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  '/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  '/johnson-U6Q6zVDgmSs-unsplash.jpg',
  '/webaliser-_TPTXZd9mOo-unsplash.jpg',
  '/dillon-kydd-XGvwt544g8k-unsplash.jpg',
]

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<View>('welcome')
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null)
  const [selected, setSelected] = useState<MatchResult | null>(null)
  const [bgIndex, setBgIndex] = useState(0)

  const startVT = (cb: () => void) => {
    if ('startViewTransition' in document) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(document as any).startViewTransition(() => flushSync(cb))
    } else {
      cb()
    }
  }

  const handleView = (match: MatchResult) => startVT(() => setSelected(match))
  const handleClose = () => startVT(() => setSelected(null))

  useEffect(() => {
    setBgIndex(Math.floor(Math.random() * HOUSE_IMAGES.length))
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HOUSE_IMAGES.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-screen isolate">
      {/* Background house photos — crossfade every 20 s */}
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
      {/* Clay gradient overlay — fades from right to left */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 mix-blend-multiply"
        style={{
          background:
            'linear-gradient(to left, rgba(189,93,61,0.82) 0%, rgba(189,93,61,0.58) 22%, rgba(189,93,61,0.28) 52%, rgba(189,93,61,0.08) 78%, rgba(189,93,61,0.02) 100%)',
        }}
      />

      <main className="relative min-h-screen text-[--color-ink]">
        {view === 'welcome' && (
          <Welcome
            onStart={() => setView('wizard')}
            onRealtorStart={() => setView('realtor-wizard')}
            onLogin={() => setView('login')}
          />
        )}

        {view === 'login' && (
          <Login
            onBuyerLogin={() => setView('wizard')}
            onRealtorLogin={() => router.push('/dashboard')}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'realtor-wizard' && (
          <RealtorWizard
            onComplete={() => setView('welcome')}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'wizard' && (
          <ProfileWizard
            onComplete={(profile) => {
              setBuyer(profile)
              setView('matches')
              fetch('/api/buyer-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
              }).catch(() => {/* non-critical — don't surface to the buyer */})
            }}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'matches' && buyer && (
          <Matches
            buyer={buyer}
            onView={handleView}
            onEdit={() => setView('wizard')}
            selectedId={selected?.realtor.id ?? null}
          />
        )}

        <RealtorDetail match={selected} onClose={handleClose} />
      </main>
    </div>
  )
}
