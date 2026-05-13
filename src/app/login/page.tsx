'use client'

import React, { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'password') {
      setTimeout(() => passwordRef.current?.focus(), 400)
    }
  }, [step])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setError(''); setStep('password') }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', { email, password, redirect: false })

    if (res?.error) {
      setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
      setLoading(false)
      return
    }

    setStep('success')
    const session = await fetch('/api/auth/session').then(r => r.json())
    const role = session?.user?.role

    setTimeout(() => {
      if (role === 'main-coach') router.push('/admin/dashboard')
      else if (role === 'coach') router.push('/coach/dashboard')
      else router.push('/client/dashboard')
    }, 1500)
  }

  return (
    <AuroraBackground className="min-h-screen w-full" showRadialGradient={true}>
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Logo */}
        <div className="flex items-center justify-center pt-12 pb-4">
          <div className="font-headline font-bold text-sm tracking-[0.3em] uppercase">
            <span className="text-gradient-bronze">Zenith</span>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-6">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-10 text-center"
                >
                  <div className="space-y-3">
                    <h1 className="heading-xl text-brand-cream">Enter The Protocol</h1>
                    <p className="text-lg text-brand-cream/35 font-light">Your transformation starts here</p>
                  </div>

                  <form onSubmit={handleEmailSubmit}>
                    <div className="relative">
                      <input
                        type="email" placeholder="your@email.com" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.04] text-brand-cream border border-white/[0.08] rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:border-brand-bronze/40 text-center text-sm transition-all duration-200"
                        required
                      />
                      <button type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-brand-bronze/20 transition-all duration-200 text-brand-bronze">
                        →
                      </button>
                    </div>
                  </form>

                  <p className="text-xs text-brand-cream/15">
                    First time? Your coach will send you an invite with your credentials.
                  </p>
                </motion.div>
              )}

              {step === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-10 text-center"
                >
                  <div className="space-y-3">
                    <h1 className="heading-xl text-brand-cream">Welcome back</h1>
                    <p className="text-sm text-brand-cream/35">{email}</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.04] text-brand-cream border border-white/[0.08] rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:border-brand-bronze/40 text-center text-sm transition-all duration-200"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-brand-cream/30 hover:text-brand-cream/50 transition-colors">
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400/80">{error}</motion.p>
                    )}

                    <div className="flex w-full gap-3 pt-2">
                      <button type="button"
                        onClick={() => { setStep('email'); setPassword(''); setError('') }}
                        className="btn-secondary !px-6">
                        Back
                      </button>
                      <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? 'Authenticating...' : 'Enter'}
                      </button>
                    </div>
                  </form>

                  <p className="text-xs text-brand-cream/15">Forgot your password? Contact your coach.</p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-3">
                    <h1 className="heading-xl text-brand-cream">You&apos;re in.</h1>
                    <p className="text-brand-cream/35 font-light font-accent italic text-lg">The protocol is active</p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="py-6"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-brand-bronze to-brand-bronze flex items-center justify-center">
                      <svg className="h-8 w-8 text-brand-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>

                  <p className="text-sm text-brand-cream/25">Redirecting to your portal...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-[11px] text-brand-cream/10 tracking-wider">
            &copy; {new Date().getFullYear()} Zenith
          </p>
        </div>
      </div>
    </AuroraBackground>
  )
}
