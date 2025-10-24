import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nis: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(transactions)
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

    const transaction = await db.transaction.create({
      data: {
        kind,
        category,
        description,
        amount,
        studentId: studentId || null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nis: true
          }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}