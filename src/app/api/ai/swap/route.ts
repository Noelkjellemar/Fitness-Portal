import { NextResponse } from 'next/server'
import { callClaude, PROMPTS } from '@/lib/ai'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { meal, restrictions, country, budgetTier } = await req.json()

    const result = await callClaude(
      PROMPTS.mealSwap,
      `Current meal: ${JSON.stringify(meal)}\nClient restrictions: ${JSON.stringify(restrictions)}\nCountry: ${country}\nBudget tier: ${budgetTier}\n\nSuggest 3 alternative meals.`
    )

    return NextResponse.json({ success: true, alternatives: JSON.parse(result) })
  } catch (error: any) {
    console.error('Meal swap error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
