'use client'

import { useState, useEffect } from 'react'

export default function WorkoutPlan() {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [parseError, setParseError] = useState(false)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.currentWorkout?.planJson) {
        try {
          const raw = data.currentWorkout.planJson
          // Try to extract JSON if wrapped in extra text
          let jsonStr = raw
          const jsonMatch = raw.match(/\{[\s\S]*\}/)
          if (jsonMatch) jsonStr = jsonMatch[0]
          setPlan(JSON.parse(jsonStr))
        } catch {
          console.error('Failed to parse workout plan JSON:', data.currentWorkout.planJson?.substring(0, 500))
          setParseError(true)
          setPlan(null)
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-brand-card rounded-lg h-16 animate-pulse" />)}</div>
  }

  if (!plan) {
    return (
      <div className="apple-card-static p-12 text-center">
        <h2 className="font-headline font-bold text-xl mb-2">Your workout plan is being built</h2>
        <p className="text-sm text-brand-cream/50 font-body">Your coach is preparing your personalised training protocol. Check back soon.</p>
      </div>
    )
  }

  const days = plan.days || []
  const phaseLabel = plan.phase_label || `Phase ${plan.phase || 1}`

  return (
    <div className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-lg">Workout Plan</h1>
          <p className="text-sm text-brand-cream/50 font-body mt-1">{phaseLabel} · Week {plan.week || 1}</p>
        </div>
      </div>

      {plan.weekly_notes && (
        <div className="apple-card-static p-8 border-l-4 border-l-brand-bronze mb-8">
          <p className="text-sm font-body text-brand-cream/60">{plan.weekly_notes}</p>
        </div>
      )}

      <div className="space-y-4">
        {days.map((day: any, i: number) => {
          const hasExercises = day.main_block && day.main_block.length > 0
          const isRest = day.session_type?.toLowerCase().includes('rest') || day.session_type?.toLowerCase().includes('recovery')

          return (
            <div key={i} className="apple-card-static overflow-hidden">
              <button type="button"
                onClick={() => hasExercises && setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${isRest ? 'bg-brand-slate' : 'bg-brand-bronze'}`} />
                  <div>
                    <span className="font-headline font-semibold text-sm">{day.day}</span>
                    <span className="text-brand-cream/50 mx-2">—</span>
                    <span className="text-sm text-brand-cream/70 font-body">{day.session_type}</span>
                    {day.duration_minutes && (
                      <span className="text-xs text-brand-cream/30 ml-2">({day.duration_minutes} min)</span>
                    )}
                  </div>
                </div>
                {hasExercises && (
                  <span className={`text-brand-cream/40 transition-transform ${expanded === i ? 'rotate-180' : ''}`}>▾</span>
                )}
              </button>

              {expanded === i && hasExercises && (
                <div className="border-t border-white/[0.06] p-6">
                  {/* Warmup */}
                  {day.warmup && day.warmup.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs text-brand-cream/40 font-headline uppercase tracking-wider mb-2">Warm-up</h4>
                      <ul className="space-y-1">
                        {day.warmup.map((w: string, j: number) => (
                          <li key={j} className="text-sm text-brand-cream/50 font-body">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Main block */}
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-brand-cream/40 text-xs uppercase tracking-wider">
                        <th className="text-left pb-3">Exercise</th>
                        <th className="text-center pb-3">Sets</th>
                        <th className="text-center pb-3">Reps</th>
                        <th className="text-center pb-3 hidden sm:table-cell">Rest</th>
                        <th className="text-left pb-3 hidden md:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-slate/50">
                      {day.main_block.map((ex: any, j: number) => (
                        <tr key={j} className="text-brand-cream/80">
                          <td className="py-3 pr-4 font-medium">{ex.exercise}</td>
                          <td className="py-3 text-center text-brand-bronze">{ex.sets}</td>
                          <td className="py-3 text-center">{ex.reps}</td>
                          <td className="py-3 text-center hidden sm:table-cell text-brand-cream/50">{ex.rest_seconds ? `${ex.rest_seconds}s` : ex.rest || '—'}</td>
                          <td className="py-3 hidden md:table-cell text-brand-cream/40 text-xs">{ex.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Finisher */}
                  {day.finisher && day.finisher.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs text-brand-cream/40 font-headline uppercase tracking-wider mb-2">Finisher</h4>
                      <ul className="space-y-1">
                        {day.finisher.map((f: string, j: number) => (
                          <li key={j} className="text-sm text-brand-cream/50 font-body">• {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cooldown */}
                  {day.cooldown && day.cooldown.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs text-brand-cream/40 font-headline uppercase tracking-wider mb-2">Cool-down</h4>
                      <ul className="space-y-1">
                        {day.cooldown.map((c: string, j: number) => (
                          <li key={j} className="text-sm text-brand-cream/50 font-body">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {plan.intensity_target && (
        <div className="mt-8 apple-card-static p-8">
          <p className="text-xs text-brand-cream/40 font-body"><strong className="text-brand-cream/60">Intensity target:</strong> {plan.intensity_target}</p>
        </div>
      )}
    </div>
  )
}
