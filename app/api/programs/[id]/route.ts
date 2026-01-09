import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const programSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.union([
    z.string().url(),
    z.literal(""),
    z.null()
  ]).optional(),
  structure: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json(
        { error: "Program bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(program, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json(
      { error: "Program yüklenirken bir hata oluştu" },
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

    // Get user role from database
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

    const { id } = await params
    const body = await request.json()
    const validatedData = programSchema.parse(body)

    const program = await prisma.program.update({
      where: { id },
      data: {
        ...validatedData,
        imageUrl: validatedData.imageUrl || null,
      },
    })

    return NextResponse.json(program)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating program:", error)
    return NextResponse.json(
      { error: "Program güncellenirken bir hata oluştu" },
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

    // Get user role from database
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

    const { id } = await params

    await prisma.program.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Program silindi" })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json(
      { error: "Program silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
