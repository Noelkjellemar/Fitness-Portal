'use client'

import { useEffect, useState } from 'react'
import PasswordChange from '@/components/portal/PasswordChange'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.name) setName(data.name)
      if (data.email) setEmail(data.email)
      if (data.country) setCountry(data.country)
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
        body: JSON.stringify({ name, country }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg('Settings saved!')
      } else {
        setMsg(data.error || 'Failed to save')
      }
    } catch {
      setMsg('Network error. Please try again.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="apple-card-static p-8 animate-pulse h-48" />
      </div>
    )
  }

  return (
    <div className="max-w-lg py-16">
      <h1 className="heading-lg mb-8">Settings</h1>
      <div className="space-y-8">
        <div className="apple-card-static p-8">
          <h2 className="label-sm mb-5 text-brand-cream/60">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="label-sm mb-1">Name</label>
              <input className="brand-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label-sm mb-1">Email</label>
              <input className="brand-input" value={email} disabled />
            </div>
            <div>
              <label className="label-sm mb-1">Country</label>
              <input className="brand-input" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="apple-card-static p-8">
          <h2 className="label-sm mb-5 text-brand-cream/60">Preferences</h2>
          <div className="space-y-3">
            <div>
              <label className="label-sm mb-1">Units</label>
              <select className="brand-input">
                <option>Metric (kg, cm)</option>
                <option>Imperial (lbs, in)</option>
              </select>
            </div>
            <div>
              <label className="label-sm mb-1">Check-in reminder</label>
              <select className="brand-input">
                <option>Daily at 20:00</option>
                <option>Daily at 21:00</option>
                <option>Off</option>
              </select>
            </div>
          </div>
        </div>

        <PasswordChange />

        {msg && (
          <p className={`text-sm font-body ${msg.includes('error') || msg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
            {msg}
          </p>
        )}

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
