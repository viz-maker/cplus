import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
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
  themeColor: '#0D2137',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
