import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const coachSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  title: z.string().min(1, "Ünvan gereklidir"),
  bio: z.string().min(1, "Biyografi gereklidir"),
  image: z.string().url().optional().or(z.literal("")),
  type: z.enum(["HEAD_COACH", "COACH", "ASSISTANT_COACH", "PERFORMANCE_ANALYST"], {
    errorMap: () => ({ message: "Geçersiz koç tipi" }),
  }),
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: [
        { type: "asc" }, // HEAD_COACH first
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(coaches, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching coaches:", error)
    return NextResponse.json(
      { error: "Koçlar yüklenirken bir hata oluştu" },
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

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = coachSchema.parse(body)

    const coach = await prisma.coach.create({
      data: {
        ...validatedData,
        image: validatedData.image || null,
      },
    })

    return NextResponse.json(coach, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating coach:", error)
    return NextResponse.json(
      { error: "Koç oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

