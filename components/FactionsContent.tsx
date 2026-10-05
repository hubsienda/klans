'use client';

import Image from 'next/image';
import { FACTIONS, FACTION_IMAGES, FACTION_META } from '@/lib/factions';
import { t } from '@/lib/i18n';
import { useSite } from './SiteProvider';

export function FactionsContent() {
  const { language } = useSite();
  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANS</p>
        <h1 className="section-title">{t(language, 'factions')}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">{t(language, 'factionPageIntro')}</p>
      </header>
      <div className="mt-12 space-y-16">
        {FACTIONS.map((faction) => (
          <section key={faction} aria-labelledby={`faction-${faction.toLowerCase()}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl" style={{ color: FACTION_META[faction].colour }}>{FACTION_META[faction].symbol}</span>
              <h2 id={`faction-${faction.toLowerCase()}`} className="font-cinzel text-2xl font-semibold tracking-wider">{faction}</h2>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {FACTION_IMAGES[faction].map((unit) => (
                <article key={unit.name} className="faction-gallery-card" style={{ '--faction': FACTION_META[faction].colour } as React.CSSProperties}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--section)]">
                    <Image src={unit.src} alt={`${unit.name} — ${faction}`} fill className="object-contain" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw" />
                  </div>
                  <h3 className="mt-3 text-center font-cinzel text-sm tracking-wider sm:text-base">{unit.name}</h3>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
