 import Link from "next/link";
import Image from "next/image";

 const footerLinks = [
  { title: "Programlar", href: "/programs" },
  { title: "Turnuvalar", href: "/tournaments" },
  { title: "Antrenörler", href: "/coaches" },
  { title: "İletişim", href: "/contact" },
 ];

 export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 bg-transparent">
            <Image
              src="/images/logo3.png"
              alt="Şah Avı Akademi Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gold-300">
              Şah Avı Akademi
            </p>
            <p className="mt-2 max-w-xl text-sm text-[#4a4a4a]">
              Online merkezli modern satranç kulübü. Strateji, disiplin ve
              saldırı vizyonunu aynı masada buluşturuyoruz.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[#2c2c2c]">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-gold-500"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
 }

