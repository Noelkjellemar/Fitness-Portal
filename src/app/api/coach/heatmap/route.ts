import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DAY_MS = 1000 * 60 * 60 * 24

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const coach = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!coach || (coach.role !== 'coach' && coach.role !== 'main-coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const since = new Date(Date.now() - 28 * DAY_MS)

    const clients =
      coach.role === 'main-coach'
        ? await prisma.user.findMany({
            where: { role: 'client' },
            select: {
              id: true,
              name: true,
              checkIns: {
                where: { date: { gte: since } },
                select: { date: true, trained: true },
              },
            },
            orderBy: { name: 'asc' },
          })
        : (
            await prisma.coachClient.findMany({
              where: { coachId: coach.id },
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    checkIns: {
                      where: { date: { gte: since } },
                      select: { date: true, trained: true },
                    },
                  },
                },
              },
            })
          ).map((cc) => cc.client)

    return NextResponse.json(
      clients.map((c) => ({
        id: c.id,
        name: c.name,
        checkIns: c.checkIns.map((ci) => ({ date: ci.date.toISOString(), trained: ci.trained })),
      })),
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
