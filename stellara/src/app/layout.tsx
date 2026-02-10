import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Starfield from "@/components/layout/Starfield";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellara - Your Stars, Decoded",
  description:
    "Discover your cosmic blueprint with professional-grade astrology. Birth charts, horoscopes, compatibility, and zodiac insights beautifully simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Starfield />
        <Header />
        <main className="relative z-10 flex-1 pt-16 lg:pt-18">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
