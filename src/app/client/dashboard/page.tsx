'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

type CheckIn = { date: string; trained: boolean; mood: number | null; energy: number | null; weightKg: number | null }
type MeData = {
  name: string
  week: number
  phase: number
  phaseLabel: string
  stalled: boolean
  compliance28d: number
  recentCheckIns: CheckIn[]
  measurements: { weightKg: number | null; date: string }[]
}

function streakOf(checkIns: CheckIn[]): number {
  if (!checkIns.length) return 0
  const days = new Set(checkIns.map((c) => new Date(c.date).toISOString().slice(0, 10)))
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
    if (days.has(d)) streak++
    else if (i === 0) continue
    else break
  }
  return streak
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 56
  const c = 2 * Math.PI * r
  const offset = c - (progress / 100) * c
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} stroke="rgba(177,156,217,0.15)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          stroke="#B19CD9"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(177,156,217,0.4))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline font-bold text-3xl text-brand-cream">{progress}%</span>
        <span className="text-[10px] text-brand-cream/40 uppercase tracking-wider mt-0.5">complete</span>
      </div>
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

export default function ClientDashboard() {
  const [data, setData] = useState<MeData | null>(null)

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then(setData).catch(() => {})
  }, [])

  const name = data?.name || 'Athlete'
  const week = data?.week || 1
  const phase = data?.phase || 1
  const phaseLabel = data?.phaseLabel || 'Reset'
  const stalled = data?.stalled || false
  const progress = Math.round((week / 16) * 100)

  const checkIns = data?.recentCheckIns || []
  const streak = streakOf(checkIns)
  const loggedToday = checkIns.some((c) => new Date(c.date).toISOString().slice(0, 10) === todayKey())
  const lastWeight =
    data?.measurements?.find((m) => m.weightKg !== null)?.weightKg ||
    checkIns.find((c) => c.weightKg !== null)?.weightKg ||
    null
  const moodSamples = checkIns.filter((c) => c.mood !== null).slice(0, 7)
  const avgMood = moodSamples.length
    ? +(moodSamples.reduce((s, c) => s + (c.mood || 0), 0) / moodSamples.length).toFixed(1)
    : null
  const compliance = data?.compliance28d ?? 0

  const quickActions = [
    { label: "Log today's training", href: '/client/log', icon: '✎', accent: !loggedToday },
    { label: "Today's meals", href: '/client/plans/nutrition', icon: '◆' },
    { label: "Today's workout", href: '/client/plans/workout', icon: '◇' },
    { label: 'Track progress', href: '/client/progress', icon: '◉' },
  ]

  return (
    <PageWrapper>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="apple-card-static p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-bronze/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="label-sm mb-1">Welcome back</p>
            <h1 className="font-headline font-bold text-3xl md:text-4xl text-brand-cream mb-3">{name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-bronze !text-xs">Week {week} of 16</span>
              <span className="badge badge-neutral !text-xs">Phase {phase} · {phaseLabel}</span>
              {stalled && <span className="badge badge-warning !text-[10px]">Phase hold — compliance &lt; 80%</span>}
            </div>
          </div>
          <ProgressRing progress={progress} />
        </div>
      </motion.div>

      {/* Today's status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-8"
      >
        <Link
          href="/client/log"
          className={`block apple-card p-5 ${
            loggedToday ? '!border-green-400/30' : '!border-brand-bronze/40'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                loggedToday ? 'bg-green-400/15 text-green-400' : 'bg-brand-bronze/15 text-brand-bronze'
              }`}
            >
              {loggedToday ? '✓' : '✎'}
            </div>
            <div className="flex-1">
              <p className="font-headline font-semibold text-base text-brand-cream">
                {loggedToday ? "Today's check-in is logged" : 'Log your day'}
              </p>
              <p className="text-sm text-brand-cream/55 font-body mt-0.5">
                {loggedToday ? 'Nice. Your coach has the latest.' : 'Takes 2 minutes — your coach reviews these before every call.'}
              </p>
            </div>
            <span className="text-brand-bronze text-xl">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Day streak', value: streak, suffix: 'd' },
          { label: 'Compliance', value: compliance, suffix: '%' },
          { label: 'Avg mood', value: avgMood !== null ? avgMood : null, suffix: '/10', static: true },
          { label: 'Last weight', value: lastWeight, suffix: 'kg', static: true },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
            className="apple-card-static p-5"
          >
            <p className="label-sm mb-2">{s.label}</p>
            <p className="font-headline font-bold text-2xl text-brand-bronze stat-number">
              {s.value === null || s.value === undefined ? (
                <span className="text-brand-cream/30">—</span>
              ) : s.static ? (
                <>{s.value}{s.suffix}</>
              ) : (
                <><AnimatedNumber value={s.value as number} />{s.suffix}</>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <p className="label-sm mb-4">Quick actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.4 }}
            >
              <Link
                href={a.href}
                className={`apple-card block p-6 group min-h-[120px] flex flex-col justify-between ${
                  a.accent ? '!border-brand-bronze/40 !bg-brand-bronze/[0.05]' : ''
                }`}
              >
                <span className="text-2xl text-brand-bronze group-hover:scale-110 transition-transform duration-200 inline-block">
                  {a.icon}
                </span>
                <span className="text-sm font-headline font-medium text-brand-cream/80 group-hover:text-brand-cream transition-colors leading-snug">
                  {a.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly check-in call */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="apple-card-static p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="label-sm text-brand-bronze">Weekly check-in call</h3>
          <span className="text-[10px] text-brand-cream/30 font-body">~30 min</span>
        </div>
        <p className="label-sm font-body mb-4 text-brand-cream/50">
          Book your weekly call with your coach to review progress and adjust your protocol.
        </p>
        <iframe
          src="https://cal.com/zenith/check-in-call?embed=true&theme=dark&brandColor=B19CD9"
          className="w-full h-[640px] rounded-2xl border border-white/[0.06]"
          loading="lazy"
          title="Book check-in call"
        />
      </motion.div>
    </PageWrapper>
  )
}
