import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { clientId: user.id },
      orderBy: { date: 'desc' },
      take: 30,
    })

    return NextResponse.json(checkIns)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()

    const checkIn = await prisma.checkIn.create({
      data: {
        clientId: user.id,
        date: body.date ? new Date(body.date) : new Date(),
        weightKg: body.weightKg != null ? parseFloat(body.weightKg) : null,
        steps: body.steps != null ? parseInt(body.steps) : null,
        waterMl: body.waterLitres != null ? Math.round(body.waterLitres * 1000) : null,
        sleepHours: body.sleepHours != null ? parseFloat(body.sleepHours) : null,
        sleepQuality: body.sleepQuality != null ? parseInt(body.sleepQuality) : null,
        nutritionCompliance: body.nutritionCompliance ?? null,
        offPlanMeals: body.offPlanMeals || null,
        trained: body.trained ?? false,
        workoutName: body.workoutName || null,
        workoutPerformance: body.workoutPerformance != null ? parseInt(body.workoutPerformance) : null,
        trainingLogJson: body.trainingLogJson || null,
        energy: body.energy != null ? parseInt(body.energy) : null,
        mood: body.mood != null ? parseInt(body.mood) : null,
        stressLevel: body.stressLevel != null ? parseInt(body.stressLevel) : null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ success: true, checkIn })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
