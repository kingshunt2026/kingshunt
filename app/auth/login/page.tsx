"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SectionHeading } from "@/components/section-heading"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Daha detaylı hata mesajları
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Email adresiniz henüz onaylanmamış. Lütfen email kutunuzu kontrol edin.")
        } else {
          setError(signInError.message || "Giriş yapılırken bir hata oluştu")
        }
        console.error("Login error:", signInError)
      } else if (data.user) {
        // Callback URL varsa oraya, yoksa profile'a yönlendir
        const callbackUrl = searchParams.get("callbackUrl") || "/profile"
        window.location.href = callbackUrl
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.")
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
            eyebrow="Giriş"
            title="Hesabınıza Giriş Yapın"
            subtitle="Üyelik sistemine erişmek için giriş yapın"
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4a4a4a]">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="font-semibold text-gold-600 hover:text-gold-700">
              Kayıt olun
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="text-[#0b0b0b]">
        <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,77,0.14),transparent_30%)]" />
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
            <SectionHeading
              align="center"
              eyebrow="Giriş"
              title="Hesabınıza Giriş Yapın"
              subtitle="Üyelik sistemine erişmek için giriş yapın"
            />
          </div>
        </section>
        <section className="mx-auto max-w-md px-4 py-16 md:px-6 md:py-24">
          <div className="rounded-3xl border border-[#0b0b0b]/6 bg-white p-8 shadow-xl shadow-black/10">
            <div className="text-center text-[#4a4a4a]">Yükleniyor...</div>
          </div>
        </section>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
