import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compliancePct, computePhase, weeksSinceStart } from '@/lib/phase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        clientCoach: {
          include: { coach: { select: { id: true, name: true } } },
        },
        onboarding: true,
        checkIns: { orderBy: { date: 'desc' }, take: 28 },
        workoutPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        nutritionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        measurements: { orderBy: { date: 'desc' }, take: 5 },
        progressPhotos: { orderBy: { date: 'desc' }, take: 6 },
        performanceLogs: { orderBy: { date: 'desc' }, take: 10 },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const week = weeksSinceStart(user.createdAt)
    const compliance28 = compliancePct(
      user.checkIns.map((c) => ({ trained: c.trained, date: c.date })),
      28,
    )
    const phaseInfo = computePhase(week, compliance28)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
      coach: user.clientCoach[0]?.coach || null,
      tier: user.clientCoach[0]?.tier || 'unassigned',
      onboarding: user.onboarding,
      currentWorkout: user.workoutPlans[0] || null,
      currentNutrition: user.nutritionPlans[0] || null,
      recentCheckIns: user.checkIns,
      measurements: user.measurements,
      photos: user.progressPhotos,
      performanceLogs: user.performanceLogs,
      week,
      phase: phaseInfo.phase,
      phaseLabel: phaseInfo.label,
      stalled: phaseInfo.stalled,
      compliance28d: Math.round(compliance28 * 100),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { name, country } = body

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name }),
        ...(country !== undefined && { country }),
      },
      select: { id: true, name: true, email: true, country: true },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
