'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'

type ClientData = {
  id: string; name: string; email: string; country: string | null;
  coach: { name: string } | null; tier: string;
  stats: {
    trainedDays: number; totalCheckIns: number; avgMood: number | null;
    avgEnergy: number | null; avgSleep: number | null;
    nutritionCompliance: number; streakDays: number;
  };
  moodTrend: { date: string; mood: number | null; energy: number | null; trained: boolean; nutrition: string | null; sleep: number | null }[];
  redFlags: string[];
  wins: string[];
  recentCheckIns: any[];
  onboarding: any;
}

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'precall' | 'checkins' | 'onboarding'>('precall')
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [onboardingSending, setOnboardingSending] = useState(false)
  const [onboardingSent, setOnboardingSent] = useState(false)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [plansGenerating, setPlansGenerating] = useState(false)
  const [plansGenerated, setPlansGenerated] = useState(false)
  const [planStatus, setPlanStatus] = useState('')
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [planNotes, setPlanNotes] = useState('')
  const [planWeek, setPlanWeek] = useState('1')
  const [planPhase, setPlanPhase] = useState('1')

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(data => {
      if (data.error) setClient(null)
      else setClient(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const generateAnalysis = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id }),
      })
      const data = await res.json()
      setAiAnalysis(data.analysis || 'Could not generate analysis. Make sure ANTHROPIC_API_KEY is set.')
    } catch {
      setAiAnalysis('Failed to generate analysis. Check API configuration.')
    }
    setAiLoading(false)
  }

  const sendOnboarding = async () => {
    console.log('[ONBOARDING] Sending for client:', id)
    setOnboardingSending(true)
    try {
      const res = await fetch('/api/send-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id }),
      })
      const data = await res.json()
      console.log('[ONBOARDING] Response:', data)
      if (data.success) {
        setOnboardingSent(true)
        setOnboardingUrl(data.onboardingUrl)
        const emailInfo = data.emailResult?.error
          ? `(email error: ${data.emailResult.error})`
          : data.emailResult?.skipped
          ? '(email skipped: API key not set)'
          : data.emailResult?.data?.id
          ? `(email ID: ${data.emailResult.data.id})`
          : ''
        alert(`Onboarding sent to ${data.message?.split('to ')[1] || 'client'} ${emailInfo}`)
      } else {
        alert('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('[ONBOARDING] Error:', err)
      alert('Failed to send onboarding form. Check console for details.')
    }
    setOnboardingSending(false)
  }

  const generatePlan = async (planType: 'workout' | 'nutrition') => {
    setPlansGenerating(true)
    setPlanStatus(`Generating ${planType} plan... This takes ~20 seconds.`)

    try {
      const res = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: id,
          week: parseInt(planWeek),
          phase: parseInt(planPhase),
          coachNotes: planNotes || undefined,
          type: planType,
        }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch {
        setPlanStatus(`Error: Server returned invalid response. It may have timed out.\n${text.substring(0, 200)}`)
        setPlansGenerating(false)
        return
      }
      if (data.success) {
        setPlanStatus(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan generated successfully!`)
      } else {
        setPlanStatus(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setPlanStatus('Network error: ' + (err?.message || String(err)))
    }
    setPlansGenerating(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="apple-card-static animate-pulse h-24" />
        <div className="apple-card-static animate-pulse h-48" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <h2 className="font-headline font-bold text-xl mb-2">Client not found</h2>
        <Link href="/admin/clients" className="text-brand-bronze text-sm">← Back to clients</Link>
      </div>
    )
  }

  const s = client.stats

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-bronze/20 to-brand-card border border-brand-bronze/30 flex items-center justify-center text-xl font-headline font-bold text-brand-bronze">
            {(client.name || '?')[0]}
          </div>
          <div>
            <h1 className="heading-lg">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="label-sm font-body">{client.email}</span>
              {client.country && <span className="label-sm">· {client.country}</span>}
              <span className={client.tier === 'elite' ? 'badge badge-bronze' : 'badge badge-neutral'}>{client.tier}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={sendOnboarding} disabled={onboardingSending}
            className="btn-secondary">
            {onboardingSending ? 'Sending...' : onboardingSent ? 'Sent ✓' : 'Send Onboarding Form'}
          </button>
          <button type="button" onClick={() => setShowPlanForm(!showPlanForm)}
            className="btn-primary">
            {plansGenerated ? 'Plans Generated ✓' : 'Generate AI Plans'}
          </button>
          <button type="button" onClick={() => { setTab('precall'); generateAnalysis() }}
            className="btn-primary">
            Pre-Call Briefing
          </button>
        </div>
      </div>

      {/* Plan Generation Form */}
      {showPlanForm && (
        <div className="apple-card-static p-8 mb-8 !border-brand-bronze/30">
          <h3 className="heading-md text-brand-bronze mb-6">Generate AI Plans</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-sm mb-1.5 block">Week</label>
              <select className="brand-input" value={planWeek} onChange={e => setPlanWeek(e.target.value)}>
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>Week {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-sm mb-1.5 block">Phase</label>
              <select className="brand-input" value={planPhase} onChange={e => setPlanPhase(e.target.value)}>
                <option value="1">Phase 1 — The Audit</option>
                <option value="2">Phase 2 — The Forge</option>
                <option value="3">Phase 3 — The Operating System</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="label-sm mb-1.5 block">
              Coach Notes <span className="text-brand-cream/30">(instructions for the AI — be specific)</span>
            </label>
            <textarea
              className="brand-input resize-none"
              rows={4}
              value={planNotes}
              onChange={e => setPlanNotes(e.target.value)}
              placeholder={"e.g. Focus on upper body hypertrophy this week. Client has a shoulder clicking issue — avoid overhead pressing. Increase protein to 200g. Client prefers training in the evening so structure carbs around that. No boxing."}
            />
          </div>
          {planStatus && (
            <div className="apple-card-static mb-4">
              <p className="text-sm font-body text-brand-bronze">{planStatus}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => generatePlan('workout')} disabled={plansGenerating}
              className="btn-primary" style={{ opacity: plansGenerating ? 0.7 : 1 }}>
              {plansGenerating ? 'Generating...' : 'Generate Workout Plan'}
            </button>
            <button type="button" onClick={() => generatePlan('nutrition')} disabled={plansGenerating}
              className="btn-primary" style={{ opacity: plansGenerating ? 0.7 : 1 }}>
              {plansGenerating ? 'Generating...' : 'Generate Nutrition Plan'}
            </button>
            <button type="button" onClick={() => { setShowPlanForm(false); setPlanStatus('') }}
              className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-16">
        {[
          { label: 'Trained', value: `${s.trainedDays}/${s.totalCheckIns > 0 ? s.totalCheckIns : '—'}` },
          { label: 'Mood', value: s.avgMood !== null ? `${s.avgMood}` : '—' },
          { label: 'Energy', value: s.avgEnergy !== null ? `${s.avgEnergy}` : '—' },
          { label: 'Sleep', value: s.avgSleep !== null ? `${s.avgSleep}h` : '—' },
          { label: 'Nutrition', value: `${s.nutritionCompliance}/${s.totalCheckIns}` },
          { label: 'Streak', value: `${s.streakDays}d` },
          { label: 'Check-ins', value: `${s.totalCheckIns}` },
          { label: 'Last Weight', value: (() => { const w = client.recentCheckIns.find((ci: any) => ci.weightKg); return w ? `${w.weightKg}kg` : '—' })() },
        ].map((stat) => (
          <div key={stat.label} className="apple-card-static !p-4 text-center">
            <div className="font-headline font-bold text-xl text-brand-bronze">{stat.value}</div>
            <div className="label-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-white/[0.06] overflow-x-auto">
        {([
          ['precall', 'Pre-Call Overview'],
          ['checkins', 'Check-in History'],
          ['onboarding', 'Onboarding'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-4 px-1 text-sm font-headline font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              tab === key ? 'text-brand-bronze border-b-2 border-brand-bronze' : 'text-brand-cream/40 hover:text-brand-cream/60'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* PRE-CALL OVERVIEW */}
      {tab === 'precall' && (
        <div className="space-y-8">
          {/* Red Flags & Wins */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="apple-card-static p-8">
              <h3 className="label-sm text-red-400/80 mb-4 flex items-center gap-2">
                <span>⚠</span> Red Flags
              </h3>
              {client.redFlags.length > 0 ? (
                <ul className="space-y-2">
                  {client.redFlags.map((flag) => (
                    <li key={flag} className="text-sm font-body text-brand-cream/70 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-brand-cream/40 font-body">No red flags this week</p>
              )}
            </div>

            <div className="apple-card-static p-8">
              <h3 className="label-sm text-green-400/80 mb-4 flex items-center gap-2">
                <span>✓</span> Wins to Acknowledge
              </h3>
              {client.wins.length > 0 ? (
                <ul className="space-y-2">
                  {client.wins.map((win) => (
                    <li key={win} className="text-sm font-body text-brand-cream/70 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">•</span>
                      {win}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-brand-cream/40 font-body">Keep building momentum</p>
              )}
            </div>
          </div>

          {/* Mood & Energy Trend */}
          <div className="apple-card-static p-8">
            <h3 className="heading-md mb-6">7-Day Trend</h3>
            {client.moodTrend.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="apple-table">
                  <thead>
                    <tr>
                      <th className="text-left">Day</th>
                      <th className="text-center">Weight</th>
                      <th className="text-center">Mood</th>
                      <th className="text-center">Energy</th>
                      <th className="text-center">Stress</th>
                      <th className="text-center">Sleep</th>
                      <th className="text-center">Steps</th>
                      <th className="text-center">Trained</th>
                      <th className="text-center">Nutrition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.moodTrend.map((day: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2 text-brand-cream/60 whitespace-nowrap">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}</td>
                        <td className="py-2 text-center text-brand-cream/50 text-xs">{day.weightKg ? `${day.weightKg}kg` : '—'}</td>
                        <td className="py-2 text-center">
                          <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            (day.mood || 0) >= 7 ? 'bg-green-400/10 text-green-400' :
                            (day.mood || 0) >= 5 ? 'bg-brand-bronze/10 text-brand-bronze' :
                            'bg-red-400/10 text-red-400'
                          }`}>{day.mood || '—'}</span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            (day.energy || 0) >= 7 ? 'bg-green-400/10 text-green-400' :
                            (day.energy || 0) >= 5 ? 'bg-brand-bronze/10 text-brand-bronze' :
                            'bg-red-400/10 text-red-400'
                          }`}>{day.energy || '—'}</span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            (day.stressLevel || 0) >= 7 ? 'bg-red-400/10 text-red-400' :
                            (day.stressLevel || 0) >= 4 ? 'bg-brand-bronze/10 text-brand-bronze' :
                            'bg-green-400/10 text-green-400'
                          }`}>{day.stressLevel || '—'}</span>
                        </td>
                        <td className="py-2 text-center text-brand-cream/50 text-xs">
                          {day.sleep ? `${day.sleep}h` : '—'}
                          {day.sleepQuality ? <span className="block text-[10px] text-brand-cream/30">Q:{day.sleepQuality}</span> : null}
                        </td>
                        <td className="py-2 text-center text-brand-cream/50 text-xs">{day.steps ? day.steps.toLocaleString() : '—'}</td>
                        <td className="py-2 text-center">
                          {day.trained ? <span className="text-green-400">✓</span> : <span className="text-brand-cream/20">✕</span>}
                          {day.workoutName && <span className="block text-[10px] text-brand-cream/30 truncate max-w-[80px]">{day.workoutName}</span>}
                        </td>
                        <td className="py-2 text-center text-xs capitalize text-brand-cream/50">{day.nutrition || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-brand-cream/40 font-body">No check-in data yet</p>
            )}
          </div>

          {/* AI Pre-Call Analysis */}
          <div className="apple-card-static p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="heading-md">AI Pre-Call Briefing</h3>
              <button onClick={generateAnalysis} disabled={aiLoading} className="btn-primary !py-2 !px-4 !text-xs">
                {aiLoading ? 'Generating...' : aiAnalysis ? 'Regenerate' : 'Generate Briefing'}
              </button>
            </div>
            {aiAnalysis ? (
              <div className="prose prose-sm prose-invert max-w-none text-brand-cream/70 font-body text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-sm text-brand-cream/40 font-body">
                Click &quot;Generate Briefing&quot; to get an AI-powered analysis of this client&apos;s last 7 days — including compliance trends, red flags, and talking points for your next call.
              </p>
            )}
          </div>

          {/* Coach Notes */}
          <div className="apple-card-static p-8">
            <h3 className="heading-md mb-4">Private Coach Notes</h3>
            <textarea className="brand-input resize-none" rows={3} placeholder="Add private notes before the call..." />
          </div>
        </div>
      )}

      {/* CHECK-IN HISTORY */}
      {tab === 'checkins' && (
        <div>
          {client.recentCheckIns.length > 0 ? (
            <div className="space-y-4">
              {client.recentCheckIns.map((ci: any) => (
                <div key={ci.id} className="apple-card-static p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-headline font-semibold">
                      {new Date(ci.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    {ci.weightKg && (
                      <span className="badge badge-bronze">
                        {ci.weightKg} kg
                      </span>
                    )}
                  </div>

                  {/* Metric badges */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                    {ci.steps != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className="text-xs font-headline font-bold text-brand-bronze">{ci.steps.toLocaleString()}</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Steps</div>
                      </div>
                    )}
                    {ci.waterMl != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className="text-xs font-headline font-bold text-brand-bronze">{(ci.waterMl / 1000).toFixed(1)}L</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Water</div>
                      </div>
                    )}
                    {ci.sleepHours != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className="text-xs font-headline font-bold text-brand-bronze">{ci.sleepHours}h</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Sleep{ci.sleepQuality ? ` Q:${ci.sleepQuality}` : ''}</div>
                      </div>
                    )}
                    {ci.energy != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className="text-xs font-headline font-bold text-brand-bronze">{ci.energy}/10</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Energy</div>
                      </div>
                    )}
                    {ci.mood != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className="text-xs font-headline font-bold text-brand-bronze">{ci.mood}/10</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Mood</div>
                      </div>
                    )}
                    {ci.stressLevel != null && (
                      <div className="apple-card-static !p-3 text-center !rounded-xl">
                        <div className={`text-xs font-headline font-bold ${ci.stressLevel >= 7 ? 'text-red-400' : ci.stressLevel >= 4 ? 'text-brand-bronze' : 'text-green-400'}`}>{ci.stressLevel}/10</div>
                        <div className="text-[9px] text-brand-cream/30 uppercase tracking-wider">Stress</div>
                      </div>
                    )}
                  </div>

                  {/* Detail rows */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs font-body mb-2">
                    <div>
                      <span className="text-brand-cream/30">Trained: </span>
                      <span className={ci.trained ? 'text-green-400' : 'text-brand-cream/50'}>
                        {ci.trained ? (ci.workoutName || 'Yes') : 'Rest day'}
                      </span>
                    </div>
                    {ci.trained && ci.workoutPerformance != null && (
                      <div>
                        <span className="text-brand-cream/30">Performance: </span>
                        <span className="text-brand-cream/60">{ci.workoutPerformance}/10</span>
                      </div>
                    )}
                    <div>
                      <span className="text-brand-cream/30">Nutrition: </span>
                      <span className="text-brand-cream/60 capitalize">{ci.nutritionCompliance || '—'}</span>
                    </div>
                  </div>

                  {ci.offPlanMeals && (
                    <p className="text-xs text-pink-300/60 font-body mt-1">Off-plan: {ci.offPlanMeals}</p>
                  )}

                  {ci.notes && (
                    <p className="mt-3 text-sm text-brand-cream/40 font-body italic border-t border-white/[0.04] pt-3">&ldquo;{ci.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="apple-card-static p-8 text-center">
              <p className="text-brand-cream/30 font-body text-sm">No check-ins recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* ONBOARDING */}
      {tab === 'onboarding' && (
        <div className="apple-card-static p-8">
          {client.onboarding ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={client.onboarding.status === 'completed' ? 'badge badge-success' : 'badge badge-bronze'}>{client.onboarding.status}</span>
                {client.onboarding.submittedAt && (
                  <span className="text-xs text-brand-cream/40">Submitted {new Date(client.onboarding.submittedAt).toLocaleDateString()}</span>
                )}
              </div>
              {client.onboarding.extractedSummary ? (
                <pre className="text-sm text-brand-cream/60 font-body whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(JSON.parse(client.onboarding.extractedSummary), null, 2)}
                </pre>
              ) : client.onboarding.responsesJson ? (
                <pre className="text-sm text-brand-cream/60 font-body whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(JSON.parse(client.onboarding.responsesJson), null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-brand-cream/40">Onboarding form sent but not yet completed.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              {onboardingSent ? (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-green-400 font-headline font-semibold mb-2">Onboarding form sent!</p>
                  <p className="text-sm text-brand-cream/50 font-body mb-3">An email has been sent to {client.email}</p>
                  {onboardingUrl && (
                    <div className="apple-card-static !p-4 mt-4">
                      <p className="label-sm mb-1">Direct link (share manually if needed):</p>
                      <code className="text-xs text-brand-bronze break-all">{onboardingUrl}</code>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-brand-cream/40 font-body text-sm mb-4">No onboarding form sent yet</p>
                  <button type="button" onClick={sendOnboarding} disabled={onboardingSending}
                    className="btn-primary">
                    {onboardingSending ? 'Sending...' : 'Send Onboarding Form'}
                  </button>
                  <p className="text-xs text-brand-cream/30 font-body mt-3">
                    This will send an email to {client.email} with a link to complete the onboarding questionnaire.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
