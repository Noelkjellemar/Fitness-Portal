import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

// GET all clients (with coach info)
export async function GET() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      include: {
        clientCoach: {
          include: { coach: { select: { id: true, name: true, email: true } } },
        },
        checkIns: { orderBy: { date: 'desc' }, take: 7 },
        onboarding: { select: { status: true, submittedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = clients.map((c) => {
      const assignment = c.clientCoach[0]
      const recentCheckIns = c.checkIns
      const lastCheckIn = recentCheckIns[0]
      const compliance = recentCheckIns.length > 0
        ? Math.round((recentCheckIns.filter((ci) => ci.trained).length / recentCheckIns.length) * 100)
        : 0
      const avgMood = recentCheckIns.length > 0
        ? +(recentCheckIns.filter((ci) => ci.mood).reduce((a, ci) => a + (ci.mood || 0), 0) / recentCheckIns.filter((ci) => ci.mood).length).toFixed(1)
        : null

      const daysSinceCheckIn = lastCheckIn
        ? Math.floor((Date.now() - new Date(lastCheckIn.date).getTime()) / (1000 * 60 * 60 * 24))
        : null

      let status = 'INACTIVE'
      if (daysSinceCheckIn === null) status = 'NEW'
      else if (daysSinceCheckIn <= 1) status = 'ON TRACK'
      else if (daysSinceCheckIn <= 3) status = 'ON TRACK'
      else if (daysSinceCheckIn <= 7) status = 'NEEDS ATTENTION'

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        country: c.country,
        createdAt: c.createdAt,
        coach: assignment?.coach || null,
        tier: assignment?.tier || 'unassigned',
        compliance,
        avgMood,
        lastCheckIn: lastCheckIn?.date || null,
        daysSinceCheckIn,
        status,
        onboardingStatus: c.onboarding?.status || 'not sent',
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new client
export async function POST(req: Request) {
  try {
    const { name, email, country, coachId, tier } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const tempPassword = await bcrypt.hash('welcome123', 10)

    const client = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        hashedPassword: tempPassword,
        role: 'client',
        country: country || null,
      },
    })

    // Assign to coach if provided
    if (coachId) {
      await prisma.coachClient.create({
        data: {
          coachId,
          clientId: client.id,
          tier: tier || 'elite',
        },
      })
    }

    // Send welcome email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.EMAIL_FROM || 'Zenith <onboarding@resend.dev>'
        const replyTo = process.env.EMAIL_REPLY_TO || 'coach@zenith.com'
        const loginUrl = (process.env.NEXTAUTH_URL || 'https://zenith.vercel.app') + '/login'

        await resend.emails.send({
          from,
          replyTo,
          to: client.email,
          subject: `Welcome to Zenith, ${name}`,
          text: `Welcome, ${name}.

Your account has been created. Here are your login credentials:

Email: ${client.email}
Password: welcome123

Please change your password after your first login.

Log in here: ${loginUrl}

— Zenith · Reach Your Peak`,
          html: `
            <div style="background:#0A0A0A;color:#F3EFFD;font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
              <div style="text-align:center;margin-bottom:32px;">
                <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0;">
                  <span style="color:#B19CD9;">Zenith</span>FITNESS
                </h1>
                <p style="color:#B19CD9;font-style:italic;margin-top:4px;font-size:14px;">Zenith</p>
              </div>
              <div style="background:#1A1A1A;border-left:4px solid #B19CD9;border-radius:0 8px 8px 0;padding:32px;">
                <h2 style="font-size:20px;margin:0 0 16px;">Welcome, ${name}.</h2>
                <p style="color:#F3EFFDCC;line-height:1.7;margin:0 0 20px;">
                  Your account has been created. Here are your login credentials:
                </p>
                <div style="background:#0A0A0A;border-radius:8px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 8px;color:#F3EFFDAA;font-size:14px;"><strong style="color:#B19CD9;">Email:</strong> ${client.email}</p>
                  <p style="margin:0;color:#F3EFFDAA;font-size:14px;"><strong style="color:#B19CD9;">Password:</strong> welcome123</p>
                </div>
                <p style="color:#F3EFFD80;font-size:13px;margin:0 0 24px;">
                  Please change your password after your first login.
                </p>
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#B19CD9,#C8B6E5);color:#0A0A0A;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:50px;font-size:16px;">
                  LOG IN TO YOUR PORTAL →
                </a>
              </div>
              <div style="border-top:1px solid #2A2A2A;margin-top:32px;padding-top:20px;text-align:center;">
                <p style="color:#F3EFFD33;font-size:11px;margin:0;">© ${new Date().getFullYear()} zenith · Zenith</p>
              </div>
            </div>
          `,
        })
      } catch (emailErr: any) {
        console.error('[WELCOME EMAIL ERROR]', emailErr)
      }
    }

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
