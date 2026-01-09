import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createUserSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  studentName: z.string().nullable().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").optional().nullable(),
  role: z.enum(["ADMIN", "COACH", "MEMBER"]).default("MEMBER"),
})

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "COACH")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        studentName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin or coach
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "COACH")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingByEmail) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        )
      }
    }

    // Create new user without Supabase Auth (ID will be auto-generated with cuid)
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        studentName: validatedData.studentName || null,
        email: validatedData.email || null,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentName: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: "Öğrenci başarıyla oluşturuldu", user: newUser },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Öğrenci oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
