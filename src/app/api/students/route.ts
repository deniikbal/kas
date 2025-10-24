import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(students)
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
    const existingStudent = await db.student.findUnique({
      where: { nis }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS already exists' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        nis,
        name,
        kelas
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}