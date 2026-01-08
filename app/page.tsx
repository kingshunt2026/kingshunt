import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Program {
  id: string;
  title: string;
  description: string;
  level: string | null;
  duration: string | null;
  price: string | null;
  structure: string[];
  goals: string[];
}

async function getPrograms(): Promise<Program[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    });
    return programs;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

const events = [
  { name: "Golden King Blitz", type: "Online", date: "15 Şubat 2026" },
  { name: "Kadıköy Açık", type: "OTB", date: "2 Mart 2026" },
  { name: "Spring Rapid", type: "Online", date: "19 Mart 2026" },
];

async function getCoaches() {
  try {
    const { prisma } = await import("@/lib/prisma");
    // @ts-ignore - Prisma client will be generated
    const coaches = await prisma.coach.findMany({
      orderBy: [
        { type: "asc" }, // HEAD_COACH first
        { createdAt: "desc" },
      ],
    });
    return coaches;
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return [];
  }
}

export default async function Home() {
  const programs = await getPrograms();
  const coaches = await getCoaches();
  
  return (
    <div className="text-[#0b0b0b]">
      {/* Hero */}
      <section className="relative overflow-hidden py-8 md:py-12 bg-gradient-to-br from-white via-[#f8f3ea] to-[#efe6d7]">
        {/* Decorative gradient overlays */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_38%,rgba(201,162,77,0.13),transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(12,12,12,0.032)_1px,transparent_1px)] bg-[length:90px_90px] opacity-40" />
        </div>

        {/* Responsive content row */}
        <div className="relative z-10 mx-auto flex flex-col-reverse items-center gap-12 px-4 md:flex-row md:gap-8 md:px-6 max-w-6xl">
          {/* Left Side: Text + List + CTA */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 justify-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-500 mb-2">
                Şah Avı Akademi
              </p>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#101010] mb-5 leading-tight">
                Kralı Avlamaya<br className="hidden md:inline" /> Hazır mısın?
              </h1>
              <p className="text-base md:text-lg text-[#444] font-medium max-w-xl mb-4">
                Çocuklar ve yetişkinler için profesyonel satranç eğitimi. Turnuva hazırlığı, stratejik ve analitik düşünme gelişimi, psikolojik destek. İlk deneme dersiniz ücretsizdir (30 dakikaya kadar).
              </p>
              <p className="text-sm md:text-base font-semibold text-gold-800">
                💬 Dersler online olarak yapılmaktadır (Zoom, Lichess, Chess.com). Eğitim dili: Türkçe / Rusça.
              </p>
            </div>
            {/* Key features as icons list */}
            <ul className="space-y-3 mt-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500 border border-white shadow-md"></span>
                <div>
                  <span className="text-sm md:text-base font-semibold text-[#3b2a17]">
                    FIDE Ustası
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500 border border-white shadow-md"></span>
                <div>
                  <span className="text-sm md:text-base font-semibold text-[#3b2a17]">
                    10+ yıl öğretim deneyimi
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500 border border-white shadow-md"></span>
                <div>
                  <span className="text-sm md:text-base font-semibold text-[#3b2a17]">
                    Modern &amp; yapay zeka ile desteklenen öğrenme
                  </span>
                </div>
              </li>
            </ul>

            {/* Pill style highlights */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center rounded-full bg-gold-100 px-4 py-1 text-xs md:text-sm font-medium text-gold-700 border border-gold-200 shadow-sm">
                FIDE Ustası
              </span>
              <span className="inline-flex items-center rounded-full bg-gold-50 px-4 py-1 text-xs md:text-sm font-medium text-gold-700 border border-gold-100 shadow-sm">
                1-2 Ayda gelişim farkı
              </span>
              <span className="inline-flex items-center rounded-full bg-gold-100 px-4 py-1 text-xs md:text-sm font-medium text-gold-700 border border-gold-200 shadow-sm">
                Onlarca milli sporcu
              </span>
            </div>

           
          </div>

          {/* Right Side: Illustrative image area */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative">
            <div className="relative bg-gradient-to-br from-white/70 to-[#ecdfcb] rounded-3xl p-6 shadow-xl shadow-black/10 border border-[#be521c]/10 flex flex-col items-center min-h-[320px] w-full max-w-md">
              {/* Chess piece images in layered style */}
              <div className="relative flex justify-center items-end h-full w-full mt-2">
                <img
                  src="/images/pawn.png"
                  alt="Pawn"
                  className="h-[140px] md:h-[170px] absolute left-2 bottom-2 z-10 opacity-80"
                  style={{ filter: "drop-shadow(0 2px 8px #be521c22)" }}
                />
                <img
                  src="/images/king.png"
                  alt="King"
                  className="h-[170px] md:h-[210px] mx-auto z-20 relative"
                  style={{ filter: "drop-shadow(0 4px 14px #be521c33)" }}
                />
                <img
                  src="/images/queen.png"
                  alt="Queen"
                  className="h-[140px] md:h-[170px] absolute right-2 bottom-2 z-10 opacity-80"
                  style={{ filter: "drop-shadow(0 2px 8px #be521c22)" }}
                />
              </div>
              {/* Info tag */}
               {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link
                href="/programs"
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-7 py-3 text-center text-sm md:text-base font-bold text-black shadow-lg shadow-gold-500/15 transition hover:-translate-y-0.5 hover:shadow-gold-400/60"
              >
                Ders Seçenekleri
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[#be521c]/10 px-7 py-3 text-center text-sm md:text-base font-semibold text-[#0b0b0b] bg-white/70 hover:border-gold-400 hover:text-gold-600 transition"
              >
                Kulübe Katıl
              </Link>
            </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#0b0b0b]/5 bg-gradient-to-br from-white to-[#f4ecde] shadow-xl shadow-black/10">
            <Image
              src="/images/image1.jpg"
              alt="Satranç eğitimi"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <p className="text-sm font-semibold text-white">
                Taktik / Strateji
              </p>
              <p className="text-xs text-white/90">
                Her ders, şah atağı, şah güvenliği ve aktif oyun üzerine kurulu.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Okul hakkında"
              title="Online Satranç Okulu «Şah Avı»"
              subtitle="Satranç dikkat, hafıza, mantık ve özgüven geliştirir — biz de bu yolu anlaşılır ve ilginç hale getirmeye yardımcı oluyoruz."
            />
            <div className="space-y-4 text-[#3f3f3f]">
              <p className="text-base">
                Satranç üzerinde doğru çalışma sadece reytingi değil, aynı zamanda karakteri, özgüveni ve düşünmeyi de etkiler.
              </p>
              <p className="text-base">
                Profesyonel satranç yaklaşımını psikolojik destek ve düşünme gelişimi ile birleştiriyoruz. Bu, öğrencilerin sadece tahta başında değil, okulda, sınavlarda ve günlük hayatta kendilerini daha güvenli hissetmelerine yardımcı olur.
              </p>
              <p className="text-base">
                Program her öğrenci için bireysel olarak seçilir: bazıları ciddi turnuva sonuçlarına gider, bazıları zevk ve zeka gelişimi için çalışır. Her durumda amaç aynıdır — güçlü bir satranç oyuncusu gibi düşünmeyi öğretmek ve oyundan zevk almak.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0b0b0b]/10 px-5 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:border-gold-400 hover:text-gold-600"
            >
              Daha Fazla Öğren
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-[#f1ecdf]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col gap-10">
            <SectionHeading
              eyebrow="Eğitim"
              title="Eğitim Programları"
              subtitle="Yaşa ve hedefe göre yapılandırılmış, uygulanabilir haftalık planlar."
            />
            {programs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4a4a4a]">Henüz program eklenmemiş.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {programs.map((program, index) => {
                  // Default images for programs
                  const defaultImages = [
                    "https://images.unsplash.com/photo-1586165368502-1bad197e6461?w=600&q=80",
                    "https://images.unsplash.com/photo-1528819622765-d6bcf132ac31?w=600&q=80",
                    "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80",
                    "https://images.unsplash.com/photo-1606166188511-aa0b3c2c6279?w=600&q=80",
                  ];
                  const imageUrl = defaultImages[index % defaultImages.length];
                  
                  return (
                    <div
                      key={program.id}
                      className="group relative overflow-hidden rounded-3xl border border-[#0b0b0b]/5 bg-white shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold-500/20 hover:border-gold-400/60"
                    >
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={program.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        {/* Level Badge on Image */}
                        {program.level && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center rounded-full bg-gold-500/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-lg border border-gold-300/50">
                              {program.level}
                            </span>
                          </div>
                        )}
                        
                        {/* Chess Icon Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/20 backdrop-blur-sm text-gold-300 ring-2 ring-gold-400/50 shadow-lg">
                            <span className="text-2xl">♟︎</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-[#0b0b0b] mb-2 group-hover:text-gold-600 transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-sm text-[#4a4a4a] line-clamp-3 mb-4">
                          {program.description}
                        </p>

                        {/* Info Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {program.duration && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-700 border border-gold-200">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {program.duration}
                            </span>
                          )}
                          {program.price && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {program.price}
                            </span>
                          )}
                        </div>

                        {/* Structure - All Items */}
                        {program.structure && program.structure.length > 0 && (
                          <div className="mb-4 pb-4 border-b border-[#0b0b0b]/10">
                            <p className="text-xs font-semibold text-gold-600 mb-2 uppercase tracking-wide">
                              Program Yapısı
                            </p>
                            <ul className="space-y-1.5">
                              {program.structure.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[#4a4a4a]">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Link
                          href="/programs"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-gold-500/25 transition-all duration-300 hover:shadow-gold-400/40 hover:scale-105 group-hover:from-gold-500 group-hover:to-amber-600"
                        >
                          Detayları Gör
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>

                      {/* Decorative Corner Element */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gold-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Takvim"
            title="Turnuvalar ve Etkinlikler"
            subtitle="Online ve yüz yüze organizasyonlarla düzenli rekabet ortamı."
          />
          <div className="overflow-hidden rounded-2xl border border-[#0b0b0b]/5 bg-white/80 shadow-md shadow-black/5">
            {events.map((event) => (
              <div
                key={event.name}
                className="flex flex-col gap-4 border-b border-[#0b0b0b]/5 px-6 py-5 last:border-none md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-[#0b0b0b]">
                    {event.name}
                  </p>
                  <p className="text-sm text-[#4a4a4a]">{event.type}</p>
                </div>
                <p className="text-sm font-medium text-gold-700">{event.date}</p>
              </div>
            ))}
          </div>
          <Link
            href="/tournaments"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0b0b0b]/10 px-5 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:border-gold-400 hover:text-gold-600"
          >
            Tüm Etkinlikler
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Coaches */}
      <section className="bg-[#f1ecdf]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col gap-10">
            <SectionHeading
              eyebrow="Ekip"
              title="Koçlarımız"
              subtitle="FIDE sertifikalı eğitmenler ve yarışma deneyimi yüksek analistler."
            />
            {coaches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4a4a4a]">Henüz koç eklenmemiş.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {coaches.map((coach: any) => (
                  <div
                    key={coach.id}
                    className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
                  >
                    {coach.image ? (
                      <div className="mb-4 relative h-20 w-20 rounded-full overflow-hidden border-2 border-gold-400/30">
                        <Image
                          src={coach.image}
                          alt={coach.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-black text-xl font-semibold">
                        {coach.name
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")}
                      </div>
                    )}
                    <p className="text-lg font-semibold text-[#0b0b0b]">
                      {coach.name}
                    </p>
                    <p className="text-sm text-gold-700">{coach.title}</p>
                    <p className="mt-3 text-sm text-[#4a4a4a] line-clamp-3">{coach.bio}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/12 via-gold-400/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-[#0b0b0b]/8 bg-white/90 px-6 py-12 text-center shadow-xl shadow-black/10 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
              Katılım
            </p>
            <h3 className="text-3xl font-semibold text-[#0b0b0b] md:text-4xl">
              Şah avına hazır mısın?
            </h3>
            <p className="max-w-2xl text-sm text-[#3f3f3f] md:text-base">
              Üyelik, koçluk ve turnuva kayıtları hakkında detaylı bilgi için
              ekibimizle iletişime geçin.
            </p>
            <Link
              href="/contact"
              className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
