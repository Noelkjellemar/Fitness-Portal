import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOnboardingEmail } from '@/lib/email'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.user.findUnique({
      where: { id: params.id },
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
    if (process.env.RESEND_API_KEY) {
      const result = await sendOnboardingEmail(
        client.email,
        client.name || 'there',
        onboardingUrl
      )
      console.log('[EMAIL] Onboarding sent:', result)
    } else {
      console.log('[EMAIL] RESEND_API_KEY not set — skipping email')
      console.log('[EMAIL] Would send to:', client.email)
      console.log('[EMAIL] Onboarding URL:', onboardingUrl)
    }

    return NextResponse.json({
      success: true,
      message: `Onboarding form sent to ${client.email}`,
      onboardingUrl,
    })
  } catch (error: any) {
    console.error('[EMAIL ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
