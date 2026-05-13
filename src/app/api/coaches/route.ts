import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: { in: ['coach', 'main-coach'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(coaches)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
