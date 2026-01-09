"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: "",
    studentName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır")
      return
    }

    setLoading(true)

    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'MEMBER', // Default role, middleware edge runtime için
          },
        },
      })

      if (authError) {
        setError(authError.message || "Kayıt sırasında bir hata oluştu")
        return
      }

      if (authData.user) {
        // Create user in Prisma database
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: authData.user.id,
            name: formData.name,
            studentName: formData.studentName || null,
            email: formData.email,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          // If user already exists, treat as success
          if (response.status === 200 || errorData.message?.includes("zaten")) {
            router.push("/auth/login?registered=true")
            return
          }
          setError(errorData.error || "Kullanıcı oluşturulurken bir hata oluştu")
          return
        }

        // Success - redirect to login
        router.push("/auth/login?registered=true")
      }
    } catch (err) {
      setError("Kayıt sırasında bir hata oluştu")
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
            eyebrow="Kayıt"
            title="Yeni Hesap Oluşturun"
            subtitle="Şah Avı Akademi'ye katılın ve eğitim programlarına erişin"
          />
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 py-16 md:px-6 md:py-24">
        <div className="rounded-3xl border border-[#0b0b0b]/6 bg-white p-8 shadow-xl shadow-black/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Öğrenci Adı <span className="text-xs text-[#4a4a4a]">(Opsiyonel)</span>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Öğrenci adı (varsa)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="En az 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4a4a4a]">
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="font-semibold text-gold-600 hover:text-gold-700">
              Giriş yapın
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
