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
    const { weightKg, bodyFatPct, measurements } = body

    const measurement = await prisma.measurement.create({
      data: {
        clientId: user.id,
        weightKg: weightKg != null ? parseFloat(weightKg) : null,
        bodyFatPct: bodyFatPct != null ? parseFloat(bodyFatPct) : null,
        measurementsJson: measurements ? JSON.stringify(measurements) : null,
      },
    })

    return NextResponse.json({ success: true, measurement })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
