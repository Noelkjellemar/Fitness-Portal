import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not set')
  return new Resend(key)
}

const FROM = process.env.EMAIL_FROM || 'Zenith <onboarding@resend.dev>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'coach@zenith.com'

export async function sendOnboardingEmail(to: string, clientName: string, onboardingUrl: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Your Zenith begins here, ${clientName}`,
    text: `Welcome, ${clientName}.

Your transformation starts now. Before we build your personalised protocol, we need to understand exactly where you are — physically, mentally, and in your lifestyle.

Complete the onboarding form below. It takes about 15 minutes. Be honest — the more we know, the better your protocol will be.

Complete your onboarding: ${onboardingUrl}

What happens next:
1. Complete the onboarding form (15 min)
2. Your coach reviews your responses personally
3. Your bespoke training & nutrition plans are built
4. You receive access to the portal within 24 hours

Please complete this within 48 hours. If you have questions, reply to this email.

— Zenith · Reach Your Peak`,
    html: `
      <div style="background:#0A0A0A;color:#F3EFFD;font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0;">
            <span style="color:#B19CD9;">Zenith</span>FITNESS
          </h1>
          <p style="color:#B19CD9;font-style:italic;margin-top:4px;font-size:14px;">Zenith</p>
        </div>

        <div style="background:#1A1A1A;border-left:4px solid #B19CD9;border-radius:0 8px 8px 0;padding:32px;margin-bottom:32px;">
          <h2 style="font-size:20px;margin:0 0 12px;">Welcome, ${clientName}.</h2>
          <p style="color:#F3EFFDCC;line-height:1.7;margin:0 0 20px;">
            Your transformation starts now. Before we build your personalised protocol, we need to understand exactly where you are — physically, mentally, and in your lifestyle.
          </p>
          <p style="color:#F3EFFDCC;line-height:1.7;margin:0 0 24px;">
            Complete the onboarding form below. It takes about 15 minutes. Be honest — the more we know, the better your protocol will be.
          </p>
          <a href="${onboardingUrl}" style="display:inline-block;background:linear-gradient(135deg,#B19CD9,#C8B6E5);color:#0A0A0A;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:50px;font-size:16px;letter-spacing:0.5px;">
            COMPLETE YOUR ONBOARDING →
          </a>
        </div>

        <div style="background:#1A1A1A;border-radius:8px;padding:24px;margin-bottom:32px;">
          <p style="color:#B19CD9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">What happens next</p>
          <ol style="color:#F3EFFD99;line-height:1.8;margin:0;padding-left:20px;">
            <li>Complete the onboarding form (15 min)</li>
            <li>Your coach reviews your responses personally</li>
            <li>Your bespoke training & nutrition plans are built</li>
            <li>You receive access to the portal within 24 hours</li>
          </ol>
        </div>

        <p style="color:#F3EFFD66;font-size:12px;text-align:center;">
          Please complete this within 48 hours. If you have questions, reply to this email.
        </p>

        <div style="border-top:1px solid #2A2A2A;margin-top:32px;padding-top:20px;text-align:center;">
          <p style="color:#F3EFFD33;font-size:11px;margin:0;">© ${new Date().getFullYear()} zenith · Zenith</p>
        </div>
      </div>
    `,
  })
}

export async function sendPlanReadyEmail(to: string, clientName: string, loginUrl: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Your protocol is ready, ${clientName}`,
    text: `Your protocol is live, ${clientName}.

Your personalised training and nutrition plans are ready. Log in to the portal to see your full protocol.

Log in here: ${loginUrl}

— Zenith · Reach Your Peak`,
    html: `
      <div style="background:#0A0A0A;color:#F3EFFD;font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0;">
            <span style="color:#B19CD9;">Zenith</span>FITNESS
          </h1>
        </div>
        <div style="background:#1A1A1A;border-left:4px solid #B19CD9;border-radius:0 8px 8px 0;padding:32px;">
          <h2 style="font-size:20px;margin:0 0 12px;">Your protocol is live, ${clientName}.</h2>
          <p style="color:#F3EFFDCC;line-height:1.7;margin:0 0 24px;">
            Your personalised training and nutrition plans are ready. Log in to the portal to see your full protocol.
          </p>
          <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#B19CD9,#C8B6E5);color:#0A0A0A;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:50px;font-size:16px;">
            ENTER THE PROTOCOL →
          </a>
        </div>
        <div style="border-top:1px solid #2A2A2A;margin-top:32px;padding-top:20px;text-align:center;">
          <p style="color:#F3EFFD33;font-size:11px;margin:0;">© ${new Date().getFullYear()} zenith</p>
        </div>
      </div>
    `,
  })
}

export async function sendCheckInReminder(to: string, clientName: string, logUrl: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Quick check-in, ${clientName}`,
    text: `Hey ${clientName},

We haven't heard from you today. A quick check-in keeps your coach informed and your momentum going.

Log your check-in here: ${logUrl}

Takes less than 5 minutes.

— Zenith · Reach Your Peak`,
    html: `
      <div style="background:#0A0A0A;color:#F3EFFD;font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:20px;font-weight:700;letter-spacing:2px;margin:0;">
            <span style="color:#B19CD9;">Zenith</span>FITNESS
          </h1>
        </div>
        <div style="background:#1A1A1A;border-left:4px solid #B19CD9;border-radius:0 8px 8px 0;padding:24px;">
          <p style="color:#F3EFFDCC;line-height:1.7;margin:0 0 16px;">
            Hey ${clientName} — we haven't heard from you today. A quick check-in keeps your coach informed and your momentum going.
          </p>
          <a href="${logUrl}" style="display:inline-block;background:linear-gradient(135deg,#B19CD9,#C8B6E5);color:#0A0A0A;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:50px;font-size:14px;">
            LOG TODAY'S CHECK-IN →
          </a>
        </div>
        <p style="color:#F3EFFD44;font-size:11px;text-align:center;margin-top:24px;">Takes less than 5 minutes.</p>
      </div>
    `,
  })
}
