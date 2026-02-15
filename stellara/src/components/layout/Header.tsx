"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ChevronRight, User, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Horoscopes", href: "/horoscope" },
  { label: "Birth Chart", href: "/birth-chart" },
  { label: "Compatibility", href: "/compatibility" },
  { label: "Zodiac Signs", href: "/zodiac" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

export default function Header() {
  const { user, isLoading, isPremium, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-space-900/80 backdrop-blur-xl border-b border-celestial-700/20 shadow-lg shadow-space-900/50"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 lg:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-5 w-5 text-celestial-300 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="gradient-text text-xl font-bold tracking-tight">
              Stellara
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex" role="navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-3 py-2 text-sm font-medium text-dust-300 transition-colors duration-200 hover:text-foreground hover:bg-celestial-700/15"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Auth + CTA + Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {!isLoading && !user && (
              /* Logged out — Sign In link (desktop only) */
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-dust-400 transition-colors hover:text-foreground lg:flex"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}

            {!isLoading && user && (
              /* Logged in — User menu (desktop only) */
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-celestial-700/30 text-xs font-bold text-celestial-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  {isPremium && (
                    <Crown className="h-3.5 w-3.5 text-stardust-400" />
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-celestial-700/20 bg-space-800/95 shadow-lg shadow-space-900/60 backdrop-blur-xl">
                      <div className="border-b border-celestial-700/15 px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-dust-500">{user.email}</p>
                        {isPremium && (
                          <span className="premium-badge mt-1 inline-block text-[10px]">
                            {user.subscriptionTier === 'cosmic' ? 'Cosmic' : 'Stellar'}
                          </span>
                        )}
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/pricing"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Crown className="h-4 w-4" />
                          {isPremium ? 'Manage Plan' : 'Upgrade'}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CTA Button (desktop) */}
            <Link
              href="/birth-chart"
              className="btn-glow hidden text-sm lg:inline-flex"
            >
              <span>Get Your Chart</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-dust-300 transition-colors hover:bg-celestial-700/20 hover:text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-space-900/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-space-900/95 backdrop-blur-2xl border-l border-celestial-700/20">
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-celestial-700/15">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <Sparkles className="h-5 w-5 text-celestial-300" />
              <span className="gradient-text text-lg font-bold tracking-tight">
                Stellara
              </span>
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-dust-400 transition-colors hover:bg-celestial-700/20 hover:text-foreground"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-dust-200 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-dust-500" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-celestial-700/30 to-transparent" />

            {/* Auth section (mobile) */}
            {!isLoading && !user && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                  onClick={closeMobileMenu}
                >
                  <User className="h-4.5 w-4.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-celestial-300 transition-colors hover:bg-celestial-700/15"
                  onClick={closeMobileMenu}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Create Account</span>
                </Link>
              </>
            )}

            {!isLoading && user && (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-celestial-700/30 text-sm font-bold text-celestial-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-dust-500">{user.email}</p>
                  </div>
                  {isPremium && (
                    <Crown className="ml-auto h-4 w-4 text-stardust-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-foreground"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </nav>

          {/* Drawer Footer CTA */}
          <div className="border-t border-celestial-700/15 p-4">
            <Link
              href="/birth-chart"
              className="btn-glow flex w-full justify-center text-sm"
              onClick={closeMobileMenu}
            >
              <span>Get Your Chart</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
