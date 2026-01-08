import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sahaviakademi.com"),
  title: {
    default: "Şah Avı Akademi | Modern Satranç Kulübü",
    template: "%s | Şah Avı Akademi",
  },
  description:
    "Şah Avı Akademi, strateji ve disipline odaklanan modern bir satranç kulübü. Turnuvalar, eğitim programları ve uzman koçlarla tanışın.",
  openGraph: {
    title: "Şah Avı Akademi",
    description:
      "Modern satranç kulübü: disiplinli eğitim, turnuva hazırlığı ve atak düşünme.",
    url: "https://www.sahaviakademi.com",
    siteName: "Şah Avı Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#f7f4ec] text-[#0b0b0b] antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
