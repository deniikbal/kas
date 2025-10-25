import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { kasPayments, transactions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { studentId, kasPeriodId, amount } = await request.json()

    if (!studentId || !kasPeriodId || !amount) {
      return NextResponse.json(
        { error: 'Student ID, Kas Period ID, and amount are required' },
        { status: 400 }
      )
    }

    // Check if payment already exists
    const existingPayment = await db
      .select()
      .from(kasPayments)
      .where(and(eq(kasPayments.studentId, studentId), eq(kasPayments.kasPeriodId, kasPeriodId)))
      .limit(1)

    if (existingPayment.length > 0) {
      return NextResponse.json(
        { error: 'Payment already recorded for this student and period' },
        { status: 400 }
      )
    }

    // Create payment
    const [payment] = await db
      .insert(kasPayments)
      .values({
        studentId,
        kasPeriodId,
        amount,
      })
      .returning()

    // Create transaction record
    await db
      .insert(transactions)
      .values({
        kind: 'income',
        category: 'kas',
        amount,
        studentId,
        description: `Pembayaran kas mingguan - siswa ID: ${studentId}`,
      })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating kas payment:', error)
    return NextResponse.json(
      { error: 'Failed to create kas payment' },
      { status: 500 }
    )
  }
}