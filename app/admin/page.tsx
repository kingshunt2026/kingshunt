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

interface User {
  id: string
  email: string | null
  name: string | null
  studentName: string | null
  role: "ADMIN" | "COACH" | "MEMBER"
  createdAt: string
}

interface Group {
  id: string
  name: string
  description: string | null
  programId: string | null
  program: {
    id: string
    title: string
  } | null
  members: Array<{
    id: string
    user: {
      id: string
      name: string | null
      studentName: string | null
      email: string | null
    }
  }>
  createdAt: string
}

export default function AdminPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [activeTab, setActiveTab] = useState<"programs" | "tournaments" | "coaches" | "members" | "groups">("programs")
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: "",
    studentName: "",
    email: "",
    role: "MEMBER" as "ADMIN" | "COACH" | "MEMBER",
  })
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [showAddGroupForm, setShowAddGroupForm] = useState(false)
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    description: "",
    programId: "",
    memberIds: [] as string[],
  })
  const [assigningProgramToUser, setAssigningProgramToUser] = useState<string | null>(null)

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
      const [programsRes, tournamentsRes, coachesRes, usersRes, groupsRes] = await Promise.all([
        fetch(`/api/programs?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/tournaments?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/coaches?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/users?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
        fetch(`/api/groups?t=${timestamp}`, { cache: 'no-store', next: { revalidate: 0 } }),
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

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        setGroups(groupsData)
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

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Admin",
      COACH: "Antrenör",
      MEMBER: "Üye",
    }
    return labels[role] || role
  }

  const handleAssignProgram = async (userId: string, programId: string) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, programId }),
        cache: 'no-store',
      })

      if (response.ok) {
        alert("Kullanıcı programa başarıyla atandı")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Program atama sırasında bir hata oluştu")
      }
    } catch (error) {
      alert("Program atama sırasında bir hata oluştu")
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        cache: 'no-store',
      })

      if (response.ok) {
        fetchData()
        setEditingUser(null)
        
        // If updating own role, reload page to refresh user context
        if (user && userId === user.id && updates.role) {
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Kullanıcı güncellenirken bir hata oluştu")
      }
    } catch (error) {
      alert("Kullanıcı güncellenirken bir hata oluştu")
    }
  }

  const handleCreateUser = async () => {
    if (!newUserData.name || newUserData.name.trim().length < 2) {
      alert("İsim en az 2 karakter olmalıdır")
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserData.name.trim(),
          studentName: newUserData.studentName.trim() || null,
          email: newUserData.email.trim() || null,
          role: newUserData.role,
        }),
        cache: 'no-store',
      })

      if (response.ok) {
        fetchData()
        setShowAddUserForm(false)
        setNewUserData({
          name: "",
          studentName: "",
          email: "",
          role: "MEMBER",
        })
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Öğrenci oluşturulurken bir hata oluştu")
      }
    } catch (error) {
      alert("Öğrenci oluşturulurken bir hata oluştu")
    }
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
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "members"
                ? "border-b-2 border-gold-500 text-gold-600"
                : "text-[#4a4a4a] hover:text-[#0b0b0b]"
            }`}
          >
            Üyeler
          </button>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeTab === "groups"
                  ? "border-b-2 border-gold-500 text-gold-600"
                  : "text-[#4a4a4a] hover:text-[#0b0b0b]"
              }`}
            >
              Gruplar
            </button>
          )}
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
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Antrenörler</h2>
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

        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Üyeler</h2>
              <button
                onClick={() => setShowAddUserForm(true)}
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
              >
                + Yeni Öğrenci Ekle
              </button>
            </div>

            {/* Add User Form Modal */}
            {showAddUserForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#0b0b0b]">
                        Yeni Öğrenci Ekle
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddUserForm(false)
                          setNewUserData({
                            name: "",
                            studentName: "",
                            email: "",
                            role: "MEMBER",
                          })
                        }}
                        className="text-[#4a4a4a] hover:text-[#0b0b0b]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          value={newUserData.name}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, name: e.target.value })
                          }
                          required
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                          placeholder="Öğrenci adı soyadı"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Öğrenci Adı <span className="text-xs text-[#4a4a4a]">(Opsiyonel)</span>
                        </label>
                        <input
                          type="text"
                          value={newUserData.studentName}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, studentName: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                          placeholder="Derslerde kullanılacak isim"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Email <span className="text-xs text-[#4a4a4a]">(Opsiyonel)</span>
                        </label>
                        <input
                          type="email"
                          value={newUserData.email}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, email: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                          placeholder="ornek@email.com (opsiyonel)"
                        />
                        <p className="text-xs text-[#4a4a4a] mt-1">
                          Email belirtilmezse, öğrenci login/register yapamaz
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Rol
                        </label>
                        <select
                          value={newUserData.role}
                          onChange={(e) =>
                            setNewUserData({
                              ...newUserData,
                              role: e.target.value as "ADMIN" | "COACH" | "MEMBER",
                            })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        >
                          <option value="MEMBER">Üye</option>
                          <option value="COACH">Antrenör</option>
                          {user?.role === "ADMIN" && (
                            <option value="ADMIN">Admin</option>
                          )}
                        </select>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={handleCreateUser}
                          className="flex-1 rounded-lg bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
                        >
                          Oluştur
                        </button>
                        <button
                          onClick={() => {
                            setShowAddUserForm(false)
                            setNewUserData({
                              name: "",
                              studentName: "",
                              email: "",
                              role: "MEMBER",
                            })
                          }}
                          className="rounded-lg border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                >
                  {editingUser?.id === user.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          value={editingUser.name || ""}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, name: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Öğrenci Adı
                        </label>
                        <input
                          type="text"
                          value={editingUser.studentName || ""}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, studentName: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Rol
                        </label>
                        <select
                          value={editingUser.role}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              role: e.target.value as "ADMIN" | "COACH" | "MEMBER",
                            })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        >
                          <option value="MEMBER">Üye</option>
                          <option value="COACH">Antrenör</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateUser(user.id, editingUser)}
                          className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 transition hover:bg-gold-500/25"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="rounded-lg border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#efe7d7]"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#0b0b0b]">
                            {user.name || "İsimsiz"}
                          </h3>
                          <span className="rounded-full border border-gold-400/50 bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-800">
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <p className="text-sm text-[#4a4a4a] mb-1">
                          {user.email || <span className="italic text-[#6b6b6b]">Email yok (Login yapamaz)</span>}
                        </p>
                        {user.studentName && (
                          <p className="text-sm text-gold-700">
                            Öğrenci Adı: {user.studentName}
                          </p>
                        )}
                        <p className="text-xs text-[#4a4a4a] mt-2">
                          Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setAssigningProgramToUser(user.id)}
                          className="rounded-lg border border-blue-400/50 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-500/25"
                          title="Programa ata"
                        >
                          📚 Programa Ata
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25"
                        >
                          Düzenle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0b0b0b]">Gruplar</h2>
              <button
                onClick={() => {
                  setShowAddGroupForm(true)
                  setNewGroupData({
                    name: "",
                    description: "",
                    programId: "",
                    memberIds: [],
                  })
                }}
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
              >
                + Yeni Grup Ekle
              </button>
            </div>

            <div className="grid gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                >
                  {editingGroup?.id === group.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Grup Adı
                        </label>
                        <input
                          type="text"
                          value={editingGroup.name}
                          onChange={(e) =>
                            setEditingGroup({ ...editingGroup, name: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={editingGroup.description || ""}
                          onChange={(e) =>
                            setEditingGroup({ ...editingGroup, description: e.target.value })
                          }
                          rows={3}
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Program
                        </label>
                        <select
                          value={editingGroup.programId || ""}
                          onChange={(e) =>
                            setEditingGroup({ ...editingGroup, programId: e.target.value || null })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        >
                          <option value="">Program seçin (opsiyonel)...</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Üyeler
                        </label>
                        <div className="max-h-40 overflow-y-auto space-y-2 border border-[#0b0b0b]/10 rounded-xl p-3 bg-[#f7f4ec]">
                          {users.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editingGroup.members.some((m) => m.user.id === user.id)}
                                onChange={(e) => {
                                  const memberIds = editingGroup.members.map((m) => m.user.id)
                                  if (e.target.checked) {
                                    setEditingGroup({
                                      ...editingGroup,
                                      members: [
                                        ...editingGroup.members,
                                        { id: "", user },
                                      ],
                                    })
                                  } else {
                                    setEditingGroup({
                                      ...editingGroup,
                                      members: editingGroup.members.filter(
                                        (m) => m.user.id !== user.id
                                      ),
                                    })
                                  }
                                }}
                                className="rounded border-[#0b0b0b]/10"
                              />
                              <span className="text-sm text-[#0b0b0b]">
                                {user.name || user.email || "İsimsiz"} {user.studentName && `(${user.studentName})`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/groups/${group.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: editingGroup.name,
                                  description: editingGroup.description,
                                  programId: editingGroup.programId,
                                  memberIds: editingGroup.members.map((m) => m.user.id),
                                }),
                                cache: 'no-store',
                              })

                              if (response.ok) {
                                fetchData()
                                setEditingGroup(null)
                              } else {
                                const errorData = await response.json()
                                alert(errorData.error || "Grup güncellenirken bir hata oluştu")
                              }
                            } catch (error) {
                              alert("Grup güncellenirken bir hata oluştu")
                            }
                          }}
                          className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 transition hover:bg-gold-500/25"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingGroup(null)}
                          className="rounded-lg border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#efe7d7]"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#0b0b0b]">
                            {group.name}
                          </h3>
                          {group.program ? (
                            <span className="rounded-full border border-blue-400/50 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-800">
                              {group.program.title}
                            </span>
                          ) : (
                            <span className="rounded-full border border-gray-400/50 bg-gray-500/15 px-2 py-0.5 text-xs font-semibold text-gray-600">
                              Program yok
                            </span>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-[#4a4a4a] mb-2">{group.description}</p>
                        )}
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[#0b0b0b] mb-2">
                            Üyeler ({group.members.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.members.map((member) => (
                              <span
                                key={member.id}
                                className="rounded-full border border-gold-400/50 bg-gold-500/15 px-2 py-1 text-xs font-medium text-gold-800"
                              >
                                {member.user.name || member.user.studentName || member.user.email || "İsimsiz"}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#4a4a4a] mt-2">
                          Oluşturulma: {new Date(group.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingGroup(group)}
                          className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Bu grubu silmek istediğinize emin misiniz?")) return
                            try {
                              const response = await fetch(`/api/groups/${group.id}`, {
                                method: "DELETE",
                                cache: 'no-store',
                              })

                              if (response.ok) {
                                fetchData()
                              } else {
                                alert("Grup silinirken bir hata oluştu")
                              }
                            } catch (error) {
                              alert("Grup silinirken bir hata oluştu")
                            }
                          }}
                          className="rounded-lg border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-500/25"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Group Form Modal */}
            {showAddGroupForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#0b0b0b]">
                        Yeni Grup Ekle
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddGroupForm(false)
                          setNewGroupData({
                            name: "",
                            description: "",
                            programId: "",
                            memberIds: [],
                          })
                        }}
                        className="text-[#4a4a4a] hover:text-[#0b0b0b]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Grup Adı *
                        </label>
                        <input
                          type="text"
                          value={newGroupData.name}
                          onChange={(e) =>
                            setNewGroupData({ ...newGroupData, name: e.target.value })
                          }
                          required
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                          placeholder="Grup adı"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={newGroupData.description}
                          onChange={(e) =>
                            setNewGroupData({ ...newGroupData, description: e.target.value })
                          }
                          rows={3}
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                          placeholder="Grup açıklaması (opsiyonel)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Program
                        </label>
                        <select
                          value={newGroupData.programId}
                          onChange={(e) =>
                            setNewGroupData({ ...newGroupData, programId: e.target.value || null })
                          }
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        >
                          <option value="">Program seçin (opsiyonel)...</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Üyeler
                        </label>
                        <div className="max-h-60 overflow-y-auto space-y-2 border border-[#0b0b0b]/10 rounded-xl p-3 bg-[#f7f4ec]">
                          {users.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={newGroupData.memberIds.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewGroupData({
                                      ...newGroupData,
                                      memberIds: [...newGroupData.memberIds, user.id],
                                    })
                                  } else {
                                    setNewGroupData({
                                      ...newGroupData,
                                      memberIds: newGroupData.memberIds.filter(
                                        (id) => id !== user.id
                                      ),
                                    })
                                  }
                                }}
                                className="rounded border-[#0b0b0b]/10"
                              />
                              <span className="text-sm text-[#0b0b0b]">
                                {user.name || user.email || "İsimsiz"} {user.studentName && `(${user.studentName})`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={async () => {
                            if (!newGroupData.name) {
                              alert("Grup adı gereklidir")
                              return
                            }

                            try {
                              const response = await fetch("/api/groups", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...newGroupData,
                                  programId: newGroupData.programId || null,
                                }),
                                cache: 'no-store',
                              })

                              if (response.ok) {
                                fetchData()
                                setShowAddGroupForm(false)
                                setNewGroupData({
                                  name: "",
                                  description: "",
                                  programId: "",
                                  memberIds: [],
                                })
                              } else {
                                const errorData = await response.json()
                                alert(errorData.error || "Grup oluşturulurken bir hata oluştu")
                              }
                            } catch (error) {
                              alert("Grup oluşturulurken bir hata oluştu")
                            }
                          }}
                          className="flex-1 rounded-lg bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
                        >
                          Oluştur
                        </button>
                        <button
                          onClick={() => {
                            setShowAddGroupForm(false)
                            setNewGroupData({
                              name: "",
                              description: "",
                              programId: "",
                              memberIds: [],
                            })
                          }}
                          className="rounded-lg border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assign Program Modal */}
            {assigningProgramToUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#0b0b0b]">
                        Programa Ata
                      </h3>
                      <button
                        onClick={() => setAssigningProgramToUser(null)}
                        className="text-[#4a4a4a] hover:text-[#0b0b0b]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                          Program Seçin *
                        </label>
                        <select
                          id="programSelect"
                          className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-2 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                        >
                          <option value="">Program seçin...</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={async () => {
                            const select = document.getElementById("programSelect") as HTMLSelectElement
                            const programId = select?.value
                            if (!programId) {
                              alert("Lütfen bir program seçin")
                              return
                            }
                            await handleAssignProgram(assigningProgramToUser, programId)
                            setAssigningProgramToUser(null)
                          }}
                          className="flex-1 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-400/40"
                        >
                          Ata
                        </button>
                        <button
                          onClick={() => setAssigningProgramToUser(null)}
                          className="rounded-lg border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
