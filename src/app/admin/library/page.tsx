'use client'

import { useState } from 'react'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

export default function ContentLibrary() {
  const [tab, setTab] = useState<'exercises' | 'meals' | 'templates'>('exercises')

  return (
    <PageWrapper>
      <h1 className="font-headline font-bold text-2xl mb-6">Content Library</h1>

      <div className="flex gap-1 mb-8 bg-white/[0.02] rounded-xl p-1 w-fit border border-white/[0.06]">
        {(['exercises', 'meals', 'templates'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 capitalize ${
              tab === t ? 'bg-brand-bronze/[0.1] text-brand-bronze' : 'text-brand-cream/30 hover:text-brand-cream/50'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'exercises' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex gap-3 mb-6">
            <input className="brand-input flex-1" placeholder="Search exercises..." />
            <button className="btn-primary !text-sm !py-2.5">+ Add Exercise</button>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Barbell Overhead Press', muscles: 'Shoulders, Triceps', equipment: 'Barbell' },
              { name: 'Weighted Pull-ups', muscles: 'Back, Biceps', equipment: 'Pull-up Bar, Belt' },
              { name: 'Back Squat', muscles: 'Quads, Glutes', equipment: 'Barbell, Rack' },
              { name: 'Romanian Deadlift', muscles: 'Hamstrings, Glutes', equipment: 'Barbell' },
              { name: 'Heavy Bag Work', muscles: 'Full Body, Cardio', equipment: 'Boxing Bag' },
            ].map((ex, i) => (
              <motion.div
                key={ex.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:border-brand-bronze/15 transition-all duration-200"
              >
                <div>
                  <p className="font-headline font-semibold text-sm">{ex.name}</p>
                  <p className="text-xs text-brand-cream/30 font-body">{ex.muscles} · {ex.equipment}</p>
                </div>
                <button className="text-xs text-brand-bronze hover:text-brand-bronze font-headline font-semibold transition-colors">Edit</button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'meals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
          <p className="text-brand-cream/25 font-body text-sm">Meal & Recipe Library — add meals that AI can reference for plan generation.</p>
          <button className="btn-primary !text-sm mt-4">+ Add Recipe</button>
        </motion.div>
      )}

      {tab === 'templates' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
          <p className="text-brand-cream/25 font-body text-sm">Workout plan templates per phase — apply as starting point for new clients.</p>
          <button className="btn-primary !text-sm mt-4">+ Create Template</button>
        </motion.div>
      )}
    </PageWrapper>
  )
}
