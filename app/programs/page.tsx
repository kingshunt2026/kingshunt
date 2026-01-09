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
  imageUrl: string | null;
  structure: string[];
  goals: string[];
}

// Default images for programs
const defaultImages = [
  "/images/program-1.png",
  "/images/program-2.png",
  "/images/program-3.png",
  "/images/program-4.png",
  "/images/program-5.png",
  "/images/program-6.png",
];

async function getPrograms(): Promise<Program[]> {
  try {
    // In server components, we can use relative URLs or direct Prisma access
    // Using Prisma directly is more efficient for server components
    const { prisma } = await import("@/lib/prisma");
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    });
    return programs.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      level: p.level,
      duration: p.duration,
      price: p.price,
      imageUrl: (p as any).imageUrl || null,
      structure: p.structure,
      goals: p.goals,
    })) as Program[];
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,162,77,0.12),transparent_32%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-12">
          <SectionHeading
            align="center"
            eyebrow="Programlar"
            title="Eğitim Programları"
            subtitle="Her seviye için kendi programı, temposu ve vurguları. Ücretsiz deneme dersi ile başlayabilirsiniz."
          />
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-16 md:px-6 md:py-12">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-[#4a4a4a] font-medium">Henüz program eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((program, index) => {
              // Use database imageUrl or fallback to default images
              const imageUrl = program.imageUrl || defaultImages[index % defaultImages.length];
              
              return (
                <div
                  key={program.id}
                  className="group rounded-3xl border border-[#0b0b0b]/6 bg-white overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={program.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm uppercase tracking-[0.15em] text-gold-300 font-semibold">
                        {program.level ? program.level : "Program"}
                      </p>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 line-clamp-2 leading-tight drop-shadow-lg">
                        {program.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <p className="text-base md:text-lg text-[#2a2a2a] mb-5 line-clamp-3 flex-1 leading-relaxed font-normal">
                      {program.description}
                    </p>
                    
                    {(program.duration || program.price) && (
                      <div className="flex flex-wrap gap-3 mb-5">
                        {program.duration && (
                          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {program.duration}
                          </div>
                        )}
                        {program.price && (
                          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {program.price}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(program.structure.length > 0 || program.goals.length > 0) && (
                      <div className="mt-auto space-y-5">
                        {program.structure.length > 0 && (
                          <div className="rounded-xl border border-[#0b0b0b]/5 bg-[#f7f4ec] p-5">
                            <p className="text-sm font-bold text-gold-700 mb-3 uppercase tracking-wide">
                              Haftalık Yapı
                            </p>
                            <ul className="space-y-2 text-sm text-[#2a2a2a] leading-relaxed">
                              {program.structure.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="mt-2 h-2 w-2 rounded-full bg-gold-500 flex-shrink-0" />
                                  <span className="line-clamp-2 flex-1">{item}</span>
                                </li>
                              ))}
                              {program.structure.length > 3 && (
                                <li className="text-sm text-gold-600 font-semibold pl-5">
                                  +{program.structure.length - 3} daha fazla
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {program.goals.length > 0 && (
                          <div className="rounded-xl border border-[#0b0b0b]/5 bg-[#f7f4ec] p-5">
                            <p className="text-sm font-bold text-gold-700 mb-3 uppercase tracking-wide">Hedefler</p>
                            <ul className="space-y-2 text-sm text-[#2a2a2a] leading-relaxed">
                              {program.goals.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="mt-2 h-2 w-2 rounded-full bg-gold-500 flex-shrink-0" />
                                  <span className="line-clamp-2 flex-1">{item}</span>
                                </li>
                              ))}
                              {program.goals.length > 3 && (
                                <li className="text-sm text-gold-600 font-semibold pl-5">
                                  +{program.goals.length - 3} daha fazla
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

