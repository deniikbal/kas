import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total students
    const totalStudents = await db.student.count()

    // Get total income and expense from transactions
    const transactions = await db.transaction.findMany()
    const totalIncome = transactions
      .filter(t => t.kind === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter(t => t.kind === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentBalance = totalIncome - totalExpense

    // Get current week period
    const now = new Date()
    const currentWeek = await db.kasPeriod.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now }
      }
    })

    let currentWeekPayments = 0
    let pendingPayments = 0

    if (currentWeek) {
      // Get payments for current week
      const payments = await db.kasPayment.findMany({
        where: {
          kasPeriodId: currentWeek.id
        }
      })
      currentWeekPayments = payments.length

      // Calculate pending payments
      const allStudents = await db.student.count()
      pendingPayments = allStudents - currentWeekPayments
    }

    const stats = {
      totalStudents,
      totalIncome,
      totalExpense,
      currentBalance,
      currentWeekPayments,
      pendingPayments
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}