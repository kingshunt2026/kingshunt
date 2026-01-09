import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const groupSchema = z.object({
  name: z.string().min(1, "Grup adı gereklidir"),
  description: z.string().optional().nullable(),
  programId: z.union([z.string().min(1), z.null()]).optional(),
  memberIds: z.array(z.string()).default([]), // Öğrenci/üye ID'leri
})

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin or coach (coach can view groups for lesson creation)
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

    // Get all groups with program and members
    const groups = await prisma.group.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                studentName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(groups, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json(
      { error: "Gruplar yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = groupSchema.parse(body)

    // Check if program exists (if programId is provided)
    if (validatedData.programId) {
      const program = await prisma.program.findUnique({
        where: { id: validatedData.programId },
      })

      if (!program) {
        return NextResponse.json(
          { error: "Program bulunamadı" },
          { status: 404 }
        )
      }
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        programId: validatedData.programId || null,
        members: {
          create: validatedData.memberIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                studentName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating group:", error)
    return NextResponse.json(
      { error: "Grup oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}
