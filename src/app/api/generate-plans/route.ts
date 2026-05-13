import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callClaude, PROMPTS } from '@/lib/ai'

// Allow up to 300 seconds for AI generation (requires Vercel Pro)
export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { clientId, week, phase, coachNotes, type } = await req.json()

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { onboarding: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const profile = client.onboarding?.extractedSummary || client.onboarding?.responsesJson || '{}'
    const w = week || 1
    const p = phase || 1
    const coachContext = coachNotes ? `\n\nCOACH NOTES (important — follow these instructions carefully):\n${coachNotes}` : ''

    const generateType = type || 'both'

    if (generateType === 'workout' || generateType === 'both') {
      let workoutRaw = await callClaude(
        PROMPTS.workoutPlan,
        `Client profile: ${profile}${coachContext}\n\nGenerate workout plan for Week ${w}, Phase ${p}.`
      )

      // Validate and clean JSON before saving
      try {
        const jsonMatch = workoutRaw.match(/\{[\s\S]*\}/)
        if (jsonMatch) workoutRaw = jsonMatch[0]
        JSON.parse(workoutRaw) // validate it's parseable
      } catch {
        console.error('[GENERATE-PLANS] Invalid workout JSON from AI:', workoutRaw.substring(0, 500))
        return NextResponse.json({ error: 'AI returned invalid JSON for workout plan. Please try again.' }, { status: 500 })
      }

      await prisma.workoutPlan.create({
        data: {
          clientId,
          week: w,
          phase: p,
          planJson: workoutRaw,
          createdBy: 'ai',
          publishedAt: new Date(),
        },
      })
    }

    if (generateType === 'nutrition' || generateType === 'both') {
      let nutritionRaw = await callClaude(
        PROMPTS.nutritionPlan,
        `Client profile: ${profile}\nCountry: ${client.country || 'unknown'}${coachContext}\n\nGenerate 7-day meal plan for Week ${w}.`
      )

      // Validate and clean JSON before saving
      let parsed
      try {
        const jsonMatch = nutritionRaw.match(/\{[\s\S]*\}/)
        if (jsonMatch) nutritionRaw = jsonMatch[0]
        parsed = JSON.parse(nutritionRaw)
      } catch {
        console.error('[GENERATE-PLANS] Invalid nutrition JSON from AI:', nutritionRaw.substring(0, 500))
        return NextResponse.json({ error: 'AI returned invalid JSON for nutrition plan. Please try again.' }, { status: 500 })
      }

      const groceryList = parsed.grocery_list ? JSON.stringify(parsed.grocery_list) : '{}'

      await prisma.nutritionPlan.create({
        data: {
          clientId,
          week: w,
          planJson: nutritionRaw,
          groceryListJson: groceryList,
          publishedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, message: `${generateType} plan(s) generated for Week ${w} Phase ${p}` })
  } catch (error: any) {
    console.error('[GENERATE-PLANS ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
