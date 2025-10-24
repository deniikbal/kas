import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const periods = await db.kasPeriod.findMany({
      orderBy: {
        weekNo: 'desc'
      }
    })
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
    const existingPeriod = await db.kasPeriod.findFirst({
      where: { weekNo }
    })

    if (existingPeriod) {
      return NextResponse.json(
        { error: 'Week number already exists' },
        { status: 400 }
      )
    }

    const period = await db.kasPeriod.create({
      data: {
        weekNo,
        nominal,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt)
      }
    })

    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    console.error('Error creating kas period:', error)
    return NextResponse.json(
      { error: 'Failed to create kas period' },
      { status: 500 }
    )
  }
}