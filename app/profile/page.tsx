"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

interface Enrollment {
  id: string
  program: {
    id: string
    title: string
    description: string
  }
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEnrollments()
    }
  }, [session])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments")
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (programId: string) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      })

      if (response.ok) {
        fetchEnrollments()
      } else {
        const data = await response.json()
        alert(data.error || "Kayıt sırasında bir hata oluştu")
      }
    } catch (error) {
      alert("Kayıt sırasında bir hata oluştu")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="text-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#4a4a4a]">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,77,0.14),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="Profil"
            title={`Hoş geldiniz, ${session.user.name}`}
            subtitle="Programlarınızı görüntüleyin ve yeni programlara kayıt olun"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10">
              <h3 className="text-lg font-semibold text-[#0b0b0b] mb-4">
                Kayıtlı Olduğum Programlar
              </h3>
              {enrollments.length === 0 ? (
                <p className="text-sm text-[#4a4a4a]">
                  Henüz hiçbir programa kayıtlı değilsiniz.
                </p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="rounded-xl border border-[#0b0b0b]/5 bg-[#f7f4ec] p-4"
                    >
                      <h4 className="font-semibold text-[#0b0b0b]">
                        {enrollment.program.title}
                      </h4>
                      <p className="text-sm text-[#4a4a4a] mt-1">
                        {enrollment.program.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10">
              <h3 className="text-lg font-semibold text-[#0b0b0b] mb-4">
                Hızlı Erişim
              </h3>
              <div className="space-y-3">
                <Link
                  href="/programs"
                  className="block rounded-xl border border-gold-400/50 bg-gold-500/15 px-4 py-3 text-sm font-semibold text-gold-800 text-center transition hover:bg-gold-500/25"
                >
                  Programları Görüntüle
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm font-semibold text-[#0b0b0b] text-center transition hover:bg-[#efe7d7]"
                  >
                    Admin Paneli
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10">
              <h3 className="text-sm font-semibold text-[#0b0b0b] mb-2">
                Hesap Bilgileri
              </h3>
              <div className="space-y-2 text-sm text-[#4a4a4a]">
                <p>
                  <span className="font-medium">Email:</span> {session.user.email}
                </p>
                <p>
                  <span className="font-medium">Rol:</span> {session.user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}






