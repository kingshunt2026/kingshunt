import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const programSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  level: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  duration: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  price: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  imageUrl: z.union([
    z.string().url(),
    z.literal(""),
    z.null()
  ]).optional(),
  structure: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(programs, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { error: "Programlar yüklenirken bir hata oluştu" },
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
    const validatedData = programSchema.parse(body)

    const program = await prisma.program.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        level: validatedData.level && validatedData.level !== "" ? validatedData.level : null,
        duration: validatedData.duration && validatedData.duration !== "" ? validatedData.duration : null,
        price: validatedData.price && validatedData.price !== "" ? validatedData.price : null,
        imageUrl: validatedData.imageUrl && validatedData.imageUrl !== "" ? validatedData.imageUrl : null,
        structure: validatedData.structure || [],
        goals: validatedData.goals || [],
      },
    })

    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating program:", error)
    return NextResponse.json(
      { error: "Program oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
