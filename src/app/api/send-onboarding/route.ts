import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOnboardingEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json()

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { onboarding: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create or update onboarding record
    if (client.onboarding) {
      await prisma.onboarding.update({
        where: { id: client.onboarding.id },
        data: { status: 'sent' },
      })
    } else {
      await prisma.onboarding.create({
        data: {
          clientId: client.id,
          responsesJson: '{}',
          status: 'sent',
        },
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://zenith.vercel.app'
    const onboardingUrl = `${baseUrl}/client/onboarding?token=${client.id}`

    // Send email via Resend
    let emailResult: any = null
    const hasKey = !!process.env.RESEND_API_KEY
    if (hasKey) {
      try {
        emailResult = await sendOnboardingEmail(
          client.email,
          client.name || 'there',
          onboardingUrl
        )
      } catch (emailErr: any) {
        emailResult = { error: emailErr.message }
      }
    } else {
      emailResult = { skipped: true, reason: 'RESEND_API_KEY not set' }
    }

    return NextResponse.json({
      success: true,
      message: `Onboarding form sent to ${client.email}`,
      onboardingUrl,
      emailResult,
    })
  } catch (error: any) {
    console.error('[SEND-ONBOARDING ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
