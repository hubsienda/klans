'use client';

import Link from 'next/link';
import { COMPANY_ADDRESS_INLINE, COMPANY_CIF, COMPANY_NAME } from '@/lib/legal';
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
      }
    : {
        privacy: 'Política de Privacidad',
        cookies: 'Política de Cookies',
        settings: 'Configurar cookies',
      };

  const legalLine = `© ${currentYear} All rights reserved - ${COMPANY_NAME} ${COMPANY_ADDRESS_INLINE} – CIF ${COMPANY_CIF}`;

  return (
    <footer className="border-t border-[var(--line)] py-7">
      <div className="site-container flex flex-col gap-4 text-xs leading-6 text-[var(--muted)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <strong className="font-cinzel text-sm tracking-[0.12em] text-[var(--ink)]">KLANZ</strong>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label={language === 'en' ? 'Legal links' : 'Enlaces legales'}>
            <Link href="/privacy" className="text-link">{copy.privacy}</Link>
            <Link href="/cookies" className="text-link">{copy.cookies}</Link>
            <button type="button" className="text-link text-left" onClick={openPreferences}>{copy.settings}</button>
          </nav>
        </div>
        <div className="grid gap-2 border-t border-[var(--line)] pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6">
          <span className="min-w-0 break-words">{legalLine}</span>
          <span className="whitespace-normal md:text-right">
            Made with <span aria-label="heart">♥</span> by{' '}
            <a className="text-link" href="https://naralimon.com" target="_blank" rel="noopener noreferrer">Naralimon</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
