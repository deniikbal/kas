import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    const existingPayment = await db.kasPayment.findFirst({
      where: {
        studentId,
        kasPeriodId
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already recorded for this student and period' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await db.kasPayment.create({
      data: {
        studentId,
        kasPeriodId,
        amount
      }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        kind: 'income',
        category: 'kas',
        amount,
        studentId,
        description: `Pembayaran kas mingguan - siswa ID: ${studentId}`
      }
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