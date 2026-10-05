'use client';

import { RULE_SECTIONS } from '@/lib/content';
import { t } from '@/lib/i18n';
import { useSite } from './SiteProvider';

export function RulesContent() {
  const { language } = useSite();
  const currentYear = new Date().getFullYear();
  const copyrightNotice = language === 'en'
    ? `KLANS, its rules, game system, names, artwork and associated game materials are protected by copyright. © ${currentYear} Naralimon s.c. All rights reserved.`
    : `KLANS, sus reglas, sistema de juego, nombres, ilustraciones y materiales asociados están protegidos por derechos de autor. © ${currentYear} Naralimon s.c. Todos los derechos reservados.`;

  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANS</p>
        <h1 className="section-title">{t(language, 'rules')}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {language === 'en'
            ? 'Complete tabletop rules. The online Human-vs-Computer adaptation uses only two active factions and ends when the opposing faction loses its last living unit.'
            : 'Reglas completas del juego de mesa. La adaptación online Humano contra Ordenador utiliza solo dos facciones activas y termina cuando la facción rival pierde su última unidad viva.'}
        </p>
      </header>
      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
          <nav className="rules-toc" aria-label="Rules sections">
            {RULE_SECTIONS.map((section) => <a key={section.id} href={`#${section.id}`}>{section.number}. {section.title[language]}</a>)}
          </nav>
        </aside>
        <article className="space-y-10">
          {RULE_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="rule-section scroll-mt-24">
              <div className="flex items-start gap-4">
                <span className="rule-number">{String(section.number).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h2 className="font-cinzel text-2xl font-semibold">{section.title[language]}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                    {section.body[language].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {section.bullets && (
                    <ul className="mt-5 grid gap-2 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
                      {section.bullets[language].map((bullet) => <li key={bullet} className="rounded-lg border border-[var(--line)] bg-[var(--page)] px-3 py-2">{bullet}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
          <p className="border-t border-[var(--line)] pt-5 text-xs leading-6 text-[var(--muted)]">{copyrightNotice}</p>
        </article>
      </div>
    </main>
  );
}
