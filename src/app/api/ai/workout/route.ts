import { NextResponse } from 'next/server'
import { callClaude, PROMPTS } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { clientId, week, phase } = await req.json()

    if (!clientId || !week || !phase) {
      return NextResponse.json({ error: 'Missing clientId, week, or phase' }, { status: 400 })
    }

    // Get client profile
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { onboarding: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const profile = client.onboarding?.extractedSummary || client.onboarding?.responsesJson || '{}'

    const result = await callClaude(
      PROMPTS.workoutPlan,
      `Client profile: ${profile}\n\nGenerate workout plan for Week ${week}, Phase ${phase}.`
    )

    // Save to database
    await prisma.workoutPlan.create({
      data: {
        clientId,
        week,
        phase,
        planJson: result,
        createdBy: 'ai',
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, plan: JSON.parse(result) })
  } catch (error: any) {
    console.error('Workout generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
