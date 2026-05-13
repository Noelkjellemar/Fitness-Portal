'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AddClientPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [coachId, setCoachId] = useState('')
  const [tier, setTier] = useState('elite')
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/coaches').then(r => r.json()).then(setCoaches).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, country, coachId: coachId || undefined, tier }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create client')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/admin/clients'), 1500)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-brand-bronze/[0.08] border border-brand-bronze/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-brand-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="heading-lg mb-2">Client Created</h2>
        <p className="text-sm text-brand-cream/40 font-body">
          {name} has been added. Temporary password: <strong className="text-brand-cream/70">welcome123</strong>
        </p>
      </motion.div>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-lg">
        <h1 className="heading-lg mb-2">Add New Client</h1>
        <p className="text-sm text-brand-cream/30 font-body mb-8">Create a client account. They&apos;ll receive a temporary password to log in.</p>

        <div className="apple-card-static p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-sm block mb-2">Full Name *</label>
              <input className="brand-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Johnson" required />
            </div>
            <div>
              <label className="label-sm block mb-2">Email Address *</label>
              <input className="brand-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" required />
            </div>
            <div>
              <label className="label-sm block mb-2">Country</label>
              <input className="brand-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Netherlands" />
            </div>
            <div>
              <label className="label-sm block mb-2">Assign to Coach</label>
              <select className="brand-input" value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                <option value="">Unassigned</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm block mb-2">Tier</label>
              <div className="flex gap-3">
                {['elite', 'community'].map((t) => (
                  <button key={t} type="button" onClick={() => setTier(t)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                      tier === t
                        ? 'bg-brand-bronze/[0.12] border border-brand-bronze/30 text-brand-bronze'
                        : 'bg-white/[0.04] border border-white/[0.08] text-brand-cream/40 hover:text-brand-cream/60 hover:border-white/[0.12]'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400 font-body">{error}</p>}

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Client'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>

        <div className="apple-card-static p-6 mt-8">
          <p className="text-xs text-brand-cream/30 font-body">
            The client will be created with temporary password <strong className="text-brand-cream/50">welcome123</strong>. Share the login URL and credentials with them.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
