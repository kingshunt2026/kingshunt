"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

export default function NewCoachPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    image: "",
    type: "COACH" as "HEAD_COACH" | "COACH" | "ASSISTANT_COACH" | "PERFORMANCE_ANALYST",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({
          ...formData,
          image: formData.image || undefined,
        }),
      })

      if (response.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "Koç oluşturulurken bir hata oluştu")
      }
    } catch (err) {
      setError("Koç oluşturulurken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,77,0.14),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="Yeni Koç"
            title="Koç Oluştur"
            subtitle="Yeni bir koç ekleyin"
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
                İsim * 
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Ünvan * 
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="FIDE Ustası, Baş Antrenör"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Tip *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
              >
                <option value="HEAD_COACH">Baş Antrenör</option>
                <option value="COACH">Antrenör</option>
                <option value="ASSISTANT_COACH">Yardımcı Antrenör</option>
                <option value="PERFORMANCE_ANALYST">Performans Analisti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Biyografi *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={6}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Koç hakkında bilgiler..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Resim URL (Opsiyonel)
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Oluşturuluyor..." : "Oluştur"}
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

