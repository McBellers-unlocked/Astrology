"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Twitter,
  Instagram,
  Youtube,
  ChevronDown,
  Globe,
} from "lucide-react";

const exploreLinks = [
  { label: "Horoscopes", href: "/horoscope" },
  { label: "Birth Chart", href: "/birth-chart" },
  { label: "Compatibility", href: "/compatibility" },
  { label: "Zodiac Signs", href: "/zodiac" },
];

const learnLinks = [
  { label: "Zodiac Signs", href: "/zodiac" },
  { label: "Birth Charts", href: "/birth-chart" },
  { label: "Compatibility", href: "/compatibility" },
  { label: "Daily Horoscopes", href: "/horoscope" },
];

const companyLinks = [
  { label: "Pricing", href: "/pricing" },
];

const socialLinks = [
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "fr", label: "Francais" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portugues" },
];

export default function Footer() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const currentLanguage = languages.find((l) => l.code === selectedLanguage);

  return (
    <footer className="relative z-10 mt-auto">
      {/* Section divider at top */}
      <div className="section-divider" />

      {/* Main footer content */}
      <div className="glass-card mx-4 mb-6 mt-8 rounded-2xl sm:mx-6 lg:mx-8">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className="group inline-flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5 text-celestial-300 transition-transform duration-300 group-hover:rotate-12" />
                <span className="gradient-text text-xl font-bold tracking-tight">
                  Stellara
                </span>
              </Link>

              <p className="mt-3 text-sm leading-relaxed text-dust-400">
                Your stars, decoded.
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-dust-500">
                Discover the cosmic blueprint written in the stars at the moment
                of your birth. Professional-grade astrology, beautifully
                simplified.
              </p>

              {/* Social Icons */}
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-celestial-700/15 bg-space-800/40 text-dust-400 transition-all duration-200 hover:border-celestial-500/30 hover:bg-celestial-700/20 hover:text-celestial-200"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Explore */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dust-300">
                Explore
              </h3>
              <ul className="mt-4 space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-dust-400 transition-colors duration-200 hover:text-celestial-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Learn */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dust-300">
                Learn
              </h3>
              <ul className="mt-4 space-y-3">
                {learnLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-dust-400 transition-colors duration-200 hover:text-celestial-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dust-300">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-dust-400 transition-colors duration-200 hover:text-celestial-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-celestial-700/15">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row sm:px-8 lg:px-12">
            <p className="text-xs text-dust-500">
              &copy; 2026 Stellara. All rights reserved.
            </p>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-celestial-700/15 bg-space-800/40 px-3 py-1.5 text-xs text-dust-400 transition-all duration-200 hover:border-celestial-500/30 hover:text-dust-300"
                onClick={() => setLanguageOpen((prev) => !prev)}
                aria-expanded={languageOpen}
                aria-haspopup="listbox"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLanguage?.label ?? "English"}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    languageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {languageOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageOpen(false)}
                    aria-hidden="true"
                  />
                  <ul
                    className="absolute bottom-full right-0 z-20 mb-2 w-40 overflow-hidden rounded-lg border border-celestial-700/20 bg-space-800/95 backdrop-blur-xl shadow-lg shadow-space-900/60"
                    role="listbox"
                    aria-label="Select language"
                  >
                    {languages.map((lang) => (
                      <li key={lang.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedLanguage === lang.code}
                          className={`flex w-full items-center px-3 py-2 text-xs transition-colors ${
                            selectedLanguage === lang.code
                              ? "bg-celestial-700/20 text-celestial-200"
                              : "text-dust-400 hover:bg-celestial-700/10 hover:text-dust-200"
                          }`}
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            setLanguageOpen(false);
                          }}
                        >
                          {lang.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
