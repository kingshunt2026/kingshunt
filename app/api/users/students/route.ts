import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    // Only ADMIN and COACH can get student list
    if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "COACH")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all users with their student names (studentName or name)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        studentName: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Create a set of unique student names
    const studentNames = new Set<string>()
    users.forEach(u => {
      if (u.studentName) studentNames.add(u.studentName)
      if (u.name) studentNames.add(u.name)
    })

    return NextResponse.json(Array.from(studentNames).sort())
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Öğrenci listesi getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
