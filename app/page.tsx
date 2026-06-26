'use client'

import { useState, useEffect } from 'react'
import Welcome from '@/components/Welcome'
import ProfileWizard from '@/components/ProfileWizard'
import Matches from '@/components/Matches'
import RealtorDetail from '@/components/RealtorDetail'
import type { BuyerProfile, MatchResult } from '@/lib/matching'

type View = 'welcome' | 'wizard' | 'matches'

const HOUSE_IMAGES = [
  '/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg',
  '/dillon-kydd-2keCPb73aQY-unsplash.jpg',
  '/johnson-U6Q6zVDgmSs-unsplash.jpg',
  '/webaliser-_TPTXZd9mOo-unsplash.jpg',
  '/dillon-kydd-XGvwt544g8k-unsplash.jpg',
]

export default function Home() {
  const [view, setView] = useState<View>('welcome')
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null)
  const [selected, setSelected] = useState<MatchResult | null>(null)
  const [bgIndex, setBgIndex] = useState(() =>
    Math.floor(Math.random() * HOUSE_IMAGES.length)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HOUSE_IMAGES.length)
    }, 20000)
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
        {view === 'welcome' && <Welcome onStart={() => setView('wizard')} />}

        {view === 'wizard' && (
          <ProfileWizard
            onComplete={(profile) => {
              setBuyer(profile)
              setView('matches')
            }}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'matches' && buyer && (
          <Matches buyer={buyer} onView={setSelected} onEdit={() => setView('wizard')} />
        )}

        <RealtorDetail match={selected} onClose={() => setSelected(null)} />
      </main>
    </div>
  )
}
