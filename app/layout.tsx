import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import { SiteProvider } from '@/components/SiteProvider';
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
  title: {
    default: 'KLANS — Strategic Card Game',
    template: '%s | KLANS',
  },
  description: 'KLANS is a strategic faction card game of survival, conquest, diplomacy and betrayal, with a Human-vs-Computer browser adaptation.',
  creator: 'Naralimon s.c.',
  publisher: 'Naralimon s.c.',
  other: {
    copyright: `© ${currentYear} Naralimon s.c. KLANS. All rights reserved.`,
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
