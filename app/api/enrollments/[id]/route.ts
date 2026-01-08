import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if enrollment exists and user has permission
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      )
    }

    // Only admin or the owner can delete
    if (session.user.role !== "ADMIN" && enrollment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    await prisma.enrollment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Kayıt silindi" })
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    return NextResponse.json(
      { error: "Kayıt silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}



