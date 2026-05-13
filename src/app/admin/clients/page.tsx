'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

type Client = {
  id: string; name: string; email: string; country: string | null;
  coach: { id: string; name: string } | null; tier: string;
  compliance: number; status: string; lastCheckIn: string | null;
  daysSinceCheckIn: number | null; onboardingStatus: string;
}

const statusBadge: Record<string, string> = {
  'ON TRACK': 'badge badge-success',
  'NEEDS ATTENTION': 'badge badge-warning',
  'INACTIVE': 'badge badge-neutral',
  'NEW': 'badge badge-bronze',
}

export default function AllClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => {
      setClients(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will permanently remove all their data.`)) return
    try {
      const res = await fetch(`/api/clients/${id}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) setClients(clients.filter(c => c.id !== id))
      else alert('Error: ' + (data.error || 'Failed to delete'))
    } catch { alert('Failed to delete client') }
  }

  const filtered = clients.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string | null) => {
    if (!d) return 'Never'
    const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">All Clients</h1>
        <Link href="/admin/clients/new" className="btn-primary">+ Add Client</Link>
      </div>

      <div className="mb-8">
        <input
          className="brand-input w-full md:w-80"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="apple-card-static animate-pulse h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="apple-card-static p-12 text-center">
          <p className="text-brand-cream/30 font-body">No clients found.</p>
          <Link href="/admin/clients/new" className="btn-primary text-sm mt-4 inline-flex">+ Add Your First Client</Link>
        </div>
      ) : (
        <div className="apple-card-static p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="apple-table">
              <thead>
                <tr>
                  <th className="text-left">Client</th>
                  <th className="text-left hidden md:table-cell">Coach</th>
                  <th className="text-center hidden sm:table-cell">Tier</th>
                  <th className="text-center hidden lg:table-cell">Compliance</th>
                  <th className="text-center hidden sm:table-cell">Last Check-in</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="group">
                    <td>
                      <Link href={`/coach/clients/${c.id}`} className="block">
                        <span className="font-headline font-semibold group-hover:text-brand-bronze transition-colors">{c.name || 'Unnamed'}</span>
                        <span className="block text-xs text-brand-cream/30 mt-0.5">{c.email}</span>
                      </Link>
                    </td>
                    <td className="text-brand-cream/40 hidden md:table-cell">{c.coach?.name || '—'}</td>
                    <td className="text-center hidden sm:table-cell">
                      <span className={`badge ${c.tier === 'elite' ? 'badge-bronze' : c.tier === 'unassigned' ? 'badge-danger' : 'badge-neutral'}`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-white/[0.06] rounded-full h-1.5">
                          <div className="bg-brand-bronze h-1.5 rounded-full" style={{ width: `${c.compliance}%` }} />
                        </div>
                        <span className="text-xs text-brand-cream/40">{c.compliance}%</span>
                      </div>
                    </td>
                    <td className="text-center text-brand-cream/40 text-xs hidden sm:table-cell">{formatDate(c.lastCheckIn)}</td>
                    <td className="text-center">
                      <span className={statusBadge[c.status] || statusBadge['INACTIVE']}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteClient(c.id, c.name || c.email) }}
                        className="text-xs text-red-400/40 hover:text-red-400 font-headline font-semibold transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
