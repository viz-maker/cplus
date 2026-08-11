import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@constructpluseu/react/styles.css';
import '../styles/global.css';

/** Self-hosted by Next at build time — no request to Google Fonts at runtime. */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Construct+ · Gestão de obra',
  description:
    'Gestão de obra, do orçamento à faturação. Agenda, aprovisionamento e orçamentos numa única plataforma para equipas de construção e reabilitação.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * Applies the stored theme before first paint, so a dark-mode user never sees a
 * white flash. Kept inline and tiny on purpose — it must run before the CSS
 * paints, which rules out doing this in an effect.
 */
const THEME_BOOTSTRAP = `
try {
  var t = localStorage.getItem('cp-theme');
  if (t !== 'dark' && t !== 'light') {
    t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" className={inter.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
