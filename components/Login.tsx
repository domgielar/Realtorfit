'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const GRADIENT = 'linear-gradient(to right, #f5a878, #8c3820)'
const GRADIENT_HOVER = 'linear-gradient(to right, #f09060, #7a2e18)'

type Role = 'buyer' | 'realtor'
type Mode = 'signin' | 'signup'

interface LoginProps {
  onBuyerLogin: () => void
  onRealtorLogin: () => void
  onBack: () => void
}

export default function Login({ onBuyerLogin, onRealtorLogin, onBack }: LoginProps) {
  const [role, setRole] = useState<Role>('buyer')
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        role === 'buyer' ? onBuyerLogin() : onRealtorLogin()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10 max-[520px]:p-5">
      <div className="bg-white rounded-2xl w-full max-w-md px-10 pt-9 pb-8 max-[520px]:px-5.5 shadow-card">

        <h1 className="font-(family-name:--font-display) text-[28px] font-semibold tracking-[-0.01em] mb-1 text-[--color-ink]">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-[15px] text-[--color-ink-soft] mb-7">
          {mode === 'signin'
            ? 'Sign in to your RealtorFit account.'
            : 'Join RealtorFit today.'}
        </p>

        {/* Role toggle */}
        <div className="flex gap-2 mb-7 p-1 bg-[--color-paper] rounded-xl">
          {(['buyer', 'realtor'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 capitalize ${
                role === r
                  ? 'text-white shadow-sm'
                  : 'text-[--color-ink-soft] hover:text-[--color-ink]'
              }`}
              style={role === r ? { backgroundImage: GRADIENT } : undefined}
            >
              {r === 'buyer' ? "I'm a buyer" : "I'm a realtor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[--color-ink]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-3.5 py-2.5 border-[1.5px] border-[--color-line] rounded-lg bg-[--color-paper] text-[14px] text-[--color-ink] placeholder:text-[--color-muted] outline-none focus:border-[--color-clay] transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[--color-ink]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3.5 py-2.5 border-[1.5px] border-[--color-line] rounded-lg bg-[--color-paper] text-[14px] text-[--color-ink] placeholder:text-[--color-muted] outline-none focus:border-[--color-clay] transition-colors"
            />
          </label>

          {error && (
            <p className="text-[13px] text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-[13px] text-[--color-sage] font-medium">{success}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="rounded-full px-5.5 py-2.75 h-auto text-[15px] font-semibold text-white! mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundImage: GRADIENT }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.backgroundImage = GRADIENT_HOVER
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundImage = GRADIENT
            }}
          >
            {loading
              ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
              : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <Separator className="my-6 bg-[--color-line]" />

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] text-[--color-muted] hover:text-[--color-ink] transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={switchMode}
            className="text-[14px] text-[--color-clay] hover:text-[--color-clay-deep] font-medium transition-colors"
          >
            {mode === 'signin' ? 'Create account →' : 'Sign in instead →'}
          </button>
        </div>

      </div>
    </div>
  )
}
