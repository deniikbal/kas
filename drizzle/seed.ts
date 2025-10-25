import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import * as schema from '../src/lib/db/schema'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client, { schema })

async function main() {
  console.log('🌱 Seeding database with Drizzle...')

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        name: 'Admin Kas Siswa',
        email: 'admin@kassiswa.sch.id',
        password: hashedPassword,
        role: 'Administrator',
      })
      .returning()
      .catch(() => [null]) // Ignore if already exists

    if (adminUser) {
      console.log('✅ Created admin user:', adminUser.email)
    } else {
      console.log('ℹ️ Admin user already exists')
    }

    // Create sample students
    const studentsData = [
      { nis: '2024001', name: 'Ahmad Rizki', kelas: 'XII IPA 1' },
      { nis: '2024002', name: 'Siti Nurhaliza', kelas: 'XII IPA 2' },
      { nis: '2024003', name: 'Budi Santoso', kelas: 'XII IPS 1' },
      { nis: '2024004', name: 'Dewi Lestari', kelas: 'XI IPA 1' },
      { nis: '2024005', name: 'Rizky Pratama', kelas: 'XI IPS 2' },
    ]

    const students = []
    for (const student of studentsData) {
      const [created] = await db
        .insert(schema.students)
        .values(student)
        .returning()
        .catch(() => [null])
      
      if (created) {
        students.push(created)
      } else {
        // Get existing student
        const [existing] = await db
          .select()
          .from(schema.students)
          .where(eq(schema.students.nis, student.nis))
          .limit(1)
        if (existing) students.push(existing)
      }
    }

    console.log('✅ Students ready:', students.length)

    // Create current week kas period
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 5))

    const [kasPeriod] = await db
      .insert(schema.kasPeriods)
      .values({
        weekNo: 1,
        startsAt: startOfWeek,
        endsAt: endOfWeek,
        nominal: 20000,
      })
      .returning()
      .catch(() => [null])

    if (kasPeriod) {
      console.log('✅ Created kas period: Week', kasPeriod.weekNo)
    } else {
      console.log('ℹ️ Kas period already exists')
    }

    // Create sample transactions
    const transactionsData = [
      {
        kind: 'income',
        category: 'Kas Siswa',
        description: 'Pembayaran kas mingguan',
        amount: 20000,
        studentId: students[0]?.id || null,
      },
      {
        kind: 'expense',
        category: 'Operasional',
        description: 'Pembelian alat tulis kantor',
        amount: 150000,
        studentId: null,
      },
      {
        kind: 'income',
        category: 'Donasi',
        description: 'Donasi dari orang tua',
        amount: 500000,
        studentId: null,
      },
    ]

    for (const transaction of transactionsData) {
      await db
        .insert(schema.transactions)
        .values(transaction)
        .catch(() => {})
    }

    console.log('✅ Created sample transactions')

    // Create sample payments if kasPeriod exists
    if (kasPeriod && students.length >= 2) {
      const paymentsData = [
        { studentId: students[0].id, kasPeriodId: kasPeriod.id, amount: 20000 },
        { studentId: students[1].id, kasPeriodId: kasPeriod.id, amount: 20000 },
      ]

      for (const payment of paymentsData) {
        await db
          .insert(schema.kasPayments)
          .values(payment)
          .catch(() => {})
      }

      console.log('✅ Created sample payments')
    }

    console.log('🎉 Database seeding completed with Drizzle!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await client.end()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
