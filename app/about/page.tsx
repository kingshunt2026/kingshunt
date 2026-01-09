 import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";

const pillars = [
  {
    title: "Eğitimin Faydaları",
    icon: "/images/benefit-icon.png",
    text: "Öğrenci için sonuçlar: Reyting artışı ve turnuvalarda daha istikrarlı oyun, dikkat, hafıza, mantık ve analitik düşünme gelişimi, turnuvalarda, kontrol ve sınavlarda özgüven, disiplin, planlama ve oyunları sonuna kadar getirme yeteneği, bireysel plan: hobi, güçlenme veya ciddi spor.",
  },
  {
    title: "Neden «Şah Avı»?",
    icon: "/images/why-us-icon.png",
    text: "Online okul sistematik yaklaşımı, canlı iletişimi ve her öğrenciye dikkatli tutumu birleştirir. Hazırlık: Amatörden turnuvalara kadar yol. Her seviyedeki öğrencilerle çalışıyoruz. Öğrencilerimiz ulusal ve uluslararası yarışmalara, Avrupa ve dünya şampiyonlarına katıldı.",
  },
  {
    title: "Yaklaşım",
    icon: "/images/lesson-icon.png",
    text: "Yapılandırılmış dersler. Açılış, orta oyun, oyun sonu, taktik, strateji, oyun analizi, ödevler ve ilerleme kontrolü — hepsi anlaşılır bir sisteme dönüştürülmüştür, bu da istikrarlı ve güvenli büyümeye yardımcı olur.",
  },
];

 export default function AboutPage() {
  return (
    <div className="text-[#0b0b0b]">


      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl mb-12 flex flex-col md:flex-row items-center gap-8 bg-[#fffdef] p-6 md:p-10 rounded-2xl shadow-lg shadow-black/5 border border-[#deb768]/10">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-gold-300 shadow-lg shadow-black/10 bg-gradient-to-br from-gold-400/20 to-amber-500/20 flex items-center justify-center">
              <span className="text-5xl">♔</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-2">
              FM Teymur Başirov Rafikoviç
            </h2>
            <div className="text-gold-800 font-semibold mb-3">
              FIDE Ustası, Şah Avı Akademi Kurucusu ve Baş Antrenörü
            </div>
            <p className="text-[#4a4a4a] text-base leading-relaxed">
              Teymur 10 yıldan fazla satranç antrenörü olarak çalışıyor, farklı seviyelerde hazırlık yapan çocukları ve yetişkinleri eğitiyor. Onun rehberliğinde öğrenciler ulusal şampiyonalara, Avrupa ve dünya şampiyonlarına katıldı. Çalışmada sadece teknik ve açılış, orta oyun ve oyun sonu bilgilerine değil, aynı zamanda mantıksal, stratejik ve analitik düşünme gelişimine de vurgu yapıyor.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/10"
            >
              <div className="mb-5">
                <Image 
                  src={item.icon} 
                  alt={item.title} 
                  width={64} 
                  height={64}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#0b0b0b] mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
 }

