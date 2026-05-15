'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const steps = [
  { title: 'Basic Info', fields: ['fullName', 'dob', 'nationality', 'country'] },
  { title: 'Physical State', fields: ['height', 'weight', 'bodyFat', 'dominantHand'] },
  { title: 'Training Background', fields: ['trainingAge', 'currentSplit', 'sports', 'gymAccess'] },
  { title: 'Goals', fields: ['primaryGoal', 'secondaryGoals', 'targetTimeframe', 'aestheticTarget'] },
  { title: 'Schedule & Lifestyle', fields: ['workHours', 'jobType', 'trainingWindows', 'sessionLength'] },
  { title: 'Nutrition', fields: ['currentDiet', 'restrictions', 'allergies', 'foodBudget', 'cookingAbility'] },
  { title: 'Medical & Recovery', fields: ['injuries', 'conditions', 'sleepAvg', 'stressLevel'] },
  { title: 'Mindset', fields: ['whatStoppedYou', 'mainCharacterMeaning', 'disciplineScore', 'biggestFear'] },
  { title: 'Social Context', fields: ['partnerSupport', 'accountability', 'drinkingHabits'] },
  { title: 'Preferences', fields: ['trainingStyle', 'communicationFreq', 'callPreference'] },
  { title: 'Baseline Metrics', fields: ['benchPress', 'deadlift', 'squat', 'runningPace'] },
  { title: 'Commitment', fields: ['commitment'] },
]

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black flex items-center justify-center"><div className="text-brand-cream/40 font-body">Loading...</div></div>}>
      <OnboardingPage />
    </Suspense>
  )
}

function OnboardingPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [clientName, setClientName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetch(`/api/clients/${token}`).then(r => r.json()).then(d => {
        if (d.name) setClientName(d.name)
      }).catch(() => {})
    }
  }, [token])

  const update = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }))
    // Auto-save to localStorage
    const saved = { ...data, [key]: value }
    localStorage.setItem(`onboarding-${token}`, JSON.stringify(saved))
  }

  // Restore from localStorage on mount
  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem(`onboarding-${token}`)
      if (saved) setData(JSON.parse(saved))
    }
  }, [token])

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${token}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: data }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to submit')
      }
      localStorage.removeItem(`onboarding-${token}`)
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-headline font-bold text-2xl mb-2">Invalid Link</h1>
          <p className="text-brand-cream/50 font-body text-sm">This onboarding link is invalid or expired.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-start p-6 pt-12">
        <div className="text-center max-w-2xl w-full">
          <div className="w-16 h-16 rounded-full border-2 border-brand-bronze flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="font-headline font-bold text-2xl mb-3">Your Protocol is Being Built</h1>
          <p className="font-accent italic text-brand-cream/60 leading-relaxed mb-8">
            Your onboarding is complete. Now book your onboarding call with your coach to kick things off.
          </p>

          <div className="bg-brand-card border border-brand-slate rounded-xl overflow-hidden">
            <div className="p-6 pb-2">
              <p className="font-headline font-semibold mb-1">Book Your Onboarding Call</p>
              <p className="text-sm text-brand-cream/40 mb-4">30-minute private call with your coach to go over your protocol.</p>
            </div>
            <iframe
              src="https://calendly.com/stefan-tantari/checkin-call"
              width="100%"
              height="650"
              frameBorder="0"
              title="Book Onboarding Call"
              className="border-t border-white/5"
            />
          </div>
        </div>
      </div>
    )
  }

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <div className="border-b border-brand-card">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-headline font-bold text-sm tracking-widest uppercase">
            <span className="text-brand-bronze">Zenith</span>FITNESS
          </div>
          <span className="text-[10px] text-brand-cream/30 font-headline tracking-[3px] uppercase">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] bg-brand-card">
          <div className="h-full bg-brand-bronze transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {clientName && step === 0 && (
          <p className="text-brand-cream/50 font-body text-sm mb-6">
            Welcome, <strong className="text-brand-cream">{clientName}</strong>. Let&apos;s build your protocol.
          </p>
        )}

        <h2 className="font-headline font-bold text-2xl mb-2">{currentStep.title}</h2>
        <p className="text-sm text-brand-cream/40 font-accent italic mb-8">
          {step === 11 ? 'One final step.' : 'Take your time. Honest answers lead to better results.'}
        </p>

        {/* STEP 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Full Name" value={data.fullName} onChange={v => update('fullName', v)} placeholder="Your full name" />
            <Field label="Date of Birth" value={data.dob} onChange={v => update('dob', v)} placeholder="DD/MM/YYYY" />
            <Field label="Nationality" value={data.nationality} onChange={v => update('nationality', v)} placeholder="e.g. Dutch, British" />
            <Field label="Country of Residence" value={data.country} onChange={v => update('country', v)} placeholder="e.g. Netherlands" />
          </div>
        )}

        {/* STEP 1: Physical State */}
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Height (cm)" value={data.height} onChange={v => update('height', v)} placeholder="e.g. 180" type="number" />
            <Field label="Weight (kg)" value={data.weight} onChange={v => update('weight', v)} placeholder="e.g. 82" type="number" />
            <Field label="Estimated Body Fat %" value={data.bodyFat} onChange={v => update('bodyFat', v)} placeholder="e.g. 18" type="number" />
            <Select label="Dominant Hand" value={data.dominantHand} onChange={v => update('dominantHand', v)} options={['Right', 'Left', 'Ambidextrous']} />
          </div>
        )}

        {/* STEP 2: Training Background */}
        {step === 2 && (
          <div className="space-y-5">
            <Field label="How many years have you been training seriously?" value={data.trainingAge} onChange={v => update('trainingAge', v)} placeholder="e.g. 3 years" />
            <TextArea label="Current training split / frequency" value={data.currentSplit} onChange={v => update('currentSplit', v)} placeholder="e.g. Push/Pull/Legs, 4x per week" />
            <TextArea label="Sports background" value={data.sports} onChange={v => update('sports', v)} placeholder="e.g. Boxing, football, running — or none" />
            <Select label="Gym access" value={data.gymAccess} onChange={v => update('gymAccess', v)} options={['Commercial gym', 'Home gym', 'Both', 'No gym access']} />
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div className="space-y-5">
            <TextArea label="What is your primary transformation goal?" value={data.primaryGoal} onChange={v => update('primaryGoal', v)} placeholder="Be specific. What does success look like for you?" rows={4} />
            <TextArea label="Any secondary goals?" value={data.secondaryGoals} onChange={v => update('secondaryGoals', v)} placeholder="e.g. Better posture, more energy, specific body composition targets" />
            <Select label="Target timeframe" value={data.targetTimeframe} onChange={v => update('targetTimeframe', v)} options={['8 weeks', '12 weeks', '16 weeks', '6+ months']} />
            <TextArea label="Any specific aesthetics you're aiming for?" value={data.aestheticTarget} onChange={v => update('aestheticTarget', v)} placeholder="e.g. Lean and athletic, powerful shoulders, welterweight boxer look" />
          </div>
        )}

        {/* STEP 4: Schedule */}
        {step === 4 && (
          <div className="space-y-5">
            <Field label="Average work hours per day" value={data.workHours} onChange={v => update('workHours', v)} placeholder="e.g. 8-10" />
            <Select label="Job type" value={data.jobType} onChange={v => update('jobType', v)} options={['Desk-based', 'Physical', 'Travel-heavy', 'Irregular/shift work']} />
            <TextArea label="Available training windows" value={data.trainingWindows} onChange={v => update('trainingWindows', v)} placeholder="e.g. Early morning (6-7am) and evenings after 7pm" />
            <Select label="Available session length" value={data.sessionLength} onChange={v => update('sessionLength', v)} options={['30 minutes', '45 minutes', '60 minutes', '90+ minutes']} />
          </div>
        )}

        {/* STEP 5: Nutrition */}
        {step === 5 && (
          <div className="space-y-5">
            <TextArea label="Describe your current diet" value={data.currentDiet} onChange={v => update('currentDiet', v)} placeholder="What does a typical day of eating look like?" />
            <TextArea label="Dietary restrictions" value={data.restrictions} onChange={v => update('restrictions', v)} placeholder="e.g. Vegetarian, halal, gluten-free — or none" />
            <Field label="Food allergies" value={data.allergies} onChange={v => update('allergies', v)} placeholder="e.g. Nuts, shellfish — or none" />
            <Select label="Weekly food budget" value={data.foodBudget} onChange={v => update('foodBudget', v)} options={['Under $50', '$50–$100', '$100–$150', '$150+']} />
            <Select label="Cooking ability" value={data.cookingAbility} onChange={v => update('cookingAbility', v)} options={["I don't cook", 'Basic', 'Comfortable', 'I enjoy cooking']} />
          </div>
        )}

        {/* STEP 6: Medical */}
        {step === 6 && (
          <div className="space-y-5">
            <TextArea label="Any injuries?" value={data.injuries} onChange={v => update('injuries', v)} placeholder="Current or past injuries that affect training — or none" />
            <TextArea label="Chronic conditions or medications" value={data.conditions} onChange={v => update('conditions', v)} placeholder="Optional — leave blank if none" />
            <Select label="Average sleep per night" value={data.sleepAvg} onChange={v => update('sleepAvg', v)} options={['4 hours', '5 hours', '6 hours', '7 hours', '8 hours', '9+ hours']} />
            <Field label="Current stress level (1-10)" value={data.stressLevel} onChange={v => update('stressLevel', v)} placeholder="1 = very relaxed, 10 = extremely stressed" type="number" />
          </div>
        )}

        {/* STEP 7: Mindset */}
        {step === 7 && (
          <div className="space-y-5">
            <TextArea label="What has stopped you from achieving this before?" value={data.whatStoppedYou} onChange={v => update('whatStoppedYou', v)} placeholder="Be honest. Understanding your patterns is the first step." rows={4} />
            <TextArea label='What does "main character energy" mean to you?' value={data.mainCharacterMeaning} onChange={v => update('mainCharacterMeaning', v)} placeholder="In your own words — what does commanding presence look like in your life?" rows={3} />
            <Field label="How disciplined are you currently? (1-10)" value={data.disciplineScore} onChange={v => update('disciplineScore', v)} type="number" placeholder="Be honest" />
            <TextArea label="What is your biggest fear about starting this?" value={data.biggestFear} onChange={v => update('biggestFear', v)} placeholder="There are no wrong answers here." />
          </div>
        )}

        {/* STEP 8: Social */}
        {step === 8 && (
          <div className="space-y-5">
            <Select label="Partner aware/supportive of this commitment?" value={data.partnerSupport} onChange={v => update('partnerSupport', v)} options={['Yes, fully supportive', 'Somewhat', 'No', 'Single']} />
            <TextArea label="Do you have any training accountability currently?" value={data.accountability} onChange={v => update('accountability', v)} placeholder="e.g. Training partner, coach, group — or none" />
            <Select label="Social drinking habits" value={data.drinkingHabits} onChange={v => update('drinkingHabits', v)} options={['None', 'Occasionally (1-2x/month)', 'Regularly (weekly)', 'Frequently']} />
          </div>
        )}

        {/* STEP 9: Preferences */}
        {step === 9 && (
          <div className="space-y-5">
            <TextArea label="Preferred training style" value={data.trainingStyle} onChange={v => update('trainingStyle', v)} placeholder="e.g. Heavy compound lifts, boxing, hybrid, whatever gets results" />
            <Select label="Preferred communication frequency with coach" value={data.communicationFreq} onChange={v => update('communicationFreq', v)} options={['Daily check-in', '3x per week', 'Weekly only']} />
            <Field label="Preferred call day/time" value={data.callPreference} onChange={v => update('callPreference', v)} placeholder="e.g. Tuesdays at 7pm" />
          </div>
        )}

        {/* STEP 10: Baseline */}
        {step === 10 && (
          <div className="space-y-5">
            <p className="text-sm text-brand-cream/50 font-body">Enter your current estimated 1RM (one-rep max) for these lifts. Leave blank if unknown.</p>
            <Field label="Bench Press 1RM (kg)" value={data.benchPress} onChange={v => update('benchPress', v)} type="number" placeholder="e.g. 80" />
            <Field label="Deadlift 1RM (kg)" value={data.deadlift} onChange={v => update('deadlift', v)} type="number" placeholder="e.g. 120" />
            <Field label="Squat 1RM (kg)" value={data.squat} onChange={v => update('squat', v)} type="number" placeholder="e.g. 100" />
            <Field label="1km Running Pace (minutes)" value={data.runningPace} onChange={v => update('runningPace', v)} placeholder="e.g. 5:30" />
          </div>
        )}

        {/* STEP 11: Commitment */}
        {step === 11 && (
          <div className="space-y-6">
            <div className="bg-brand-card border-l-4 border-brand-bronze rounded-r-lg p-6">
              <p className="font-accent italic text-brand-cream/80 leading-relaxed">
                &ldquo;I, <strong className="text-brand-bronze">{data.fullName || clientName || '______'}</strong>, commit to showing up as the best version of myself for the full duration of Zenith. I understand that transformation requires consistency, honesty with my coach, and the willingness to be uncomfortable in pursuit of my maximum potential.&rdquo;
              </p>
            </div>
            <div>
              <label className="block text-xs text-brand-cream/50 font-body mb-1.5">Type your full name to confirm</label>
              <input className="brand-input" value={data.commitmentName || ''} onChange={e => update('commitmentName', e.target.value)} placeholder="Your full name" />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={data.commitment === 'yes'} onChange={e => update('commitment', e.target.checked ? 'yes' : '')}
                className="w-5 h-5 mt-0.5 accent-[#B19CD9] rounded" />
              <span className="text-sm text-brand-cream/70 font-body">I commit to this.</span>
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-400 font-body mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-brand-card">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm text-brand-cream/50 hover:text-brand-cream transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
          ) : <div />}

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary !py-3 !px-8">
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={submitting || data.commitment !== 'yes'}
              className={`btn-primary !py-3 !px-8 ${data.commitment !== 'yes' ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {submitting ? 'Submitting...' : 'Submit My Protocol Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   FORM COMPONENTS
   ============================================================ */
function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-brand-cream/50 font-body mb-1.5">{label}</label>
      <input className="brand-input" type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs text-brand-cream/50 font-body mb-1.5">{label}</label>
      <textarea className="brand-input resize-none" rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function Select({ label, value, onChange, options }: {
  label: string; value: string | undefined; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-xs text-brand-cream/50 font-body mb-1.5">{label}</label>
      <select className="brand-input" value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
