import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db
      .delete(transactions)
      .where(eq(transactions.id, parseInt(params.id)))

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}