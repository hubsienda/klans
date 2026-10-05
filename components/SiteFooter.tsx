'use client';

import Link from 'next/link';
import type { Language } from '@/lib/types';
import { useConsent } from './ConsentProvider';

export function SiteFooter({ language }: { language: Language }) {
  const { openPreferences } = useConsent();
  const copy = language === 'en'
    ? {
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy',
        settings: 'Cookie Settings',
      }
    : {
        privacy: 'Política de Privacidad',
        cookies: 'Política de Cookies',
        settings: 'Configurar cookies',
      };

  return (
    <footer className="border-t border-[var(--line)] py-7">
      <div className="site-container flex flex-col gap-4 text-xs text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <strong className="font-cinzel text-sm tracking-[0.12em] text-[var(--ink)]">KLANS</strong>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label={language === 'en' ? 'Legal links' : 'Enlaces legales'}>
          <Link href="/privacy" className="text-link">{copy.privacy}</Link>
          <Link href="/cookies" className="text-link">{copy.cookies}</Link>
          <button type="button" className="text-link text-left" onClick={openPreferences}>{copy.settings}</button>
        </nav>
        <span>
          Made with <span aria-label="heart">♥</span> by{' '}
          <a className="text-link" href="https://naralimon.com" target="_blank" rel="noopener noreferrer">Naralimon</a>
        </span>
      </div>
    </footer>
  );
}
