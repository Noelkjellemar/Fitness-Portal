'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'
import ComplianceHeatmap from '@/components/coach/ComplianceHeatmap'
import { motion } from 'framer-motion'

type Client = {
  id: string
  name: string
  compliance: number
  status: string
  lastCheckIn: string | null
  daysSinceCheckIn: number | null
  tier: string
}
type HeatmapRow = { id: string; name: string; checkIns: { date: string; trained: boolean }[] }

const statusBadge: Record<string, string> = {
  'ON TRACK': 'badge badge-success',
  'NEEDS ATTENTION': 'badge badge-warning',
  INACTIVE: 'badge badge-neutral',
  NEW: 'badge badge-bronze',
}

function Sparkline({ days }: { days: { trained: boolean }[] }) {
  if (!days.length) return <span className="text-xs text-brand-cream/30">—</span>
  return (
    <div className="flex items-end gap-0.5 h-5">
      {days.map((d, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${d.trained ? 'bg-brand-bronze h-full' : 'bg-brand-bronze/20 h-1/3'}`}
        />
      ))}
    </div>
  )
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur = 900
    let raf: number
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span>{n}{suffix}</span>
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [heatmap, setHeatmap] = useState<HeatmapRow[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((data) => {
      setClients(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
    fetch('/api/coach/heatmap').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setHeatmap(data)
    }).catch(() => {})
  }, [])

  const sparkByClient = useMemo(() => {
    const map: Record<string, { date: string; trained: boolean }[]> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const c of heatmap) {
      const idx = new Map<string, boolean>()
      for (const ci of c.checkIns) {
        const k = new Date(ci.date).toISOString().slice(0, 10)
        idx.set(k, ci.trained || idx.get(k) === true)
      }
      map[c.id] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today.getTime() - (6 - i) * 86_400_000).toISOString().slice(0, 10)
        return { date: d, trained: idx.get(d) === true }
      })
    }
    return map
  }, [heatmap])

  const formatDate = (d: string | null) => {
    if (!d) return 'Never'
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  const active = clients.filter((c) => c.status !== 'INACTIVE')
  const avgCompliance = active.length > 0
    ? Math.round(active.reduce((a, c) => a + c.compliance, 0) / active.length)
    : 0
  const needsAttention = clients.filter((c) => c.status === 'NEEDS ATTENTION').length

  const stats = [
    { key: 'ALL', label: 'Total', value: clients.length },
    { key: 'ON TRACK', label: 'Active', value: active.length },
    { key: 'NEEDS ATTENTION', label: 'Needs attention', value: needsAttention },
    { key: 'COMPLIANCE', label: 'Avg compliance', value: avgCompliance, suffix: '%' },
  ]

  const filtered = clients.filter((c) => {
    if (filter !== 'ALL' && filter !== 'COMPLIANCE' && c.status !== filter) return false
    if (search && !(c.name || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="label-sm mb-1">{new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="font-headline font-bold text-3xl md:text-4xl text-brand-cream">Your clients</h1>
        </div>
        <Link href="/admin/clients/new" className="btn-primary">+ Add client</Link>
      </div>

      {/* Stat cards — clickable filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s, i) => {
          const isActive = filter === s.key
          const clickable = s.key !== 'COMPLIANCE'
          return (
            <motion.button
              key={s.label}
              type="button"
              onClick={() => clickable && setFilter(isActive ? 'ALL' : s.key)}
              disabled={!clickable}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`apple-card text-left p-5 ${isActive ? '!border-brand-bronze/50 !bg-brand-bronze/[0.06]' : ''} ${!clickable ? 'cursor-default' : ''}`}
            >
              <p className="label-sm mb-2">{s.label}</p>
              <p className="font-headline font-bold text-3xl text-brand-bronze stat-number">
                <AnimatedNumber value={s.value} suffix={s.suffix || ''} />
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Compliance heatmap */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-md">Compliance — last 28 days</h2>
          <span className="label-sm">trained · logged · missed</span>
        </div>
        <ComplianceHeatmap clients={heatmap} />
      </div>

      {/* Search + table */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="brand-input sm:max-w-xs"
        />
        {filter !== 'ALL' && filter !== 'COMPLIANCE' && (
          <button type="button" onClick={() => setFilter('ALL')} className="btn-secondary !py-2.5 !text-xs">
            Clear filter: {filter} ×
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="apple-card-static animate-pulse h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="apple-card-static p-12 text-center">
          <p className="text-brand-cream/40 font-body">No clients match your filter.</p>
        </div>
      ) : (
        <div className="apple-card-static !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="apple-table">
              <thead>
                <tr>
                  <th className="text-left">Client</th>
                  <th className="text-center hidden md:table-cell">Last 7 days</th>
                  <th className="text-center hidden sm:table-cell">Last check-in</th>
                  <th className="text-center hidden md:table-cell">Compliance</th>
                  <th className="text-center">Status</th>
                  <th className="text-right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  >
                    <td>
                      <Link
                        href={`/coach/clients/${c.id}`}
                        className="font-headline font-semibold hover:text-brand-bronze transition-colors block"
                      >
                        {c.name || 'Unnamed'}
                      </Link>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex justify-center">
                        <Sparkline days={sparkByClient[c.id] || []} />
                      </div>
                    </td>
                    <td className="text-center text-brand-cream/55 hidden sm:table-cell text-sm">
                      {formatDate(c.lastCheckIn)}
                    </td>
                    <td className="text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-white/[0.06] rounded-full h-1.5">
                          <div
                            className="bg-brand-bronze h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${c.compliance}%` }}
                          />
                        </div>
                        <span className="text-xs text-brand-cream/55 stat-number">{c.compliance}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={statusBadge[c.status] || 'badge badge-neutral'}>{c.status}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/coach/clients/${c.id}`}
                        className="text-xs text-brand-bronze hover:opacity-80 transition-opacity font-headline font-semibold"
                      >
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
