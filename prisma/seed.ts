import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Kas Siswa',
      email: 'admin@kassiswa.sch.id',
      password: hashedPassword,
      role: 'Administrator'
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create sample students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        nis: '2024001',
        name: 'Ahmad Rizki',
        kelas: 'XII IPA 1'
      }
    }),
    prisma.student.create({
      data: {
        nis: '2024002',
        name: 'Siti Nurhaliza',
        kelas: 'XII IPA 2'
      }
    }),
    prisma.student.create({
      data: {
        nis: '2024003',
        name: 'Budi Santoso',
        kelas: 'XII IPS 1'
      }
    }),
    prisma.student.create({
      data: {
        nis: '2024004',
        name: 'Dewi Lestari',
        kelas: 'XI IPA 1'
      }
    }),
    prisma.student.create({
      data: {
        nis: '2024005',
        name: 'Rizky Pratama',
        kelas: 'XI IPS 2'
      }
    })
  ])

  console.log('✅ Created students:', students.length)

  // Create current week kas period
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 5)) // Friday

  const kasPeriod = await prisma.kasPeriod.create({
    data: {
      weekNo: 1,
      startsAt: startOfWeek,
      endsAt: endOfWeek,
      nominal: 20000
    }
  })

  console.log('✅ Created kas period:', kasPeriod.weekNo)

  // Create sample transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        kind: 'income',
        category: 'Kas Siswa',
        description: 'Pembayaran kas mingguan',
        amount: 20000,
        studentId: students[0].id
      }
    }),
    prisma.transaction.create({
      data: {
        kind: 'expense',
        category: 'Operasional',
        description: 'Pembelian alat tulis kantor',
        amount: 150000
      }
    }),
    prisma.transaction.create({
      data: {
        kind: 'income',
        category: 'Donasi',
        description: 'Donasi dari orang tua',
        amount: 500000
      }
    })
  ])

  console.log('✅ Created sample transactions')

  // Create some sample payments
  await Promise.all([
    prisma.kasPayment.create({
      data: {
        studentId: students[0].id,
        kasPeriodId: kasPeriod.id,
        amount: 20000
      }
    }),
    prisma.kasPayment.create({
      data: {
        studentId: students[1].id,
        kasPeriodId: kasPeriod.id,
        amount: 20000
      }
    })
  ])

  console.log('✅ Created sample payments')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })