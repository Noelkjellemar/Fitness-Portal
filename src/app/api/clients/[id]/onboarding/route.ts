import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callClaude, PROMPTS } from '@/lib/ai'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { responses } = await req.json()

    const client = await prisma.user.findUnique({
      where: { id: params.id },
      include: { onboarding: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const responsesJson = JSON.stringify(responses)

    if (client.onboarding) {
      await prisma.onboarding.update({
        where: { id: client.onboarding.id },
        data: {
          responsesJson,
          status: 'completed',
          submittedAt: new Date(),
        },
      })
    } else {
      await prisma.onboarding.create({
        data: {
          clientId: client.id,
          responsesJson,
          status: 'completed',
          submittedAt: new Date(),
        },
      })
    }

    // Update client country
    if (responses.country) {
      await prisma.user.update({
        where: { id: client.id },
        data: { country: responses.country },
      })
    }

    // ========================================
    // AUTO-GENERATE PLANS VIA AI
    // ========================================
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // 1. Extract structured data from onboarding
        const extractedRaw = await callClaude(
          PROMPTS.onboardingExtract,
          `Onboarding form responses:\n${responsesJson}`
        )

        // Save extracted summary
        const onboarding = await prisma.onboarding.findUnique({ where: { clientId: client.id } })
        if (onboarding) {
          await prisma.onboarding.update({
            where: { id: onboarding.id },
            data: { extractedSummary: extractedRaw },
          })
        }

        // 2. Generate Week 1 workout plan
        const workoutRaw = await callClaude(
          PROMPTS.workoutPlan,
          `Client profile: ${extractedRaw}\n\nGenerate workout plan for Week 1, Phase 1.`
        )

        await prisma.workoutPlan.create({
          data: {
            clientId: client.id,
            week: 1,
            phase: 1,
            planJson: workoutRaw,
            createdBy: 'ai',
            publishedAt: new Date(),
          },
        })

        // 3. Generate Week 1 nutrition plan
        const nutritionRaw = await callClaude(
          PROMPTS.nutritionPlan,
          `Client profile: ${extractedRaw}\nCountry: ${responses.country || 'unknown'}\n\nGenerate 7-day meal plan for Week 1.`
        )

        let groceryList = '{}'
        try {
          const parsed = JSON.parse(nutritionRaw)
          if (parsed.grocery_list) groceryList = JSON.stringify(parsed.grocery_list)
        } catch {}

        await prisma.nutritionPlan.create({
          data: {
            clientId: client.id,
            week: 1,
            planJson: nutritionRaw,
            groceryListJson: groceryList,
            publishedAt: new Date(),
          },
        })

        console.log(`[AI] Plans generated for ${client.name} (${client.id})`)
      } catch (aiErr: any) {
        console.error('[AI] Plan generation failed:', aiErr.message)
        // Don't fail the onboarding submission if AI fails
      }
    } else {
      console.log('[AI] ANTHROPIC_API_KEY not set — skipping plan generation')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
