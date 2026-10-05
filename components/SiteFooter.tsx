'use client';

import Link from 'next/link';
import type { Language } from '@/lib/types';
import { useConsent } from './ConsentProvider';

export function SiteFooter({ language }: { language: Language }) {
  const { openPreferences } = useConsent();
  const currentYear = new Date().getFullYear();
  const copy = language === 'en'
    ? {
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy',
        settings: 'Cookie Settings',
        copyright: `© ${currentYear} Naralimon s.c. KLANS. All rights reserved.`,
      }
    : {
        privacy: 'Política de Privacidad',
        cookies: 'Política de Cookies',
        settings: 'Configurar cookies',
        copyright: `© ${currentYear} Naralimon s.c. KLANS. Todos los derechos reservados.`,
      };

  return (
    <footer className="border-t border-[var(--line)] py-7">
      <div className="site-container flex flex-col gap-4 text-xs text-[var(--muted)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <strong className="font-cinzel text-sm tracking-[0.12em] text-[var(--ink)]">KLANS</strong>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label={language === 'en' ? 'Legal links' : 'Enlaces legales'}>
            <Link href="/privacy" className="text-link">{copy.privacy}</Link>
            <Link href="/cookies" className="text-link">{copy.cookies}</Link>
            <button type="button" className="text-link text-left" onClick={openPreferences}>{copy.settings}</button>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.copyright}</span>
          <span>
            Made with <span aria-label="heart">♥</span> by{' '}
            <a className="text-link" href="https://naralimon.com" target="_blank" rel="noopener noreferrer">Naralimon</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
