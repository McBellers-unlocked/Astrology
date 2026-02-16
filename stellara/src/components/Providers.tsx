'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { captureUtmParams } from '@/lib/tracking';

export default function Providers({ children }: { children: ReactNode }) {
  // Capture UTM params from landing URL on first render
  useEffect(() => {
    captureUtmParams();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
