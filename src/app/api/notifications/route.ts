import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function currentUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  return user?.id || null
}

export async function GET() {
  try {
    const userId = await currentUserId()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unread = notifications.filter((n) => !n.read).length
    return NextResponse.json({ notifications, unread })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await currentUserId()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json().catch(() => ({}))

    if (body.markAllRead) {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true, updated: result.count })
    }

    if (body.id) {
      const existing = await prisma.notification.findUnique({ where: { id: body.id } })
      if (!existing || existing.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 403 })
      }
      await prisma.notification.update({
        where: { id: body.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Missing id or markAllRead' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
