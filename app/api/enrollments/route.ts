import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const enrollmentSchema = z.object({
  programId: z.string().min(1, "Program ID gereklidir"),
  userId: z.string().optional(), // Admin/Coach için başka kullanıcıyı atama
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

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    // Admin can see all enrollments, members see only their own
    const where = dbUser?.role === "ADMIN"
      ? {}
      : { userId: user.id }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        program: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(enrollments, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { error: "Kayıtlar yüklenirken bir hata oluştu" },
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

    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    // Determine target user ID
    let targetUserId = user.id
    if (validatedData.userId) {
      // Admin or Coach can assign programs to other users
      if (dbUser?.role !== "ADMIN" && dbUser?.role !== "COACH") {
        return NextResponse.json(
          { error: "Yetkisiz erişim" },
          { status: 403 }
        )
      }
      targetUserId = validatedData.userId
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: targetUserId,
          programId: validatedData.programId,
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Bu kullanıcı zaten bu programa kayıtlı" },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: targetUserId,
        programId: validatedData.programId,
      },
      include: {
        program: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating enrollment:", error)
    return NextResponse.json(
      { error: "Kayıt oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
