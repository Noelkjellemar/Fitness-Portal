import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id

    // Delete all related data first (cascade)
    await prisma.checkIn.deleteMany({ where: { clientId } })
    await prisma.workoutPlan.deleteMany({ where: { clientId } })
    await prisma.nutritionPlan.deleteMany({ where: { clientId } })
    await prisma.progressPhoto.deleteMany({ where: { clientId } })
    await prisma.measurement.deleteMany({ where: { clientId } })
    await prisma.performanceLog.deleteMany({ where: { clientId } })
    await prisma.notification.deleteMany({ where: { userId: clientId } })
    await prisma.onboarding.deleteMany({ where: { clientId } })
    await prisma.coachClient.deleteMany({ where: { clientId } })

    // Delete the user
    await prisma.user.delete({ where: { id: clientId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE CLIENT ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
