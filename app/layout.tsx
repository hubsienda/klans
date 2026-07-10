import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KLANS — Solo Playtest Edition',
  description: 'A browser-based solo playtest prototype for the KLANS card game.',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
