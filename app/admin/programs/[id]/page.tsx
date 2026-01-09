"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

interface Program {
  id: string
  title: string
  description: string
  level: string | null
  duration: string | null
  price: string | null
  imageUrl: string | null
  structure: string[]
  goals: string[]
}

export default function EditProgramPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    duration: "",
    price: "",
    imageUrl: "",
    structure: [] as string[],
    goals: [] as string[],
  })
  const [structureInput, setStructureInput] = useState("")
  const [goalsInput, setGoalsInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/programs/${programId}?t=${timestamp}`, { 
          cache: 'no-store', 
          next: { revalidate: 0 } 
        })
        if (response.ok) {
          const program: Program = await response.json()
          setFormData({
            title: program.title,
            description: program.description,
            level: program.level || "",
            duration: program.duration || "",
            price: program.price || "",
            imageUrl: program.imageUrl || "",
            structure: program.structure || [],
            goals: program.goals || [],
          })
          setStructureInput(program.structure?.join("\n") || "")
          setGoalsInput(program.goals?.join("\n") || "")
        } else {
          setError("Program bulunamadı")
        }
      } catch (err) {
        setError("Program yüklenirken bir hata oluştu")
      } finally {
        setFetching(false)
      }
    }

    if (programId) {
      fetchProgram()
    }
  }, [programId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({
          ...formData,
          level: formData.level || null,
          duration: formData.duration || null,
          price: formData.price || null,
          imageUrl: formData.imageUrl || null,
          structure: formData.structure,
          goals: formData.goals,
        }),
      })

      if (response.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "Program güncellenirken bir hata oluştu")
      }
    } catch (err) {
      setError("Program güncellenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="text-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#4a4a4a]">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,77,0.14),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="Program Düzenle"
            title="Programı Güncelle"
            subtitle="Mevcut program bilgilerini düzenleyin"
          />
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 md:px-6 md:py-24">
        <div className="rounded-3xl border border-[#0b0b0b]/6 bg-white p-8 shadow-xl shadow-black/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Açıklama *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Resim URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="https://example.com/image.jpg veya /images/kidsplaying-chess-low.jpg"
              />
              <p className="mt-1 text-xs text-[#4a4a4a]">
                Resim URL'si girebilirsiniz. Boş bırakılırsa varsayılan resim kullanılacaktır.
              </p>
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-[#0b0b0b]/10">
                  <img
                    src={formData.imageUrl}
                    alt="Önizleme"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                  Seviye
                </label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                  placeholder="Başlangıç"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                  Süre
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                  placeholder="45 dk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                  Fiyat
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                  placeholder="1200₺"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Program Yapısı (Her satıra bir madde)
              </label>
              <textarea
                value={structureInput}
                onChange={(e) => setStructureInput(e.target.value)}
                onBlur={() => {
                  const items = structureInput.split("\n").filter(item => item.trim())
                  setFormData({ ...formData, structure: items })
                }}
                rows={4}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Her satıra bir madde yazın&#10;Örnek:&#10;Haftalık 2 saat ders&#10;Pratik oyunlar&#10;Turnuva hazırlığı"
              />
              {formData.structure.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.structure.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gold-500/15 border border-gold-400/50 px-2 py-1 text-xs text-gold-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Hedefler (Her satıra bir hedef)
              </label>
              <textarea
                value={goalsInput}
                onChange={(e) => setGoalsInput(e.target.value)}
                onBlur={() => {
                  const items = goalsInput.split("\n").filter(item => item.trim())
                  setFormData({ ...formData, goals: items })
                }}
                rows={4}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Her satıra bir hedef yazın&#10;Örnek:&#10;Temel taş hareketleri&#10;Açılış prensipleri&#10;Oyun sonu teknikleri"
              />
              {formData.goals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.goals.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gold-500/15 border border-gold-400/50 px-2 py-1 text-xs text-gold-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </button>
              <Link
                href="/admin"
                className="rounded-full border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

