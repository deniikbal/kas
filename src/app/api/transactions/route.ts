import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions, students } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allTransactions = await db
      .select({
        id: transactions.id,
        kind: transactions.kind,
        category: transactions.category,
        description: transactions.description,
        amount: transactions.amount,
        studentId: transactions.studentId,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        },
      })
      .from(transactions)
      .leftJoin(students, eq(transactions.studentId, students.id))
      .orderBy(desc(transactions.createdAt))
    
    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { kind, category, description, amount, studentId } = await request.json()

    if (!kind || !category || !amount) {
      return NextResponse.json(
        { error: 'Kind, category, and amount are required' },
        { status: 400 }
      )
    }

    if (!['income', 'expense'].includes(kind)) {
      return NextResponse.json(
        { error: 'Kind must be either income or expense' },
        { status: 400 }
      )
    }

    const [transaction] = await db
      .insert(transactions)
      .values({
        kind,
        category,
        description,
        amount,
        studentId: studentId || null,
      })
      .returning()

    // Fetch with student data if studentId exists
    let result = transaction
    if (transaction.studentId) {
      const [transactionWithStudent] = await db
        .select({
          id: transactions.id,
          kind: transactions.kind,
          category: transactions.category,
          description: transactions.description,
          amount: transactions.amount,
          studentId: transactions.studentId,
          createdAt: transactions.createdAt,
          updatedAt: transactions.updatedAt,
          student: {
            id: students.id,
            name: students.name,
            nis: students.nis,
          },
        })
        .from(transactions)
        .leftJoin(students, eq(transactions.studentId, students.id))
        .where(eq(transactions.id, transaction.id))
      result = transactionWithStudent
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}