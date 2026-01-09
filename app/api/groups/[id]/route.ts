import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateGroupSchema = z.object({
  name: z.string().min(1, "Grup adı gereklidir").optional(),
  description: z.string().optional().nullable(),
  programId: z.union([z.string().min(1), z.null()]).optional(),
  memberIds: z.array(z.string()).optional(),
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

    const group = await prisma.group.findUnique({
      where: { id },
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

    if (!group) {
      return NextResponse.json(
        { error: "Grup bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(group, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json(
      { error: "Grup yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const validatedData = updateGroupSchema.parse(body)

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Grup bulunamadı" },
        { status: 404 }
      )
    }

    // Check if program exists (if programId is being updated and not null)
    if (validatedData.programId !== undefined && validatedData.programId !== null) {
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

    // Update group
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.programId !== undefined)
      updateData.programId = validatedData.programId

    // Update members if provided
    if (validatedData.memberIds !== undefined) {
      // Delete existing members
      await prisma.groupMember.deleteMany({
        where: { groupId: id },
      })

      // Create new members
      if (validatedData.memberIds.length > 0) {
        await prisma.groupMember.createMany({
          data: validatedData.memberIds.map((userId) => ({
            groupId: id,
            userId,
          })),
        })
      }
    }

    const group = await prisma.group.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(group)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating group:", error)
    return NextResponse.json(
      { error: "Grup güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Grup bulunamadı" },
        { status: 404 }
      )
    }

    // Delete group (members will be deleted automatically due to onDelete: Cascade)
    await prisma.group.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Grup silindi" })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json(
      { error: "Grup silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
