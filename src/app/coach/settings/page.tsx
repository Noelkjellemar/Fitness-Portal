'use client'

import { useEffect, useState } from 'react'
import PageWrapper from '@/components/portal/PageWrapper'
import PasswordChange from '@/components/portal/PasswordChange'

export default function CoachSettings() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.name) setName(data.name)
      if (data.email) setEmail(data.email)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      setMsg(data.success ? 'Saved!' : (data.error || 'Failed to save'))
    } catch {
      setMsg('Network error.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-lg">
          <div className="apple-card-static animate-pulse h-48" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-lg">
        <h1 className="heading-lg mb-8">Settings</h1>
        <div className="space-y-8">
          <div className="apple-card-static p-8">
            <h2 className="heading-md mb-6">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="label-sm mb-1.5 block">Name</label>
                <input className="brand-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label-sm mb-1.5 block">Email</label>
                <input className="brand-input" value={email} disabled />
              </div>
            </div>
          </div>

          <PasswordChange />

          {msg && (
            <p className={`text-sm font-body ${msg.includes('error') || msg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
