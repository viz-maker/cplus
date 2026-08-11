import { useEffect, useState } from 'react';

/** Below this the sidebar becomes an overlay drawer. */
export const NARROW_BREAKPOINT = 1024;

/** Below this the header hides the user's name/role and page padding shrinks. */
export const COMPACT_BREAKPOINT = 640;

/** Below this the login screen drops its brand panel. */
export const BRAND_BREAKPOINT = 900;

export function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
