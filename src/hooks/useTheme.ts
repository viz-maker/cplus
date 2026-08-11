'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cp-theme';

const read = (): Theme =>
  (document.documentElement.getAttribute('data-theme') as Theme | null) ?? 'light';

/**
 * Reads and writes the `data-theme` attribute the design system consumes.
 * The initial value is applied by the inline script in the root layout, so this
 * hook only has to stay in sync with it.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => setTheme(read()), []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode or storage disabled — the theme still applies for this session.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
