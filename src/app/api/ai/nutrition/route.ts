import { NextResponse } from 'next/server'
import { callClaude, PROMPTS } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { clientId, week } = await req.json()

    if (!clientId || !week) {
      return NextResponse.json({ error: 'Missing clientId or week' }, { status: 400 })
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { onboarding: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const profile = client.onboarding?.extractedSummary || client.onboarding?.responsesJson || '{}'

    const result = await callClaude(
      PROMPTS.nutritionPlan,
      `Client profile: ${profile}\nCountry: ${client.country || 'unknown'}\n\nGenerate 7-day meal plan for Week ${week}.`
    )

    const parsed = JSON.parse(result)

    await prisma.nutritionPlan.create({
      data: {
        clientId,
        week,
        planJson: result,
        groceryListJson: JSON.stringify(parsed.grocery_list || {}),
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, plan: parsed })
  } catch (error: any) {
    console.error('Nutrition generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
