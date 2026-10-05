'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language, Theme } from '@/lib/types';
import { t } from '@/lib/i18n';
import { ConsentProvider } from './ConsentProvider';
import { SiteFooter } from './SiteFooter';

interface SiteContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export const useSite = (): SiteContextValue => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
};

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('klans-language');
    const savedTheme = window.localStorage.getItem('klans-theme');
    if (savedLanguage === 'en' || savedLanguage === 'es') setLanguage(savedLanguage);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('klans-language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('klans-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo(() => ({ language, setLanguage, theme, setTheme }), [language, theme]);
  const nav = [
    { href: '/', label: t(language, 'home') },
    { href: '/play', label: t(language, 'play') },
    { href: '/rules', label: t(language, 'rules') },
    { href: '/factions', label: t(language, 'factions') },
    { href: '/action-cards', label: t(language, 'actionCards') },
  ];

  return (
    <SiteContext.Provider value={value}>
      <ConsentProvider language={language}>
        <div className="flex min-h-screen flex-col bg-[var(--page)] text-[var(--ink)]">
          <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--page-alpha)] backdrop-blur-xl">
            <div className="site-container flex min-h-[68px] items-center justify-between gap-4">
              <Link href="/" className="flex items-center" aria-label="KLANS home" onClick={() => setMenuOpen(false)}>
                <Image src="/logo.png" alt="KLANS" width={160} height={54} className="h-9 w-auto object-contain" priority />
              </Link>
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <div className="segmented" aria-label="Language">
                  <button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}>ES</button>
                  <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                >
                  {theme === 'light' ? '☀' : '☾'}
                </button>
                <button
                  className="icon-button lg:hidden"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-label="Menu"
                >
                  {menuOpen ? '×' : '☰'}
                </button>
              </div>
            </div>
            {menuOpen && (
              <nav className="site-container grid gap-1 border-t border-[var(--line)] py-3 lg:hidden" aria-label="Mobile navigation">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{item.label}</Link>
                ))}
              </nav>
            )}
          </header>
          <div className="flex-1">{children}</div>
          <SiteFooter language={language} />
        </div>
      </ConsentProvider>
    </SiteContext.Provider>
  );
}
