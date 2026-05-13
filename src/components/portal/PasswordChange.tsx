'use client'

import { useState } from 'react'

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async () => {
    setMsg('')
    setIsError(false)

    if (!currentPassword || !newPassword) {
      setMsg('Please fill in all fields'); setIsError(true); return
    }
    if (newPassword.length < 8) {
      setMsg('New password must be at least 8 characters'); setIsError(true); return
    }
    if (newPassword !== confirmPassword) {
      setMsg('New passwords do not match'); setIsError(true); return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg('Password updated successfully')
        setIsError(false)
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      } else {
        setMsg(data.error || 'Failed to update password'); setIsError(true)
      }
    } catch {
      setMsg('Network error. Please try again.'); setIsError(true)
    }
    setSaving(false)
  }

  return (
    <div className="apple-card-static p-8">
      <h2 className="label-sm mb-6">Change Password</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-cream/50 mb-1.5">Current password</label>
          <input type="password" className="brand-input" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-cream/50 mb-1.5">New password</label>
          <input type="password" className="brand-input" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-cream/50 mb-1.5">Confirm new password</label>
          <input type="password" className="brand-input" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
        </div>
        {msg && <p className={`text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
        <button type="button" onClick={handleSubmit} disabled={saving} className="btn-secondary !text-sm">
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
