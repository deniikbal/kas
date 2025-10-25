import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export const runtime = 'edge';

export async function GET() {
  try {
    const allStudents = await db.select().from(students).orderBy(asc(students.name))
    return NextResponse.json(allStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { nis, name, kelas } = await request.json()

    if (!nis || !name || !kelas) {
      return NextResponse.json(
        { error: 'NIS, name, and kelas are required' },
        { status: 400 }
      )
    }

    // Check if NIS already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.nis, nis))
      .limit(1)

    if (existingStudent.length > 0) {
      return NextResponse.json(
        { error: 'NIS already exists' },
        { status: 400 }
      )
    }

    const [student] = await db
      .insert(students)
      .values({
        nis,
        name,
        kelas,
      })
      .returning()

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}