import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `progress/${user.id}_${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'public', addRandomSuffix: false })
    const url = blob.url

    const photo = await prisma.progressPhoto.create({
      data: {
        clientId: user.id,
        url,
        angle: (formData.get('angle') as string) || null,
      },
    })

    return NextResponse.json({ success: true, photo })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
