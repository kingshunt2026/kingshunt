import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const tournamentSchema = z.object({
  name: z.string().min(1, "Turnuva adı gereklidir"),
  date: z.string().transform((str) => new Date(str)),
  location: z.string().min(1, "Konum gereklidir"),
  type: z.string().min(1, "Tip gereklidir"),
  status: z.string().min(1, "Durum gereklidir"),
})

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { date: "desc" },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json(
      { error: "Turnuvalar yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = tournamentSchema.parse(body)

    const tournament = await prisma.tournament.create({
      data: validatedData,
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating tournament:", error)
    return NextResponse.json(
      { error: "Turnuva oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}



