import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Starfield from "@/components/layout/Starfield";
import JsonLd from "@/components/seo/JsonLd";
import Analytics from "@/components/Analytics";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stellara.co"),
  title: {
    default: "Stellara — Your Stars, Decoded | Astrology, Birth Charts & Horoscopes",
    template: "%s | Stellara",
  },
  description:
    "Discover your cosmic blueprint with Stellara. Professional-grade birth charts, AI-powered daily horoscopes, deep compatibility analysis, and zodiac insights — all beautifully simplified.",
  keywords: [
    "astrology", "birth chart", "natal chart", "horoscope", "daily horoscope",
    "zodiac signs", "compatibility", "synastry", "composite chart", "star sign",
    "moon sign", "rising sign", "ascendant", "zodiac compatibility",
    "astrology app", "free birth chart", "love horoscope", "career horoscope",
  ],
  authors: [{ name: "Stellara" }],
  creator: "Stellara",
  publisher: "Stellara",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stellara.co",
    siteName: "Stellara",
    title: "Stellara — Your Stars, Decoded",
    description:
      "Professional-grade birth charts, AI-powered daily horoscopes, and deep compatibility analysis. Your complete astrology platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellara — Your Stars, Decoded",
    description:
      "Professional-grade birth charts, AI-powered daily horoscopes, and deep compatibility analysis.",
    creator: "@stellara_co",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://stellara.co",
    languages: {
      "en-US": "https://stellara.co",
      "en-GB": "https://stellara.co/en-gb",
      "es": "https://stellara.co/es",
      "pt": "https://stellara.co/pt",
      "fr": "https://stellara.co/fr",
      "hi": "https://stellara.co/hi",
    },
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Stellara",
  alternateName: "Stellara Astrology",
  url: "https://stellara.co",
  description: "Professional-grade astrology platform with birth charts, daily horoscopes, and compatibility analysis.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://stellara.co/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Stellara",
  url: "https://stellara.co",
  logo: "https://stellara.co/logo.png",
  sameAs: [
    "https://twitter.com/stellara_co",
    "https://instagram.com/stellara_co",
    "https://tiktok.com/@stellara_co",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@stellara.co",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd data={websiteSchema} />
        <JsonLd data={organizationSchema} />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Analytics />
          <Starfield />
          <Header />
          <main className="relative z-10 flex-1 pt-16 lg:pt-18">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
