import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zenith.com' },
    update: { hashedPassword: password, role: 'main-coach' },
    create: {
      email: 'admin@zenith.com',
      name: 'Zenith Admin',
      hashedPassword: password,
      role: 'main-coach',
    },
  })

  await prisma.user.upsert({
    where: { email: 'coach@zenith.com' },
    update: { hashedPassword: password, role: 'coach' },
    create: {
      email: 'coach@zenith.com',
      name: 'Coach Demo',
      hashedPassword: password,
      role: 'coach',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: { hashedPassword: password },
    create: {
      email: 'client@demo.com',
      name: 'Marcus',
      hashedPassword: password,
      role: 'client',
      country: 'Netherlands',
    },
  })

  await prisma.coachClient.upsert({
    where: { coachId_clientId: { coachId: admin.id, clientId: client.id } },
    update: {},
    create: { coachId: admin.id, clientId: client.id, tier: 'elite' },
  })

  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
