'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ACTION_CARD_EDITORIAL } from '@/lib/content';
import { FACTION_META } from '@/lib/factions';
import { t } from '@/lib/i18n';
import { useSite } from './SiteProvider';

const featuredFactions = [
  { faction: 'ROMAN' as const, image: '/factions/roman/augustus.jpg' },
  { faction: 'VIKING' as const, image: '/factions/viking/bjorn.jpg' },
  { faction: 'EGYPT' as const, image: '/factions/egypt/anhur.jpg' },
  { faction: 'SAMURAI' as const, image: '/factions/samurai/hanzo.jpg' },
];

export function HomeContent() {
  const { language } = useSite();
  const copy = (key: Parameters<typeof t>[1]) => t(language, key);

  return (
    <main>
      <section className="hero-section">
        <div className="site-container grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <p className="eyebrow">KLANS</p>
            <Image src="/logo.png" alt="KLANS" width={760} height={250} className="mt-5 h-auto w-full max-w-2xl object-contain" priority />
            <h1 className="mt-7 max-w-3xl font-cinzel text-3xl font-semibold leading-tight sm:text-5xl">{copy('homeHero')}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">{copy('homeIntro')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="primary-button justify-center" href="/play">{copy('playKlans')} <span>→</span></Link>
              <Link className="secondary-button justify-center" href="/rules">{copy('discoverGame')}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredFactions.map(({ faction, image }) => (
              <Link key={faction} href="/factions" className="hero-faction-card" style={{ '--faction': FACTION_META[faction].colour } as React.CSSProperties}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--panel)]">
                  <Image src={image} alt={`${faction} faction`} fill className="object-cover" sizes="(max-width: 1024px) 45vw, 20vw" />
                </div>
                <span className="mt-3 block font-cinzel text-sm tracking-wider">{faction}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section border-t border-[var(--line)]">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="eyebrow">01</p><h2 className="section-title">{copy('theGame')}</h2></div>
          <div className="prose-copy">
            <p>{language === 'en' ? 'Each player controls a faction with five units. Players attack, defend, spy, sack, sabotage and ambush rivals.' : 'Cada jugador controla una facción con cinco unidades. Los jugadores atacan, defienden, espían, saquean, sabotean y emboscan a sus rivales.'}</p>
            <p>{language === 'en' ? 'Factions can be conquered. Players may negotiate, form alliances and betray agreements. The last player controlling at least one faction with a surviving unit wins.' : 'Las facciones pueden ser conquistadas. Los jugadores pueden negociar, formar alianzas y traicionar acuerdos. Gana el último jugador que controle al menos una facción con una unidad viva.'}</p>
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--section)]">
        <div className="site-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">02</p><h2 className="section-title">{copy('fourFactions')}</h2></div>
            <Link className="text-link" href="/factions">{copy('factions')} →</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredFactions.map(({ faction, image }) => (
              <Link key={faction} href="/factions" className="editorial-card group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--page)]">
                  <Image src={image} alt={`${faction} faction`} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width: 1024px) 45vw, 22vw" />
                </div>
                <h3 className="mt-4 font-cinzel text-lg" style={{ color: FACTION_META[faction].colour }}>{faction}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">03</p><h2 className="section-title">{copy('actionCards')}</h2></div>
            <Link className="text-link" href="/action-cards">{copy('actionCards')} →</Link>
          </div>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">{language === 'en' ? 'Seven shared action types drive attack, defence, recovery, information, theft and disruption.' : 'Siete tipos de acción compartidos impulsan el ataque, la defensa, la recuperación, la información, el robo y la interrupción.'}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ACTION_CARD_EDITORIAL.map((card) => (
              <Link key={card.type} href="/action-cards" className="mini-action-card">
                <div className="relative aspect-[3/4]">
                  <Image src={card.image} alt={card.name[language]} fill className="object-contain" sizes="16vw" />
                </div>
                <span>{card.name[language]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section border-y border-[var(--line)] bg-[var(--ink)] text-[var(--page)]">
        <div className="site-container grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow !text-[color:var(--page)]/60">04</p>
            <h2 className="mt-3 font-cinzel text-3xl font-semibold sm:text-4xl">{copy('howToPlay')}</h2>
            <p className="mt-4 max-w-xl leading-7 opacity-75">{language === 'en' ? 'Draw one card. Play, discard or pass. You cannot finish a normal turn with more than five cards in hand. DEFENCE is reactive; AMBUSH bypasses it.' : 'Roba una carta. Juega, descarta o pasa. No puedes terminar un turno normal con más de cinco cartas en la mano. DEFENSA es reactiva; EMBOSCADA la evita.'}</p>
            <Link href="/rules" className="mt-7 inline-flex font-semibold underline underline-offset-4">{copy('officialRules')} →</Link>
          </div>
          <div className="rounded-2xl border border-white/15 p-6 sm:p-8">
            <p className="eyebrow !text-white/60">{copy('playOnline')}</p>
            <p className="mt-4 text-lg leading-7">{copy('onlineNote')}</p>
            <p className="mt-3 text-sm leading-6 opacity-65">{copy('tabletopNote')}</p>
            <Link href="/play" className="mt-7 inline-flex rounded-xl bg-[#CFA24A] px-5 py-3 text-sm font-bold text-[#1f180b]">{copy('playKlans')} →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
