import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  id: z.string().min(1, "User ID gereklidir"),
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  studentName: z.string().nullable().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists by ID
    const existingById = await prisma.user.findUnique({
      where: { id: validatedData.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    // If user exists with same ID, return success (already registered)
    if (existingById) {
      return NextResponse.json(
        { 
          message: "Kullanıcı zaten kayıtlı", 
          user: existingById 
        },
        { status: 200 }
      )
    }

    // Check if email exists with different ID
    const existingByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingByEmail) {
      // Email already exists - this might be a sync issue
      // Update the existing user's ID to match Supabase Auth ID
      const user = await prisma.user.update({
        where: { email: validatedData.email },
        data: {
          id: validatedData.id,
          name: validatedData.name || existingByEmail.name,
          ...(validatedData.studentName !== undefined && {
            studentName: validatedData.studentName,
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      })
      return NextResponse.json(
        { message: "Kullanıcı güncellendi", user },
        { status: 200 }
      )
    }

    // Create new user in Prisma (password is managed by Supabase Auth)
    const user = await prisma.user.create({
      data: {
        id: validatedData.id,
        name: validatedData.name,
        studentName: validatedData.studentName || null,
        email: validatedData.email,
        role: "MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    // Update user_metadata with role (for middleware edge runtime)
    // Note: This requires the user to be authenticated, so we'll do it client-side
    // Or use a server-side function with service_role key

    return NextResponse.json(
      { message: "Kayıt başarılı", user },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
