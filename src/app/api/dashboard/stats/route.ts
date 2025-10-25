import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { students, transactions, kasPeriods, kasPayments } from '@/lib/db/schema'
import { eq, and, lte, gte, count } from 'drizzle-orm'

export const runtime = 'edge';

export async function GET() {
  try {
    // Get total students
    const [{ value: totalStudents }] = await db
      .select({ value: count() })
      .from(students)

    // Get total income and expense from transactions
    const allTransactions = await db.select().from(transactions)
    const totalIncome = allTransactions
      .filter(t => t.kind === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = allTransactions
      .filter(t => t.kind === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentBalance = totalIncome - totalExpense

    // Get current week period
    const now = new Date()
    const [currentWeek] = await db
      .select()
      .from(kasPeriods)
      .where(and(lte(kasPeriods.startsAt, now), gte(kasPeriods.endsAt, now)))
      .limit(1)

    let currentWeekPayments = 0
    let pendingPayments = 0

    if (currentWeek) {
      // Get payments for current week
      const payments = await db
        .select()
        .from(kasPayments)
        .where(eq(kasPayments.kasPeriodId, currentWeek.id))
      
      currentWeekPayments = payments.length

      // Calculate pending payments
      pendingPayments = totalStudents - currentWeekPayments
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