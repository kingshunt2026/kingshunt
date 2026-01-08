import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const enrollmentSchema = z.object({
  programId: z.string().min(1, "Program ID gereklidir"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    // Admin can see all enrollments, members see only their own
    const where = session.user.role === "ADMIN"
      ? {}
      : { userId: session.user.id }

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

    return NextResponse.json(enrollments)
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
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: validatedData.programId,
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Bu programa zaten kayıtlısınız" },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        programId: validatedData.programId,
      },
      include: {
        program: true,
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
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



