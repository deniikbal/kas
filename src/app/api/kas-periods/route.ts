import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { kasPeriods } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const periods = await db.select().from(kasPeriods).orderBy(desc(kasPeriods.weekNo))
    return NextResponse.json(periods)
  } catch (error) {
    console.error('Error fetching kas periods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kas periods' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { weekNo, nominal, startsAt, endsAt } = await request.json()

    if (!weekNo || !nominal || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if week number already exists
    const existingPeriod = await db
      .select()
      .from(kasPeriods)
      .where(eq(kasPeriods.weekNo, weekNo))
      .limit(1)

    if (existingPeriod.length > 0) {
      return NextResponse.json(
        { error: 'Week number already exists' },
        { status: 400 }
      )
    }

    const [period] = await db
      .insert(kasPeriods)
      .values({
        weekNo,
        nominal,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      })
      .returning()

    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    console.error('Error creating kas period:', error)
    return NextResponse.json(
      { error: 'Failed to create kas period' },
      { status: 500 }
    )
  }
}