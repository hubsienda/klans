import type { Metadata } from 'next';
import { SiteProvider } from '@/components/SiteProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'KLANS — Strategic Card Game',
    template: '%s | KLANS',
  },
  description: 'KLANS is a strategic faction card game of survival, conquest, diplomacy and betrayal, with a Human-vs-Computer browser adaptation.',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
