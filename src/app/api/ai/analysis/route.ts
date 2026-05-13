import { NextResponse } from 'next/server'
import { callClaude, PROMPTS } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json()

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { onboarding: true },
    })

    // Get last 7 days of check-ins
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const checkIns = await prisma.checkIn.findMany({
      where: {
        clientId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    })

    const summary = client?.onboarding?.extractedSummary || 'No onboarding summary available'

    const result = await callClaude(
      PROMPTS.preCallAnalysis,
      `Client profile summary: ${summary}\n\nCheck-in data (last 7 days): ${JSON.stringify(checkIns)}`
    )

    return NextResponse.json({ success: true, analysis: result })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
