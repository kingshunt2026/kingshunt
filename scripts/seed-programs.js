const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

const programDetails = [
  {
    title: "Yeni Başlayanlar",
    description:
      "Sıfırdan güvenli oyuna kadar. Kurallar ve temel oyun sonları, basit mat yapıları, açılış temelleri ve merkez kontrolü, ilk taktik motifler.",
    structure: [
      "Açılış, orta oyun, oyun sonu temelleri",
      "Taktik ve kombinasyon çalışması",
      "Oyun analizi ve ödevler",
    ],
    goals: [
      "Temel kuralları öğrenme",
      "Basit mat kalıplarını kavrama",
      "İlk taktik motifleri tanıma",
    ],
    pricing: "Bireysel dersler — 30, 45 veya 60 dakika",
    level: "Başlangıç",
  },
  {
    title: "Orta Seviye",
    description:
      "Güçlenme ve reyting artışı. Öğrencinin stilini göz önünde bulundurarak açılış repertuvarı, orta oyunda tipik pozisyonlar ve planlar, derin taktik ve kombinasyonlar, kendi oyunlarının analizi.",
    structure: [
      "Açılış repertuvarı geliştirme",
      "Derin taktik çalışması",
      "Kendi oyunlarının analizi",
    ],
    goals: [
      "Açılış prensipleri ve repertuvar",
      "Taktik hesap derinliği",
      "Oyun sonu temel planlar",
    ],
    pricing: "Bireysel dersler — 30, 45 veya 60 dakika",
    level: "Orta",
  },
  {
    title: "Turnuvalar",
    description:
      "Ciddi hazırlık. Rakip oyunlarının analizi, derin açılış çalışmaları, karmaşık oyun sonları, yarışmalara psikolojik hazırlık.",
    structure: [
      "Rakip oyunlarının analizi",
      "Derin açılış çalışmaları",
      "Psikolojik hazırlık",
    ],
    goals: [
      "Derin analiz rutini",
      "Psikolojik hazırlık",
      "Reyting odaklı gelişim planı",
    ],
    pricing: "Bireysel dersler — 30, 45 veya 60 dakika",
    level: "İleri",
  },
];

async function seedPrograms() {
  try {
    console.log('🌱 Programlar veritabanına ekleniyor...\n');

    for (const program of programDetails) {
      // Check if program already exists
      const existing = await prisma.program.findFirst({
        where: { title: program.title }
      });

      if (existing) {
        console.log(`⏭️  "${program.title}" zaten mevcut, atlanıyor...`);
        continue;
      }

      // Extract duration from pricing if possible
      const duration = program.pricing.includes('30') ? '30 dakika' : 
                      program.pricing.includes('45') ? '45 dakika' : 
                      program.pricing.includes('60') ? '60 dakika' : null;

      const created = await prisma.program.create({
        data: {
          title: program.title,
          description: program.description,
          level: program.level,
          duration: duration,
          price: program.pricing,
          structure: program.structure,
          goals: program.goals,
        },
      });

      console.log(`✅ "${program.title}" eklendi (ID: ${created.id})`);
    }

    console.log('\n✨ Programlar başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPrograms();

