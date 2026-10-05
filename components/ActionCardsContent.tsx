'use client';

import Image from 'next/image';
import { ACTION_CARD_EDITORIAL } from '@/lib/content';
import { t } from '@/lib/i18n';
import { useSite } from './SiteProvider';

export function ActionCardsContent() {
  const { language } = useSite();
  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANS</p>
        <h1 className="section-title">{t(language, 'actionCards')}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">{t(language, 'actionPageIntro')}</p>
      </header>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ACTION_CARD_EDITORIAL.map((card) => (
          <article key={card.type} className="action-editorial-card">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--section)] p-3">
              <Image src={card.image} alt={`${card.name[language]} / ${card.type}`} fill className="object-contain p-3" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw" />
            </div>
            <div className="p-5">
              <p className="eyebrow">{card.type}</p>
              <h2 className="mt-2 font-cinzel text-xl">{card.name[language]}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.effect[language]}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
