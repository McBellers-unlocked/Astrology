"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Verify admin access via API
    api
      .get<{ users: unknown[]; pagination: unknown }>("/admin/users?limit=1")
      .then(() => {
        setIsAdmin(true);
        setChecking(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [user, isLoading, router]);

  if (isLoading || checking || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <div className="text-purple-300 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Hide main site header/footer/starfield on admin pages */}
      <style>{`#main-site-header, #main-site-footer, #starfield-bg { display: none !important; }`}</style>
      {/* Admin header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1230]/90 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-purple-300 font-semibold text-lg">
              Stellara Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">
                Users
              </Link>
              <Link href="/admin/subscribers" className="text-gray-400 hover:text-white transition-colors">
                Subscribers
              </Link>
              <Link href="/admin/social" className="text-gray-400 hover:text-white transition-colors">
                Social
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            Back to site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 px-4 pb-12">
        <div className="max-w-7xl mx-auto py-8">{children}</div>
      </main>
    </div>
  );
}
