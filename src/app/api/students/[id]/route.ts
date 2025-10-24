import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { nis, name, kelas } = await request.json()

    if (!nis || !name || !kelas) {
      return NextResponse.json(
        { error: 'NIS, name, and kelas are required' },
        { status: 400 }
      )
    }

    // Check if NIS already exists for another student
    const existingStudent = await db.student.findFirst({
      where: {
        nis,
        id: { not: parseInt(params.id) }
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS already exists' },
        { status: 400 }
      )
    }

    const student = await db.student.update({
      where: { id: parseInt(params.id) },
      data: {
        nis,
        name,
        kelas
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.student.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}