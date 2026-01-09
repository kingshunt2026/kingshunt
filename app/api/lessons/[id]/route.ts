import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const lessonUpdateSchema = z.object({
  date: z.string().datetime().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  type: z.enum(["INDIVIDUAL", "GROUP"]).optional(),
  studentIds: z.array(z.string()).optional(),
  groupId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id } = await params
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      )
    }

    // Check if user is the coach or admin
    if (lesson.coachId !== user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      })

      if (!dbUser || dbUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Yetkisiz erişim" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(lesson, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json(
      { error: "Ders yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = lessonUpdateSchema.parse(body)

    // Check if lesson exists and user is the coach
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    })

    // Validate student IDs if provided
    if (validatedData.studentIds && validatedData.studentIds.length > 0) {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
        }
      })

      const validUserIds = new Set(allUsers.map(u => u.id))
      const invalidIds = validatedData.studentIds.filter(
        id => !validUserIds.has(id)
      )

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { 
            error: `Geçersiz öğrenci ID'leri: ${invalidIds.join(', ')}`,
            invalidIds
          },
          { status: 400 }
        )
      }
    }

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      )
    }

    if (existingLesson.coachId !== user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      })

      if (!dbUser || dbUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Yetkisiz erişim" },
          { status: 403 }
        )
      }
    }

    const updateData: any = {}
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    if (validatedData.startTime) updateData.startTime = validatedData.startTime
    if (validatedData.endTime) updateData.endTime = validatedData.endTime
    if (validatedData.type) updateData.type = validatedData.type
    if (validatedData.studentIds) updateData.studentIds = validatedData.studentIds
    if (validatedData.groupId !== undefined) updateData.groupId = validatedData.groupId || null
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(lesson)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating lesson:", error)
    return NextResponse.json(
      { error: "Ders güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if lesson exists and user is the coach
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      )
    }

    if (existingLesson.coachId !== user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      })

      if (!dbUser || dbUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Yetkisiz erişim" },
          { status: 403 }
        )
      }
    }

    await prisma.lesson.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Ders silindi" })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json(
      { error: "Ders silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
