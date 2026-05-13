'use client'

import { useState, useEffect } from 'react'

type CheckIn = {
  id: string; date: string; weightKg: number | null; steps: number | null;
  waterMl: number | null; sleepHours: number | null; sleepQuality: number | null;
  nutritionCompliance: string | null; offPlanMeals: string | null;
  trained: boolean; workoutName: string | null; workoutPerformance: number | null;
  energy: number | null; mood: number | null; stressLevel: number | null; notes: string | null;
}

export default function DailyLog() {
  const [tab, setTab] = useState<'log' | 'history'>('log')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<CheckIn[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [steps, setSteps] = useState('')
  const [waterLitres, setWaterLitres] = useState(2.5)
  const [sleepHours, setSleepHours] = useState('7')
  const [sleepQuality, setSleepQuality] = useState(7)
  const [nutritionCompliance, setNutritionCompliance] = useState('full')
  const [offPlanMeals, setOffPlanMeals] = useState('')
  const [trained, setTrained] = useState(true)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutPerformance, setWorkoutPerformance] = useState(7)
  const [energy, setEnergy] = useState(7)
  const [mood, setMood] = useState(7)
  const [stressLevel, setStressLevel] = useState(3)
  const [notes, setNotes] = useState('')

  const loadHistory = () => {
    setHistoryLoading(true)
    fetch('/api/checkins').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setHistory(data)
      setHistoryLoading(false)
    }).catch(() => setHistoryLoading(false))
  }

  useEffect(() => {
    if (tab === 'history' && history.length === 0) loadHistory()
  }, [tab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          weightKg: weightKg || null,
          steps: steps || null,
          waterLitres,
          sleepHours,
          sleepQuality,
          nutritionCompliance,
          offPlanMeals: nutritionCompliance !== 'full' ? offPlanMeals : null,
          trained,
          workoutName: trained ? workoutName : null,
          workoutPerformance: trained ? workoutPerformance : null,
          energy,
          mood,
          stressLevel,
          notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Failed to submit')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  const SliderField = ({ label, value, onChange, min = 1, max = 10, lowLabel, highLabel, color }: {
    label: string; value: number; onChange: (v: number) => void;
    min?: number; max?: number; lowLabel?: string; highLabel?: string; color?: string;
  }) => (
    <div>
      <div className="flex justify-between text-sm font-body text-brand-cream/60 mb-2">
        <span>{label}</span>
        <span className={`font-headline font-bold ${color || 'text-brand-bronze'}`}>{value}/{max}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-2 bg-black/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-brand-bronze [&::-webkit-slider-thumb]:to-brand-bronze [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(177, 156, 217,0.4)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-bronze/30"
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-[10px] text-brand-cream/30 mt-1">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full border-2 border-brand-bronze flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-brand-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="font-headline font-bold text-2xl mb-2">Daily log submitted</h2>
        <p className="text-sm text-brand-cream/50 font-body mb-6">Your coach will review this before your next call. Keep it up.</p>
        <div className="flex gap-3">
          <button onClick={() => { setSubmitted(false); resetForm() }} className="btn-secondary !py-2.5 !px-5 !text-sm">
            Log Another Day
          </button>
          <button onClick={() => { setTab('history'); loadHistory(); setSubmitted(false) }} className="btn-primary !py-2.5 !px-5 !text-sm">
            View History
          </button>
        </div>
      </div>
    )
  }

  function resetForm() {
    setDate(new Date().toISOString().slice(0, 10))
    setWeightKg(''); setSteps(''); setWaterLitres(2.5)
    setSleepHours('7'); setSleepQuality(7)
    setNutritionCompliance('full'); setOffPlanMeals('')
    setTrained(true); setWorkoutName(''); setWorkoutPerformance(7)
    setEnergy(7); setMood(7); setStressLevel(3); setNotes('')
  }

  return (
    <div className="max-w-2xl py-16">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Daily Tracker</h1>
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/[0.06]">
          {(['log', 'history'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-headline font-semibold uppercase tracking-wider rounded-md transition-all ${
                tab === t ? 'bg-gradient-to-br from-brand-bronze/20 to-brand-bronze/10 text-brand-bronze shadow-[0_0_12px_rgba(177, 156, 217,0.1)] border border-brand-bronze/20' : 'text-brand-cream/35 hover:text-brand-cream/50 border border-transparent'
              }`}>
              {t === 'log' ? "Today's Log" : 'History'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'log' && (
        <>
          <p className="text-sm text-brand-cream/50 font-body mb-8">Track everything. Honest data drives real results.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-sm text-red-400 font-body">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Date & Weight ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Date & Body Weight</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-sm mb-1.5">Date</label>
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="brand-input !py-2.5"
                  />
                </div>
                <div>
                  <label className="label-sm mb-1.5">Body Weight (kg)</label>
                  <input
                    type="number" step="0.1" value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="brand-input !py-2.5" placeholder="e.g. 82.5"
                  />
                </div>
              </div>
            </section>

            {/* ── Activity ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Activity</h2>
              <div className="space-y-4">
                <div>
                  <label className="label-sm mb-1.5">Steps</label>
                  <input
                    type="number" value={steps} onChange={(e) => setSteps(e.target.value)}
                    className="brand-input !py-2.5" placeholder="e.g. 10000"
                  />
                </div>
                <div>
                  <SliderField label="Water Intake" value={waterLitres} onChange={setWaterLitres}
                    min={0} max={5} lowLabel="0L" highLabel="5L" />
                  <p className="text-xs text-brand-cream/30 mt-1 text-right">{waterLitres}L</p>
                </div>
              </div>
            </section>

            {/* ── Sleep ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Sleep</h2>
              <div className="space-y-4">
                <div>
                  <label className="label-sm mb-1.5">Duration (hours)</label>
                  <input
                    type="number" step="0.25" min="0" max="14" value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="brand-input !py-2.5 !w-32"
                  />
                </div>
                <SliderField label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality}
                  lowLabel="Terrible" highLabel="Amazing" />
              </div>
            </section>

            {/* ── Nutrition ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Nutrition</h2>
              <div className="space-y-4">
                <div>
                  <label className="label-sm mb-2">Did you follow your meal plan?</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['full', 'mostly', 'partial', 'off-plan'] as const).map((val) => (
                      <button key={val} type="button" onClick={() => setNutritionCompliance(val)}
                        className={`px-4 py-2 rounded-lg text-sm font-body capitalize transition-all ${
                          nutritionCompliance === val
                            ? 'bg-gradient-to-br from-brand-bronze/15 to-brand-bronze/10 border border-brand-bronze/30 text-brand-bronze shadow-[0_0_12px_rgba(177, 156, 217,0.1)]'
                            : 'bg-black/20 border border-white/[0.08] text-brand-cream/45 hover:text-brand-cream/65 hover:border-white/[0.12]'
                        }`}>
                        {val === 'off-plan' ? 'Off-plan' : val}
                      </button>
                    ))}
                  </div>
                </div>

                {nutritionCompliance !== 'full' && (
                  <div>
                    <label className="label-sm mb-1.5">Off-plan meals / deviations</label>
                    <textarea
                      value={offPlanMeals} onChange={(e) => setOffPlanMeals(e.target.value)}
                      rows={2} className="brand-input resize-none"
                      placeholder="e.g. Had pizza for dinner, skipped afternoon snack..."
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── Workout ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Workout</h2>
              <div className="space-y-4">
                <div>
                  <label className="label-sm mb-2">Did you train today?</label>
                  <div className="flex gap-3">
                    {[true, false].map((val) => (
                      <button key={String(val)} type="button" onClick={() => setTrained(val)}
                        className={`px-6 py-2.5 rounded-lg font-body text-sm transition-all ${
                          trained === val
                            ? 'bg-gradient-to-br from-brand-bronze/15 to-brand-bronze/10 border border-brand-bronze/30 text-brand-bronze shadow-[0_0_12px_rgba(177, 156, 217,0.1)]'
                            : 'bg-black/20 border border-white/[0.08] text-brand-cream/45 hover:border-white/[0.12]'
                        }`}>
                        {val ? 'Yes, I trained' : 'Rest day'}
                      </button>
                    ))}
                  </div>
                </div>

                {trained && (
                  <>
                    <div>
                      <label className="label-sm mb-1.5">Workout of the day</label>
                      <input
                        type="text" value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        className="brand-input !py-2.5"
                        placeholder="e.g. Upper Body Push, Leg Day, HIIT Cardio..."
                      />
                    </div>
                    <SliderField label="Workout Performance" value={workoutPerformance} onChange={setWorkoutPerformance}
                      lowLabel="Struggled" highLabel="Crushed it" />
                  </>
                )}
              </div>
            </section>

            {/* ── Energy & Mood ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Energy & Mood</h2>
              <div className="space-y-5">
                <SliderField label="Energy Level" value={energy} onChange={setEnergy}
                  lowLabel="Drained" highLabel="Fired up" />
                <SliderField label="Mood" value={mood} onChange={setMood}
                  lowLabel="Low" highLabel="Great" />
                <SliderField label="Stress Level" value={stressLevel} onChange={setStressLevel}
                  lowLabel="Calm" highLabel="Very stressed" />
              </div>
            </section>

            {/* ── Daily Comments ── */}
            <section className="apple-card-static p-8">
              <h2 className="font-headline font-semibold text-xs uppercase tracking-[0.15em] text-gradient-bronze mb-5">Daily Comments</h2>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} className="brand-input resize-none"
                placeholder="How did the day go? Anything your coach should know — wins, struggles, questions..."
              />
            </section>

            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
              {submitting ? 'Submitting...' : 'Submit Daily Log'}
            </button>
          </form>
        </>
      )}

      {tab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="apple-card-static p-8 animate-pulse h-24" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="apple-card-static p-12 text-center">
              <p className="text-brand-cream/40 font-body text-sm">No logs yet. Start tracking today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((ci) => (
                <div key={ci.id} className="apple-card-static p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-headline font-semibold text-sm">
                      {new Date(ci.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    {ci.weightKg && (
                      <span className="text-xs bg-brand-bronze/10 text-brand-bronze px-2.5 py-1 rounded-full font-headline font-semibold">
                        {ci.weightKg} kg
                      </span>
                    )}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                    {ci.steps != null && (
                      <MetricBadge label="Steps" value={ci.steps.toLocaleString()} />
                    )}
                    {ci.waterMl != null && (
                      <MetricBadge label="Water" value={`${(ci.waterMl / 1000).toFixed(1)}L`} />
                    )}
                    {ci.sleepHours != null && (
                      <MetricBadge label="Sleep" value={`${ci.sleepHours}h`} sub={ci.sleepQuality ? `Q: ${ci.sleepQuality}/10` : undefined} />
                    )}
                    {ci.energy != null && (
                      <MetricBadge label="Energy" value={`${ci.energy}/10`} />
                    )}
                    {ci.mood != null && (
                      <MetricBadge label="Mood" value={`${ci.mood}/10`} />
                    )}
                    {ci.stressLevel != null && (
                      <MetricBadge label="Stress" value={`${ci.stressLevel}/10`} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs font-body mb-2">
                    <div>
                      <span className="text-brand-cream/40">Trained: </span>
                      <span className={ci.trained ? 'text-green-400' : 'text-brand-cream/50'}>
                        {ci.trained ? (ci.workoutName || 'Yes') : 'Rest day'}
                      </span>
                    </div>
                    {ci.trained && ci.workoutPerformance != null && (
                      <div>
                        <span className="text-brand-cream/40">Performance: </span>
                        <span className="text-brand-cream/70">{ci.workoutPerformance}/10</span>
                      </div>
                    )}
                    <div>
                      <span className="text-brand-cream/40">Nutrition: </span>
                      <span className="text-brand-cream/70 capitalize">{ci.nutritionCompliance || '—'}</span>
                    </div>
                  </div>

                  {ci.offPlanMeals && (
                    <p className="text-xs text-pink-300/70 font-body mt-1">Off-plan: {ci.offPlanMeals}</p>
                  )}

                  {ci.notes && (
                    <p className="mt-3 text-sm text-brand-cream/50 font-body italic border-t border-white/[0.06]/50 pt-3">
                      &ldquo;{ci.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/[0.04] rounded-lg px-2.5 py-2 text-center">
      <div className="text-xs font-headline font-bold text-brand-bronze">{value}</div>
      <div className="text-[9px] text-brand-cream/40 font-body uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[9px] text-brand-cream/30">{sub}</div>}
    </div>
  )
}
