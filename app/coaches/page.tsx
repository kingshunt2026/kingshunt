import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";

// Disable caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default async function CoachesPage() {
  const coaches = await getCoaches();
  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(201,162,77,0.12),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="Antrenör"
            title="Baş Antrenör Hakkında"
            subtitle="«Şah Avı» okulunun yüzü — büyük deneyime sahip profesyonel antrenör ve her öğrenciye canlı tutum."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        {coaches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#4a4a4a]">Henüz koç eklenmemiş.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {coaches.map((coach: any) => (
              <div
                key={coach.id}
                className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-8 shadow-xl shadow-black/10"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {coach.image ? (
                      <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-gold-400/30 shadow-lg">
                        <Image
                          src={coach.image}
                          alt={coach.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-black text-2xl md:text-3xl font-semibold border-4 border-gold-400/30 shadow-lg">
                        {coach.name
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-xl font-semibold text-[#0b0b0b]">{coach.name}</p>
                      <span className="rounded-full border border-gold-400/50 bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-800">
                        {coach.type === "HEAD_COACH" ? "Baş Antrenör" : 
                         coach.type === "COACH" ? "Antrenör" :
                         coach.type === "ASSISTANT_COACH" ? "Yardımcı Antrenör" :
                         "Performans Analisti"}
                      </span>
                    </div>
                    <p className="text-base text-gold-700 mb-4">{coach.title}</p>
                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{coach.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
 }

