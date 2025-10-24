import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const periodId = parseInt(resolvedParams.id)
    
    // Get all students
    const students = await db.student.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get payments for this period
    const payments = await db.kasPayment.findMany({
      where: {
        kasPeriodId: periodId
      },
      include: {
        student: true
      }
    })

    // Create payment items with payment status
    const paymentItems = students.map(student => {
      const payment = payments.find(p => p.studentId === student.id)
      return {
        student,
        payment: payment ? {
          id: payment.id,
          amount: payment.amount,
          paidAt: payment.paidAt.toISOString()
        } : null
      }
    })

    return NextResponse.json(paymentItems)
  } catch (error) {
    console.error('Error fetching payment items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment items' },
      { status: 500 }
    )
  }
}