import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { logs } = body as { logs: { exercise: string; value: number; unit: string }[] }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: 'No performance data provided' }, { status: 400 })
    }

    const created = await prisma.$transaction(
      logs
        .filter((l) => l.value != null && l.value > 0)
        .map((l) =>
          prisma.performanceLog.create({
            data: {
              clientId: user.id,
              exercise: l.exercise,
              value: parseFloat(String(l.value)),
              unit: l.unit,
            },
          })
        )
    )

    return NextResponse.json({ success: true, count: created.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
