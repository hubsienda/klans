'use client';

import Link from 'next/link';
import type { Language } from '@/lib/types';

interface CookieBannerProps {
  language: Language;
  onAccept: () => void;
  onReject: () => void;
  onPreferences: () => void;
}

export function CookieBanner({ language, onAccept, onReject, onPreferences }: CookieBannerProps) {
  const copy = language === 'en'
    ? {
        label: 'Cookie and privacy notice',
        text: 'We use necessary browser storage for site functionality and, where enabled, optional cookies or similar technologies. You can accept, reject or manage your preferences.',
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy',
        accept: 'Accept',
        reject: 'Reject',
        preferences: 'Preferences',
      }
    : {
        label: 'Aviso de privacidad y cookies',
        text: 'Utilizamos almacenamiento necesario del navegador para el funcionamiento del sitio y, cuando estén habilitadas, cookies u otras tecnologías opcionales. Puedes aceptar, rechazar o gestionar tus preferencias.',
        privacy: 'Política de Privacidad',
        cookies: 'Política de Cookies',
        accept: 'Aceptar',
        reject: 'Rechazar',
        preferences: 'Preferencias',
      };

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--line)] bg-[var(--page-alpha)] shadow-[0_-18px_50px_rgba(0,0,0,.12)] backdrop-blur-xl"
      role="region"
      aria-label={copy.label}
    >
      <div className="site-container grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm leading-6 text-[var(--ink)]">{copy.text}</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
            <Link href="/privacy" className="text-link">{copy.privacy}</Link>
            <Link href="/cookies" className="text-link">{copy.cookies}</Link>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:min-w-[410px]">
          <button className="primary-button justify-center" onClick={onAccept}>{copy.accept}</button>
          <button className="secondary-button justify-center" onClick={onReject}>{copy.reject}</button>
          <button className="secondary-button justify-center" onClick={onPreferences}>{copy.preferences}</button>
        </div>
      </div>
    </section>
  );
}
