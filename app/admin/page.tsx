"use client"

import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

interface Program {
  id: string
  title: string
  description: string
  level: string | null
  duration: string | null
  price: string | null
  structure: string[]
  goals: string[]
}

interface Tournament {
  id: string
  name: string
  date: string
  location: string
  type: string
  status: string
}

interface Coach {
  id: string
  name: string
  title: string
  bio: string
  image: string | null
  type: "HEAD_COACH" | "COACH" | "ASSISTANT_COACH" | "PERFORMANCE_ANALYST"
}

export default function AdminPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [activeTab, setActiveTab] = useState<"programs" | "tournaments" | "coaches" | "members">("programs")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/login")
    } else if (!userLoading && user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [userLoading, user, router])

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const timestamp = Date.now()
      const [programsRes, tournamentsRes, coachesRes] = await Promise.all([
        fetch(`/api/programs?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/tournaments?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/coaches?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
      ])

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData)
      }

      if (tournamentsRes.ok) {
        const tournamentsData = await tournamentsRes.json()
        setTournaments(tournamentsData)
      }

      if (coachesRes.ok) {
        const coachesData = await coachesRes.json()
        setCoaches(coachesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Bu programı silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
        cache: 'no-store',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      alert("Program silinirken bir hata oluştu")
    }
  }

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Bu turnuvayı silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
        cache: 'no-store',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      alert("Turnuva silinirken bir hata oluştu")
    }
  }

  const handleDeleteCoach = async (id: string) => {
    if (!confirm("Bu koçu silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: "DELETE",
        cache: 'no-store',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      alert("Koç silinirken bir hata oluştu")
    }
  }

  const getCoachTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HEAD_COACH: "Baş Antrenör",
      COACH: "Antrenör",
      ASSISTANT_COACH: "Yardımcı Antrenör",
      PERFORMANCE_ANALYST: "Performans Analisti",
    }
    return labels[type] || type
  }

  if (userLoading || loading) {
    return (
      <div className="text-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#4a4a4a]">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,77,0.14),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="Yönetim"
            title="Admin Paneli"
            subtitle="Programları, turnuvaları ve üyeleri yönetin"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-6 flex gap-4 border-b border-[#0b0b0b]/10">
          <button
            onClick={() => setActiveTab("programs")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "programs"
                ? "border-b-2 border-gold-500 text-gold-600"
                : "text-[#4a4a4a] hover:text-[#0b0b0b]"
            }`}
          >
            Programlar
          </button>
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "tournaments"
                ? "border-b-2 border-gold-500 text-gold-600"
                : "text-[#4a4a4a] hover:text-[#0b0b0b]"
            }`}
          >
            Turnuvalar
          </button>
          <button
            onClick={() => setActiveTab("coaches")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "coaches"
                ? "border-b-2 border-gold-500 text-gold-600"
                : "text-[#4a4a4a] hover:text-[#0b0b0b]"
            }`}
          >
            Koçlar
          </button>
        </div>

        {activeTab === "programs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Programlar</h2>
              <Link
                href="/admin/programs/new"
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
              >
                Yeni Program
              </Link>
            </div>

            <div className="grid gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#0b0b0b]">
                        {program.title}
                      </h3>
                      <p className="text-sm text-[#4a4a4a] mt-2">{program.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-[#4a4a4a]">
                        {program.level && <span>Seviye: {program.level}</span>}
                        {program.duration && <span>Süre: {program.duration}</span>}
                        {program.price && <span>Fiyat: {program.price}</span>}
                      </div>
                      {program.structure.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[#0b0b0b] mb-1">Yapı:</p>
                          <div className="flex flex-wrap gap-1">
                            {program.structure.map((item, index) => (
                              <span
                                key={index}
                                className="rounded bg-gold-500/15 border border-gold-400/50 px-2 py-0.5 text-xs text-gold-800"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {program.goals.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[#0b0b0b] mb-1">Hedefler:</p>
                          <div className="flex flex-wrap gap-1">
                            {program.goals.map((item, index) => (
                              <span
                                key={index}
                                className="rounded bg-blue-500/15 border border-blue-400/50 px-2 py-0.5 text-xs text-blue-800"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/programs/${program.id}`}
                        className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="rounded-lg border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-500/25"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Turnuvalar</h2>
              <Link
                href="/admin/tournaments/new"
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
              >
                Yeni Turnuva
              </Link>
            </div>

            <div className="grid gap-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#0b0b0b]">
                        {tournament.name}
                      </h3>
                      <div className="flex gap-4 mt-2 text-sm text-[#4a4a4a]">
                        <span>{new Date(tournament.date).toLocaleDateString("tr-TR")}</span>
                        <span>{tournament.location}</span>
                        <span>{tournament.type}</span>
                        <span className="rounded-full border border-gold-400/50 bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-800">
                          {tournament.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/tournaments/${tournament.id}`}
                        className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="rounded-lg border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-500/25"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "coaches" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Koçlar</h2>
              <Link
                href="/admin/coaches/new"
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
              >
                Yeni Koç
              </Link>
            </div>

            <div className="grid gap-4">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#0b0b0b]">
                          {coach.name}
                        </h3>
                        <span className="rounded-full border border-gold-400/50 bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-800">
                          {getCoachTypeLabel(coach.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gold-700 mb-2">{coach.title}</p>
                      <p className="text-sm text-[#4a4a4a] line-clamp-2">{coach.bio}</p>
                      {coach.image && (
                        <p className="text-xs text-[#4a4a4a] mt-2">Resim: {coach.image.substring(0, 50)}...</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/coaches/${coach.id}`}
                        className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteCoach(coach.id)}
                        className="rounded-lg border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-500/25"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
