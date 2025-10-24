import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create sample students
    const students = await Promise.all([
      db.student.create({
        data: {
          nis: '2024001',
          name: 'Ahmad Rizki',
          kelas: 'X-A'
        }
      }),
      db.student.create({
        data: {
          nis: '2024002',
          name: 'Siti Nurhaliza',
          kelas: 'X-A'
        }
      }),
      db.student.create({
        data: {
          nis: '2024003',
          name: 'Budi Santoso',
          kelas: 'X-B'
        }
      }),
      db.student.create({
        data: {
          nis: '2024004',
          name: 'Dewi Lestari',
          kelas: 'XI-A'
        }
      }),
      db.student.create({
        data: {
          nis: '2024005',
          name: 'Eko Prasetyo',
          kelas: 'XI-B'
        }
      })
    ])

    // Create current kas period
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const kasPeriod = await db.kasPeriod.create({
      data: {
        weekNo: 1,
        nominal: 20000,
        startsAt: startOfWeek,
        endsAt: endOfWeek
      }
    })

    // Create some sample payments
    await db.kasPayment.createMany({
      data: [
        {
          studentId: students[0].id,
          kasPeriodId: kasPeriod.id,
          amount: 20000
        },
        {
          studentId: students[2].id,
          kasPeriodId: kasPeriod.id,
          amount: 20000
        }
      ]
    })

    // Create corresponding income transactions
    await db.transaction.createMany({
      data: [
        {
          kind: 'income',
          category: 'kas',
          amount: 20000,
          studentId: students[0].id,
          description: 'Pembayaran kas mingguan'
        },
        {
          kind: 'income',
          category: 'kas',
          amount: 20000,
          studentId: students[2].id,
          description: 'Pembayaran kas mingguan'
        }
      ]
    })

    // Create sample expense transactions
    await db.transaction.createMany({
      data: [
        {
          kind: 'expense',
          category: 'ATK',
          amount: 150000,
          description: 'Pembelian alat tulis kantor'
        },
        {
          kind: 'expense',
          category: 'Kebersihan',
          amount: 75000,
          description: 'Jasa kebersihan kelas'
        },
        {
          kind: 'expense',
          category: 'Listrik',
          amount: 200000,
          description: 'Pembayaran listrik bulanan'
        }
      ]
    })

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      students: students.length,
      kasPeriod: 1,
      payments: 2,
      expenses: 3
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}