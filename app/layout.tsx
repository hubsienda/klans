import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import { SiteProvider } from '@/components/SiteProvider';
import { COMPANY_NAME } from '@/lib/legal';
import { SITE_ORIGIN } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  weight: ['500', '600', '700'],
});

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'KLANZ — Strategic Card Game',
    template: '%s | KLANZ',
  },
  description: 'KLANZ is a strategic faction card game of survival, conquest, diplomacy and betrayal, with a Human-vs-Computer browser adaptation.',
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  other: {
    copyright: `© ${currentYear} ${COMPANY_NAME} KLANZ. All rights reserved.`,
  },
  icons: { icon: '/favicon.png', shortcut: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable}`}>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
