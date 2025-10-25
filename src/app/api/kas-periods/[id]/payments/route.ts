import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { students, kasPayments } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const periodId = parseInt(resolvedParams.id)
    
    // Get all students
    const allStudents = await db
      .select()
      .from(students)
      .orderBy(asc(students.name))

    // Get payments for this period with student data
    const payments = await db
      .select({
        id: kasPayments.id,
        amount: kasPayments.amount,
        paidAt: kasPayments.paidAt,
        studentId: kasPayments.studentId,
        student: students,
      })
      .from(kasPayments)
      .innerJoin(students, eq(kasPayments.studentId, students.id))
      .where(eq(kasPayments.kasPeriodId, periodId))

    // Create payment items with payment status
    const paymentItems = allStudents.map(student => {
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