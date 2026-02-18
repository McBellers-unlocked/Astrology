"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Starfield from "./Starfield";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Starfield />
      <Header />
      <main id="main-site-wrapper" className="relative z-10 flex-1 pt-16 lg:pt-18">
        {children}
      </main>
      <Footer />
    </>
  );
}
