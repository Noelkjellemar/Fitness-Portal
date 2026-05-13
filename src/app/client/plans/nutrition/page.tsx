'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function NutritionPlan() {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'meals' | 'grocery'>('meals')
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.currentNutrition?.planJson) {
        try {
          let raw = data.currentNutrition.planJson
          const jsonMatch = raw.match(/\{[\s\S]*\}/)
          if (jsonMatch) raw = jsonMatch[0]
          setPlan(JSON.parse(raw))
        } catch {
          console.error('Failed to parse nutrition plan JSON:', data.currentNutrition.planJson?.substring(0, 500))
          setPlan(null)
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-brand-card rounded-lg h-20 animate-pulse" />)}</div>
  }

  if (!plan) {
    return (
      <div className="apple-card-static p-12 text-center">
        <h2 className="font-headline font-bold text-xl mb-2">Your nutrition plan is being built</h2>
        <p className="text-sm text-brand-cream/50 font-body">Your coach is preparing your personalised meal plan. Check back soon.</p>
      </div>
    )
  }

  const targets = plan.daily_targets || {}
  const days = plan.days || []
  const todayData = days.find((d: any) => d.day === selectedDay) || days[0]
  const meals = todayData?.meals || []
  const groceryList = plan.grocery_list || {}

  return (
    <div className="py-16">
      <h1 className="heading-lg mb-2">Nutrition Plan</h1>
      <p className="text-sm text-brand-cream/50 font-body mb-8">Week {plan.week || 1}</p>

      {/* Macro targets */}
      {targets.calories && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Calories', val: targets.calories, unit: 'kcal' },
            { label: 'Protein', val: targets.protein_g, unit: 'g' },
            { label: 'Carbs', val: targets.carbs_g, unit: 'g' },
            { label: 'Fats', val: targets.fats_g, unit: 'g' },
          ].map((m) => (
            <div key={m.label} className="apple-card-static p-6 text-center">
              <div className="text-3xl font-bold text-brand-bronze">{m.val}<span className="text-lg">{m.unit}</span></div>
              <div className="label-sm mt-2">{m.label} target</div>
            </div>
          ))}
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {DAYS.map(day => (
          <button key={day} type="button" onClick={() => { setSelectedDay(day); setExpanded(null) }}
            className={`px-4 py-2 text-xs font-headline font-semibold uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-brand-bronze/10 text-brand-bronze border border-brand-bronze'
                : 'bg-white/[0.04] text-brand-cream/40 border border-white/[0.06] hover:text-brand-cream/60'
            }`}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/[0.06]">
        {(['meals', 'grocery'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-headline font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? 'text-brand-bronze border-b-2 border-brand-bronze' : 'text-brand-cream/40 hover:text-brand-cream/60'
            }`}>
            {t === 'meals' ? `${selectedDay}'s Meals` : 'Grocery List'}
          </button>
        ))}
      </div>

      {tab === 'meals' ? (
        <div className="space-y-3">
          {meals.length > 0 ? meals.map((meal: any, i: number) => (
            <div key={i} className="apple-card-static overflow-hidden">
              <button type="button" onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left">
                <div>
                  <span className="text-xs text-brand-bronze font-headline font-semibold uppercase tracking-wider">{meal.meal_type}</span>
                  <p className="font-body text-sm text-brand-cream mt-0.5">{meal.name}</p>
                  {meal.macros && (
                    <p className="text-xs text-brand-cream/40 font-body mt-1">
                      {meal.macros.calories} kcal · {meal.macros.protein}P · {meal.macros.carbs}C · {meal.macros.fats}F
                    </p>
                  )}
                </div>
                <span className={`text-brand-cream/40 transition-transform ${expanded === i ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {expanded === i && (
                <div className="border-t border-white/[0.06] p-6 space-y-4">
                  {meal.ingredients && (
                    <div>
                      <h4 className="text-xs text-brand-cream/50 font-body uppercase tracking-wider mb-2">Ingredients</h4>
                      <ul className="space-y-1">
                        {meal.ingredients.map((ing: any, j: number) => (
                          <li key={j} className="text-sm font-body text-brand-cream/70 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full shrink-0" />
                            {typeof ing === 'string' ? ing : `${ing.amount}${ing.unit ? ' ' + ing.unit : ''} ${ing.item}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {meal.prep_instructions && (
                    <div>
                      <h4 className="text-xs text-brand-cream/50 font-body uppercase tracking-wider mb-2">Prep</h4>
                      <p className="text-sm font-body text-brand-cream/60">{meal.prep_instructions}</p>
                    </div>
                  )}
                  {meal.budget_friendly_swap && (
                    <div>
                      <h4 className="text-xs text-brand-cream/50 font-body uppercase tracking-wider mb-2">Budget Swap</h4>
                      <p className="text-sm font-body text-brand-cream/60">{meal.budget_friendly_swap}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="apple-card-static p-8 text-center">
              <p className="text-brand-cream/40 font-body text-sm">No meals planned for {selectedDay}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groceryList).length > 0 ? Object.entries(groceryList).map(([category, items]: [string, any]) => (
            <div key={category}>
              <h3 className="label-sm mb-3 text-brand-bronze">{category}</h3>
              <div className="space-y-2">
                {(Array.isArray(items) ? items : []).map((item: any, i: number) => (
                  <label key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl cursor-pointer hover:border-brand-bronze/30 transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-[#B19CD9] rounded" />
                    <span className="text-sm font-body text-brand-cream/70">{typeof item === 'string' ? item : item.item}</span>
                  </label>
                ))}
              </div>
            </div>
          )) : (
            <p className="text-brand-cream/40 font-body text-sm">No grocery list available</p>
          )}
        </div>
      )}

      {plan.weekly_nutrition_notes && (
        <div className="mt-8 apple-card-static p-8 border-l-4 border-l-brand-bronze">
          <h3 className="text-xs text-brand-cream/50 font-headline uppercase tracking-wider mb-2">Coach Notes</h3>
          <p className="text-sm font-body text-brand-cream/60">{plan.weekly_nutrition_notes}</p>
        </div>
      )}
    </div>
  )
}
