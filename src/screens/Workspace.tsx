'use client';

import { useEffect, useState } from 'react';
import { ToastProvider } from '@constructpluseu/react';
import { Brand } from '../components/Brand';
import { AppStoreProvider } from '../store/AppStore';
import { ConstructPlusApp } from './ConstructPlusApp';

/**
 * Client boundary for the whole workspace.
 *
 * Rendering is gated on mount on purpose. The app reads `window.innerWidth` for
 * its responsive layout and `new Date()` for "today"; on the server those are a
 * guess and a UTC timestamp, which would hydrate into a different tree than the
 * browser produces. This is an authenticated internal tool with no SEO value,
 * so paying one frame of splash is cheaper than defending every component
 * against hydration drift.
 *
 * `ToastProvider` sits outside the store because the store raises toasts.
 */
export function Workspace() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <BootSplash />;

  return (
    <ToastProvider>
      <AppStoreProvider>
        <ConstructPlusApp />
      </AppStoreProvider>
    </ToastProvider>
  );
}

function BootSplash() {
  return (
    <div className="cp-boot-splash">
      <Brand on="brand" />
    </div>
  );
}
