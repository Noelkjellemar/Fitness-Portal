'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

type Client = {
  id: string
  name: string
  compliance: number
  status: string
  daysSinceCheckIn: number | null
  lastCheckIn: string | null
  createdAt: string
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

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((data) => {
      setClients(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const active = clients.filter((c) => c.status !== 'INACTIVE')
  const avgCompliance = active.length > 0
    ? Math.round(active.reduce((a: number, c: Client) => a + c.compliance, 0) / active.length)
    : 0
  const needsAttention = clients.filter((c) => c.status === 'NEEDS ATTENTION')
  const newThisWeek = clients.filter((c) => {
    if (!c.createdAt) return false
    return Date.now() - new Date(c.createdAt).getTime() < 7 * 86_400_000
  }).length

  const recentlyActive = [...clients]
    .filter((c) => c.lastCheckIn)
    .sort((a, b) => new Date(b.lastCheckIn!).getTime() - new Date(a.lastCheckIn!).getTime())
    .slice(0, 6)

  const stats = [
    { label: 'Total clients', value: clients.length },
    { label: 'Active', value: active.length },
    { label: 'Avg compliance', value: avgCompliance, suffix: '%' },
    { label: 'New this week', value: newThisWeek },
  ]

  return (
    <PageWrapper>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="label-sm mb-1">
          {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="font-headline font-bold text-3xl md:text-4xl text-brand-cream">Overview</h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="apple-card-static p-5"
          >
            <p className="label-sm mb-2">{s.label}</p>
            <p className="font-headline font-bold text-3xl text-brand-bronze stat-number">
              {loading ? <span className="text-brand-cream/30">—</span> : <AnimatedNumber value={s.value} suffix={s.suffix || ''} />}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Needs attention */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-md flex items-center gap-2">
              {needsAttention.length > 0 && <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />}
              Needs attention
            </h2>
            {needsAttention.length > 0 && (
              <span className="badge badge-warning">{needsAttention.length}</span>
            )}
          </div>
          {needsAttention.length === 0 ? (
            <div className="apple-card-static p-8 text-center">
              <p className="text-brand-cream/40 font-body text-sm">Everyone's on track.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {needsAttention.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/coach/clients/${c.id}`}
                  className="apple-card flex items-center justify-between p-4"
                >
                  <div>
                    <span className="font-headline font-semibold text-brand-cream">{c.name}</span>
                    <p className="text-xs text-brand-cream/45 font-body mt-0.5">
                      {c.daysSinceCheckIn !== null
                        ? `No check-in for ${c.daysSinceCheckIn} days`
                        : 'No check-ins yet'}
                    </p>
                  </div>
                  <span className="text-brand-bronze text-sm font-headline font-semibold">View →</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="heading-md mb-4">Recent activity</h2>
          {recentlyActive.length === 0 ? (
            <div className="apple-card-static p-8 text-center">
              <p className="text-brand-cream/40 font-body text-sm">No check-ins yet today.</p>
            </div>
          ) : (
            <div className="apple-card-static !p-0 overflow-hidden">
              {recentlyActive.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/coach/clients/${c.id}`}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                    i > 0 ? 'border-t border-white/[0.04]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-bronze/15 text-brand-bronze flex items-center justify-center font-headline font-bold text-sm">
                      {(c.name || '?')[0]}
                    </div>
                    <div>
                      <p className="font-headline font-medium text-sm text-brand-cream">{c.name}</p>
                      <p className="text-[11px] text-brand-cream/40 font-body">checked in · {timeAgo(c.lastCheckIn)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-cream/30">→</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="label-sm mb-4">Quick actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Add new client', href: '/admin/clients/new', icon: '+' },
            { label: 'View all clients', href: '/admin/clients', icon: '◆' },
            { label: 'Manage coaches', href: '/admin/coaches', icon: '◇' },
            { label: 'Content library', href: '/admin/library', icon: '▤' },
          ].map((a, i) => (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
            >
              <Link
                href={a.href}
                className="apple-card block p-6 group min-h-[120px] flex flex-col justify-between"
              >
                <span className="text-2xl text-brand-bronze group-hover:scale-110 transition-transform duration-200 inline-block">
                  {a.icon}
                </span>
                <span className="text-sm font-headline font-medium text-brand-cream/80 group-hover:text-brand-cream transition-colors">
                  {a.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
