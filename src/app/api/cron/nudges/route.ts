import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCheckInReminder } from '@/lib/email'

const DAY_MS = 1000 * 60 * 60 * 24

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const since48h = new Date(now - 2 * DAY_MS)
  const since5d = new Date(now - 5 * DAY_MS)
  const since24h = new Date(now - DAY_MS)
  const logUrl = (process.env.NEXTAUTH_URL || 'https://zenith.vercel.app') + '/client/log'

  const errors: { clientId: string; error: string }[] = []
  let sent = 0
  let flagged = 0

  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      include: {
        checkIns: { where: { date: { gte: since5d } }, select: { date: true, trained: true } },
        clientCoach: { select: { coachId: true } },
        notifications: {
          where: { createdAt: { gte: since24h } },
          select: { type: true },
        },
      },
    })

    for (const client of clients) {
      try {
        const lastCheckIn = client.checkIns.length
          ? client.checkIns.reduce((latest, ci) => (ci.date > latest ? ci.date : latest), client.checkIns[0].date)
          : null

        const reminderSent = client.notifications.some((n) => n.type === 'check-in-reminder')
        if ((!lastCheckIn || lastCheckIn < since48h) && client.email && !reminderSent) {
          await sendCheckInReminder(client.email, client.name || 'Athlete', logUrl)
          await prisma.notification.create({
            data: {
              userId: client.id,
              type: 'check-in-reminder',
              message: 'Reminder sent: no check-in in 48 hours',
            },
          })
          sent++
        }

        const trainedDays = new Set(
          client.checkIns
            .filter((ci) => ci.trained && ci.date >= since5d)
            .map((ci) => ci.date.toISOString().slice(0, 10)),
        )
        const compliance5d = trainedDays.size / 5

        const coachId = client.clientCoach[0]?.coachId
        if (compliance5d < 0.6 && coachId) {
          const recentFlag = await prisma.notification.findFirst({
            where: {
              userId: coachId,
              type: 'low-compliance',
              message: { contains: client.id },
              createdAt: { gte: since24h },
            },
          })
          if (!recentFlag) {
            await prisma.notification.create({
              data: {
                userId: coachId,
                type: 'low-compliance',
                message: `Client ${client.name || client.email} (${client.id}) compliance dropped to ${Math.round(compliance5d * 100)}% over 5 days`,
              },
            })
            flagged++
          }
        }
      } catch (err: any) {
        errors.push({ clientId: client.id, error: err?.message || String(err) })
      }
    }

    return NextResponse.json({ sent, flagged, errors, processed: clients.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, sent, flagged, errors }, { status: 500 })
  }
}
