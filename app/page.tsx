'use client'

import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Welcome from '@/components/Welcome'
import Login from '@/components/Login'
import ProfileWizard from '@/components/ProfileWizard'
import RealtorWizard from '@/components/RealtorWizard'
import Matches from '@/components/Matches'
import RealtorDetail from '@/components/RealtorDetail'
import type { BuyerProfile, MatchResult } from '@/lib/matching'
import { getBuyerProfile } from '@/lib/supabase/queries'

type View = 'welcome' | 'wizard' | 'matches' | 'realtor-wizard' | 'login'
type LoginIntent = 'none' | 'buyer-wizard' | 'realtor-wizard'

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
  const [loginIntent, setLoginIntent] = useState<LoginIntent>('none')
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null)
  const [selected, setSelected] = useState<MatchResult | null>(null)
  const [bgIndex, setBgIndex] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // On initial load — restore saved buyer profile if the user is already signed in
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user && !buyer) {
        const saved = await getBuyerProfile(user.id)
        if (saved) setBuyer(saved)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            onStart={async () => {
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                // Returning buyer — go straight to matches if they have a saved profile
                const saved = buyer ?? await getBuyerProfile(user.id)
                if (saved) {
                  setBuyer(saved)
                  setView('matches')
                } else {
                  setView('wizard')
                }
              } else {
                setLoginIntent('buyer-wizard')
                setView('login')
              }
            }}
            onRealtorStart={async () => {
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                setView('realtor-wizard')
              } else {
                setLoginIntent('realtor-wizard')
                setView('login')
              }
            }}
            onLogin={() => setView('login')}
          />
        )}

        {view === 'login' && (
          <Login
            initialRole={loginIntent === 'realtor-wizard' ? 'realtor' : 'buyer'}
            initialMode={loginIntent !== 'none' ? 'signup' : 'signin'}
            onBuyerLogin={async () => {
              setLoginIntent('none')
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                const saved = await getBuyerProfile(user.id)
                if (saved) {
                  setBuyer(saved)
                  setView('matches')
                } else {
                  setView('wizard')
                }
              } else {
                setView('wizard')
              }
            }}
            onRealtorLogin={() => {
              if (loginIntent === 'realtor-wizard') {
                setLoginIntent('none')
                setView('realtor-wizard')
              } else {
                setLoginIntent('none')
                router.push('/dashboard')
              }
            }}
            onBack={() => { setLoginIntent('none'); setView('welcome') }}
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
            }}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'matches' && buyer && (
          <Matches
            buyer={buyer}
            onView={handleView}
            onEdit={() => startVT(() => setView('wizard'))}
            onSignOut={() => {
              setBuyer(null)
              setUserId(null)
              startVT(() => setView('welcome'))
            }}
            selectedId={selected?.realtor.id ?? null}
            userId={userId ?? undefined}
          />
        )}

        <RealtorDetail match={selected} onClose={handleClose} buyerUserId={userId} />
      </main>
    </div>
  )
}
