import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const coachSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  image: z.string().url().optional().or(z.literal("")),
  type: z.enum(["HEAD_COACH", "COACH", "ASSISTANT_COACH", "PERFORMANCE_ANALYST"]).optional(),
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
    const coach = await prisma.coach.findUnique({
      where: { id },
    })

    if (!coach) {
      return NextResponse.json(
        { error: "Koç bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(coach, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching coach:", error)
    return NextResponse.json(
      { error: "Koç yüklenirken bir hata oluştu" },
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
    const validatedData = coachSchema.parse(body)

    const coach = await prisma.coach.update({
      where: { id },
      data: {
        ...validatedData,
        image: validatedData.image !== undefined ? (validatedData.image || null) : undefined,
      },
    })

    return NextResponse.json(coach)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating coach:", error)
    return NextResponse.json(
      { error: "Koç güncellenirken bir hata oluştu" },
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
    await prisma.coach.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Koç silindi" })
  } catch (error) {
    console.error("Error deleting coach:", error)
    return NextResponse.json(
      { error: "Koç silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

