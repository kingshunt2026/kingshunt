import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const lessonSchema = z.object({
  date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, "Geçerli bir tarih formatı giriniz"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat formatı giriniz (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Geçerli bir saat formatı giriniz (HH:mm)"),
  type: z.enum(["INDIVIDUAL", "GROUP"]),
  studentIds: z.array(z.string().min(1, "Öğrenci ID boş olamaz")).min(1, "En az bir öğrenci gereklidir"),
  groupId: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringEndDate: z.string().refine((val) => {
    if (!val || val === null || val === "") return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, "Geçerli bir tarih formatı giriniz").optional().nullable(),
  notes: z.string().optional().nullable(),
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    // Get user role and info from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        role: true,
        name: true,
        studentName: true,
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // MEMBER can only see lessons where they are a student
    if (dbUser.role === "MEMBER") {
      // Get all possible names for this user (studentName and name)
      const possibleNames: string[] = []
      if (dbUser.studentName) possibleNames.push(dbUser.studentName.trim())
      if (dbUser.name) possibleNames.push(dbUser.name.trim())
      
      if (possibleNames.length === 0) {
        // If no student name or name, return empty array
        return NextResponse.json([], {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        })
      }
      
      // Find lessons where studentIds array contains the user's ID
      const allLessons = await prisma.lesson.findMany({
        where: startDate && endDate ? {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          studentIds: {
            has: user.id
          }
        } : {
          studentIds: {
            has: user.id
          }
        },
        include: {
          coach: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      })
      
      // Fetch student information for each lesson
      const lessonsWithStudents = await Promise.all(
        allLessons.map(async (lesson) => {
          const students = await prisma.user.findMany({
            where: {
              id: { in: lesson.studentIds }
            },
            select: {
              id: true,
              name: true,
              studentName: true,
              email: true,
            }
          })
          return {
            ...lesson,
            students: students.map(s => ({
              id: s.id,
              name: s.studentName || s.name || s.email || "İsimsiz"
            }))
          }
        })
      )
      
      return NextResponse.json(lessonsWithStudents, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
    } else if (dbUser.role === "COACH") {
      // COACH can only see their own lessons
      where.coachId = user.id
    } else if (dbUser.role === "ADMIN") {
      // ADMIN can see all lessons
      // No filter needed
    } else {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    })

    // Fetch student information for each lesson
    const lessonsWithStudents = await Promise.all(
      lessons.map(async (lesson) => {
        const students = lesson.studentIds.length > 0 ? await prisma.user.findMany({
          where: {
            id: { in: lesson.studentIds }
          },
          select: {
            id: true,
            name: true,
            studentName: true,
            email: true,
          }
        }) : []
        return {
          ...lesson,
          students: students.map(s => ({
            id: s.id,
            name: s.studentName || s.name || s.email || "İsimsiz"
          }))
        }
      })
    )

    return NextResponse.json(lessonsWithStudents, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json(
      { error: "Dersler yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || (dbUser.role !== "COACH" && dbUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Yetkisiz erişim - Sadece antrenörler ders oluşturabilir" },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Log for debugging
    console.log("Received lesson data:", JSON.stringify(body, null, 2))
    
    const validatedData = lessonSchema.parse(body)

    // Validate student IDs - they must exist in User table
    if (validatedData.studentIds && validatedData.studentIds.length > 0) {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
        }
      })

      // Validate student IDs
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

    const lessons = []

    if (validatedData.isRecurring && validatedData.recurringEndDate) {
      // Create recurring lessons (weekly)
      const startDate = new Date(validatedData.date)
      const endDate = new Date(validatedData.recurringEndDate!)
      
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const lesson = await prisma.lesson.create({
          data: {
            coachId: user.id,
            date: currentDate,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
            type: validatedData.type,
            studentIds: validatedData.studentIds,
            groupId: validatedData.groupId || null,
            isRecurring: true,
            recurringEndDate: endDate,
            notes: validatedData.notes,
          },
        })
        lessons.push(lesson)
        
        // Add 7 days for next week
        currentDate = new Date(currentDate)
        currentDate.setDate(currentDate.getDate() + 7)
      }
    } else {
      // Create single lesson
      const lesson = await prisma.lesson.create({
        data: {
          coachId: user.id,
          date: new Date(validatedData.date),
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          type: validatedData.type,
          studentIds: validatedData.studentIds,
          groupId: validatedData.groupId || null,
          isRecurring: false,
          notes: validatedData.notes,
        },
      })
      lessons.push(lesson)
    }

    return NextResponse.json(lessons, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json(
        { 
          error: error.issues[0].message,
          details: error.issues 
        },
        { status: 400 }
      )
    }

    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { error: "Ders oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
