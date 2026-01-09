"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";

const navLinks = [
  { href: "/", label: "Anasayfa" },
  { href: "/about", label: "Hakkında" },
  { href: "/programs", label: "Programlar" },
  { href: "/tournaments", label: "Turnuvalar" },
  { href: "/coaches", label: "Antrenörler" },
  { href: "/ukd-hesaplama", label: "UKD" },
  { href: "/contact", label: "İletişim" },
];

const linkBase =
  "relative text-sm font-medium transition hover:-translate-y-0.5 hover:text-gold-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400 pb-1 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-gold-400 after:to-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useUser();

  return (
   <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md shadow-sm shadow-black/5">
     <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
     <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 md:px-4 lg:px-6">
       <Link
         href="/"
         className="group flex items-center gap-2.5 text-lg font-semibold text-[#0b0b0b] flex-shrink-0"
       >
         <div className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0 transition-transform group-hover:-translate-y-0.5 bg-transparent">
           <Image
             src="/images/logo3.png"
             alt="Şah Avı Akademi Logo"
             fill
             className="object-contain scale-[2]"
             priority
           />
         </div>
         <div className="leading-tight hidden sm:block">
           <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gold-300">
             Şah Avı
           </p>
           <p className="text-sm md:text-base font-semibold text-[#0b0b0b]">Akademi</p>
         </div>
       </Link>

      <nav className="relative hidden items-center gap-3 lg:gap-4 xl:gap-5 md:flex">
        <div className="pointer-events-none absolute inset-y-0 -left-4 -right-4 -z-10 rounded-full bg-gradient-to-r from-amber-200/60 via-white to-amber-100/40 blur-xl transition duration-300" />
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === link.href
              : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkBase} whitespace-nowrap ${
                isActive
                  ? "text-gold-600 after:scale-x-100"
                  : "text-[#0b0b0b]/70"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {/* User Actions */}
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-[#0b0b0b]/10">
          {user ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg border border-gold-400/50 bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold-500/25 hover:border-gold-500/70 whitespace-nowrap"
              >
                Profil
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:from-purple-500/25 hover:to-indigo-500/25 hover:border-purple-500/70 whitespace-nowrap shadow-sm shadow-purple-500/20"
                >
                  ⚙️ Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-[#0b0b0b]">
                    {user.name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-[#4a4a4a] capitalize">
                    {user.role === "ADMIN" ? "Admin" : user.role === "COACH" ? "Antrenör" : "Üye"}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg border border-red-400/50 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-500/70 whitespace-nowrap"
                >
                  Çıkış
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 whitespace-nowrap"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </nav>


       <button
         type="button"
         className="flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm font-semibold text-[#0b0b0b] shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-gold-200/50 md:hidden"
         onClick={() => setOpen((prev) => !prev)}
         aria-label="Menüyü aç/kapat"
       >
         <span>Menü</span>
         <svg
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
           strokeWidth="1.5"
           stroke="currentColor"
           className="h-4 w-4"
         >
           <path
             strokeLinecap="round"
             strokeLinejoin="round"
             d={
               open
                 ? "M6 18 18 6M6 6l12 12"
                 : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
             }
           />
         </svg>
       </button>
     </div>

     {open && (
       <>
         <div
           className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm md:hidden"
           onClick={() => setOpen(false)}
         />
         <div className="relative z-40 border-t border-black/5 bg-white/98 shadow-2xl shadow-black/10 md:hidden">
           <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
             <div className="grid gap-3 md:grid-cols-2">
               {navLinks.map((link) => {
                 const isActive =
                   link.href === "/"
                     ? pathname === link.href
                     : pathname?.startsWith(link.href);
                 return (
                   <Link
                     key={link.href}
                     href={link.href}
                     className={`flex items-center justify-between rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-gold-200/60 ${linkBase} ${
                       isActive
                         ? "text-gold-700 after:scale-x-100"
                         : "text-[#0b0b0b]/80"
                     }`}
                     onClick={() => setOpen(false)}
                   >
                     <span>{link.label}</span>
                     <span className="text-xs text-[#6b6b6b]">→</span>
                   </Link>
                 );
               })}
             </div>
             <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               <p className="text-sm text-[#4a4a4a]">
                 Üyelik ve kayıt için hızlı erişim:
               </p>
               <div className="flex flex-col gap-2 sm:flex-row">
                 <Link
                   href="/programs"
                   className="rounded-full border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 shadow-sm shadow-gold-400/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/50"
                   onClick={() => setOpen(false)}
                 >
                   Programlar
                 </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-full border border-gold-400/50 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-gold-800 transition hover:bg-gold-500/25"
                  onClick={() => setOpen(false)}
                >
                  Profil
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="rounded-lg border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:from-purple-500/25 hover:to-indigo-500/25 hover:border-purple-500/70 shadow-sm shadow-purple-500/20"
                    onClick={() => setOpen(false)}
                  >
                    ⚙️ Admin
                  </Link>
                )}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[#0b0b0b]/5 bg-[#f7f4ec]">
                  <div>
                    <div className="text-sm font-medium text-[#0b0b0b]">
                      {user.name || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-[#4a4a4a] capitalize">
                      {user.role === "ADMIN" ? "Admin" : user.role === "COACH" ? "Antrenör" : "Üye"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut()
                      setOpen(false)
                    }}
                    className="rounded-lg border border-red-400/50 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-500/70"
                  >
                    Çıkış
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
                onClick={() => setOpen(false)}
              >
                Giriş Yap
              </Link>
            )}
               </div>
             </div>
           </div>
         </div>
       </>
     )}
   </header>
 );
}
