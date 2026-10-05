'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CARD_DEFINITIONS, getCardDefinition } from '@/lib/cards';
import { FACTIONS, FACTION_META } from '@/lib/factions';
import {
  aiStep,
  beginTurn,
  canAct,
  canEndTurn,
  canPlayCard,
  closeComputerHandReveal,
  discardCard,
  endTurn,
  getPlayer,
  playCard,
  resolveDefence,
  startGame,
  validTargetsForCard,
} from '@/lib/gameEngine';
import { t } from '@/lib/i18n';
import type { CardInstance, Difficulty, Faction, GameState, Unit } from '@/lib/types';
import { randomItem } from '@/lib/utils';
import { useSite } from './SiteProvider';

export function KlansApp() {
  const { language } = useSite();
  const [screen, setScreen] = useState<'SETUP' | 'GAME' | 'END'>('SETUP');
  const [humanFaction, setHumanFaction] = useState<Faction>('ROMAN');
  const [computerFaction, setComputerFaction] = useState<Faction | 'RANDOM'>('RANDOM');
  const [difficulty, setDifficulty] = useState<Difficulty>('SIMPLE');
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const copy = (key: Parameters<typeof t>[1]) => t(language, key);

  useEffect(() => {
    if (!game || game.winner || game.revealComputerHand) return;
    if (game.currentPlayer !== 'COMPUTER' || game.phase !== 'ACTION') return;
    const timer = window.setTimeout(() => setGame((current) => current ? aiStep(current) : current), 650);
    return () => window.clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    if (game?.winner) setScreen('END');
    if (game?.phase !== 'ACTION') setSelectedCardId(null);
  }, [game?.winner, game?.phase]);

  const beginMatch = () => {
    const available = FACTIONS.filter((faction) => faction !== humanFaction);
    const opponent = computerFaction === 'RANDOM' ? (randomItem(available) ?? available[0]) : computerFaction;
    if (opponent === humanFaction) return;
    const ready = startGame({ humanFaction, computerFaction: opponent, difficulty });
    setGame(beginTurn(ready));
    setSelectedCardId(null);
    setNotice('');
    setScreen('GAME');
  };

  const restartMatch = () => {
    if (!game) return;
    const ready = startGame({ humanFaction: game.human.faction, computerFaction: game.computer.faction, difficulty: game.difficulty });
    setGame(beginTurn(ready));
    setSelectedCardId(null);
    setNotice('');
    setScreen('GAME');
  };

  if (screen === 'SETUP') {
    const opponents = FACTIONS.filter((faction) => faction !== humanFaction);
    return (
      <main className="site-container py-10 sm:py-14">
        <header className="max-w-3xl">
          <p className="eyebrow">KLANS ONLINE</p>
          <h1 className="section-title">{language === 'en' ? 'Human vs Computer' : 'Humano contra Ordenador'}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{copy('onlineNote')} {copy('tabletopNote')}</p>
        </header>
        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="eyebrow">01</p>
            <h2 className="mt-2 text-xl font-semibold">{copy('chooseFaction')}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {FACTIONS.map((faction) => (
                <button
                  key={faction}
                  className={`faction-choice ${humanFaction === faction ? 'selected' : ''}`}
                  style={{ '--faction': FACTION_META[faction].colour } as React.CSSProperties}
                  onClick={() => {
                    setHumanFaction(faction);
                    if (computerFaction === faction) setComputerFaction('RANDOM');
                  }}
                >
                  <span className="text-3xl" style={{ color: FACTION_META[faction].colour }}>{FACTION_META[faction].symbol}</span>
                  <strong className="font-cinzel text-lg">{faction}</strong>
                </button>
              ))}
            </div>
          </section>
          <aside className="panel h-fit lg:sticky lg:top-24">
            <p className="eyebrow">02</p>
            <h2 className="mt-2 text-xl font-semibold">{copy('chooseOpponent')}</h2>
            <select className="select mt-4" value={computerFaction} onChange={(event) => setComputerFaction(event.target.value as Faction | 'RANDOM')}>
              <option value="RANDOM">{copy('random')}</option>
              {opponents.map((faction) => <option key={faction} value={faction}>{faction}</option>)}
            </select>
            <p className="eyebrow mt-7">03</p>
            <h2 className="mt-2 text-xl font-semibold">{copy('difficulty')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(['SIMPLE', 'SKILLED'] as Difficulty[]).map((level) => (
                <button key={level} className={`choice-button ${difficulty === level ? 'selected' : ''}`} onClick={() => setDifficulty(level)}>
                  <strong>{level === 'SIMPLE' ? copy('simple') : copy('skilled')}</strong>
                </button>
              ))}
            </div>
            <button className="primary-button mt-7 w-full justify-center" onClick={beginMatch}>{copy('begin')} →</button>
            <Link href="/rules" className="secondary-button mt-3 w-full justify-center">{copy('officialRules')}</Link>
          </aside>
        </div>
      </main>
    );
  }

  if (!game) return null;

  if (screen === 'END') {
    const winner = getPlayer(game, game.winner ?? 'COMPUTER');
    return (
      <main className="site-container grid min-h-[70vh] place-items-center py-12">
        <section className="panel max-w-2xl p-7 text-center sm:p-12">
          <p className="eyebrow">{copy('winner')}</p>
          <div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-full border border-[var(--line)] text-4xl" style={{ color: FACTION_META[winner.faction].colour }}>{FACTION_META[winner.faction].symbol}</div>
          <h1 className="mt-5 font-cinzel text-3xl font-semibold">{winner.faction}</h1>
          <p className="mt-4 text-[var(--muted)]">{copy('conquered')}: <strong>{game.conqueredFaction}</strong></p>
          <p className="mt-2 text-sm text-[var(--muted)]">{language === 'en' ? `Match completed in ${game.turnNumber} turns.` : `Partida completada en ${game.turnNumber} turnos.`}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="primary-button justify-center" onClick={restartMatch}>{copy('playAgain')}</button>
            <button className="secondary-button justify-center" onClick={() => { setGame(null); setScreen('SETUP'); }}>{language === 'en' ? 'New setup' : 'Nueva preparación'}</button>
            <Link className="secondary-button justify-center" href="/">{copy('home')}</Link>
          </div>
        </section>
      </main>
    );
  }

  const selectedCard = selectedCardId ? game.human.hand.find((card) => card.instanceId === selectedCardId) : undefined;
  const validTargetIds = new Set(selectedCard ? validTargetsForCard(game, 'HUMAN', selectedCard).map((unit) => unit.id) : []);
  const humanTurn = game.currentPlayer === 'HUMAN' && game.phase === 'ACTION';
  const handTooLarge = game.human.hand.length > 5;

  const act = (result: ReturnType<typeof playCard>) => {
    setGame(result.state);
    setSelectedCardId(null);
    setNotice(result.ok ? '' : (result.message?.[language] ?? copy('invalid')));
  };

  const handlePlay = (card: CardInstance) => {
    if (card.type === 'DEFENCE') {
      setNotice(copy('noProactiveDefence'));
      return;
    }
    const targets = validTargetsForCard(game, 'HUMAN', card);
    if (['ATTACK', 'AMBUSH', 'DOCTOR'].includes(card.type)) {
      if (targets.length === 0) {
        setNotice(copy('invalid'));
        return;
      }
      setSelectedCardId(card.instanceId);
      setNotice(card.type === 'DOCTOR' ? copy('selectDefeated') : copy('selectEnemy'));
      return;
    }
    act(playCard(game, 'HUMAN', card.instanceId));
  };

  const handleTarget = (unit: Unit) => {
    if (!selectedCardId) return;
    act(playCard(game, 'HUMAN', selectedCardId, unit.id));
  };

  const handleDiscard = (card: CardInstance) => {
    const action = discardCard(game, 'HUMAN', card.instanceId);
    setGame(action.state);
    setSelectedCardId(null);
    setNotice(action.ok ? '' : (action.message?.[language] ?? copy('invalid')));
  };

  const handleEnd = () => {
    const action = endTurn(game, 'HUMAN');
    setGame(action.state);
    setSelectedCardId(null);
    setNotice(action.ok ? '' : (action.message?.[language] ?? copy('invalid')));
  };

  return (
    <main className="site-container py-4 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="turn-pill" data-human={humanTurn}>{humanTurn ? copy('yourTurn') : copy('computerTurn')} · {copy('turn')} {game.turnNumber}</span>
          <span className="text-xs text-[var(--muted)]">{copy('startingPlayer')}: {game.startingPlayer === 'HUMAN' ? copy('you') : copy('computer')}</span>
        </div>
        <div className="flex gap-2">
          <Counter label={copy('deck')} value={game.deck.length} />
          <Counter label={copy('discard')} value={game.discardPile.length} />
        </div>
      </div>

      <div className="game-grid">
        <div className="space-y-4">
          <PlayerArea title={copy('computer')} player={game.computer} hiddenHandCount={game.computer.hand.length} language={language} targetIds={validTargetIds} onUnitClick={handleTarget} />

          <div className="table-centre">
            <div className="deck-stack"><span>{copy('deck')}</span><strong>{game.deck.length}</strong></div>
            <div className="text-center">
              <p className="eyebrow">{copy('phase')}</p>
              <p className="mt-2 max-w-xs text-sm font-semibold">{humanTurn ? copy('yourTurn') : copy('computerTurn')}</p>
            </div>
            <div className="deck-stack opacity-60"><span>{copy('discard')}</span><strong>{game.discardPile.length}</strong></div>
          </div>

          <PlayerArea title={copy('you')} player={game.human} language={language} targetIds={validTargetIds} onUnitClick={handleTarget} />

          <section className="panel">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><p className="eyebrow">{copy('hand')}</p><h2 className="mt-1 text-xl font-semibold">{game.human.hand.length} / 5 {copy('cards')}</h2></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${handTooLarge ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-[var(--section)] text-[var(--muted)]'}`}>{handTooLarge ? 'LIMIT' : 'OK'}</span>
            </div>
            {handTooLarge && <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-200">{copy('handLimit')}</p>}
            <div className="hand-grid">
              {game.human.hand.length === 0 && <div className="empty-hand">—</div>}
              {game.human.hand.map((card) => (
                <HandCard
                  key={card.instanceId}
                  card={card}
                  language={language}
                  ownerFaction={game.human.faction}
                  selected={card.instanceId === selectedCardId}
                  canPlay={canPlayCard(game, 'HUMAN', card)}
                  canDiscard={canAct(game, 'HUMAN')}
                  onPlay={() => handlePlay(card)}
                  onDiscard={() => handleDiscard(card)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className={`panel ${notice || selectedCard ? 'attention' : ''}`}>
            <p className="eyebrow">{copy('actionPanel')}</p>
            <p className="mt-3 min-h-12 text-sm leading-6">{notice || (handTooLarge ? copy('handLimit') : humanTurn ? copy('yourTurn') : copy('computerTurn'))}</p>
            {selectedCard && <button className="small-button mt-3 w-full" onClick={() => { setSelectedCardId(null); setNotice(''); }}>{copy('cancel')}</button>}
            <button className="primary-button mt-3 w-full justify-center" disabled={!canEndTurn(game, 'HUMAN')} onClick={handleEnd}>{copy('endTurn')}</button>
          </section>

          <section className="panel">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">{copy('quickHelp')}</p>
              <Link href="/rules" className="text-link text-xs">{copy('officialRules')}</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CARD_DEFINITIONS.map((card) => <div key={card.type} className="quick-card"><span>{card.symbol}</span><strong>{card.type}</strong></div>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{copy('tabletopNote')}</p>
          </section>

          <section className="panel">
            <p className="eyebrow">{copy('gameLog')}</p>
            <div className="log-list mt-3">
              {game.log.map((entry, index) => <p key={entry.id} className={index === 0 ? 'latest' : ''}>{entry[language]}</p>)}
            </div>
          </section>
        </aside>
      </div>

      {game.phase === 'AWAIT_DEFENCE' && (
        <DecisionModal
          title={copy('defendTitle')}
          text={copy('defendText')}
          primary={copy('defend')}
          secondary={copy('takeHit')}
          onPrimary={() => setGame(resolveDefence(game, true).state)}
          onSecondary={() => setGame(resolveDefence(game, false).state)}
        />
      )}

      {game.revealComputerHand && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-4xl p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div><p className="eyebrow">{game.revealReason === 'SPY' ? 'SPY' : language === 'en' ? 'Enemy SPY penalty' : 'Penalización de ESPÍA enemigo'}</p><h2 className="mt-1 text-2xl font-semibold">{copy('spyReveal')}</h2></div>
              <button className="icon-button" onClick={() => setGame(closeComputerHandReveal(game))}>×</button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {game.computer.hand.length === 0 && <p className="text-[var(--muted)]">—</p>}
              {game.computer.hand.map((card) => <RevealedCard key={card.instanceId} card={card} language={language} />)}
            </div>
            <button className="primary-button mt-6 w-full justify-center" onClick={() => setGame(closeComputerHandReveal(game))}>{copy('close')}</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return <div className="counter"><span>{label}</span><strong>{value}</strong></div>;
}

function PlayerArea({ title, player, hiddenHandCount, language, targetIds, onUnitClick }: {
  title: string;
  player: GameState['human'];
  hiddenHandCount?: number;
  language: 'en' | 'es';
  targetIds: Set<string>;
  onUnitClick: (unit: Unit) => void;
}) {
  const meta = FACTION_META[player.faction];
  return (
    <section className="player-area" style={{ '--faction': meta.colour } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="text-2xl" style={{ color: meta.colour }}>{meta.symbol}</span><div><p className="eyebrow">{title}</p><h2 className="font-cinzel text-lg">{player.faction}</h2></div></div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]"><span>{player.units.filter((unit) => unit.state === 'ALIVE').length}/5 {language === 'en' ? 'alive' : 'vivas'}</span>{hiddenHandCount !== undefined && <span>● {hiddenHandCount}</span>}</div>
      </div>
      <div className="unit-grid">
        {player.units.map((unit) => {
          const targetable = targetIds.has(unit.id);
          return (
            <button key={unit.id} className={`unit-card ${unit.state === 'DEFEATED' ? 'defeated' : ''} ${targetable ? 'targetable' : ''}`} disabled={!targetable} onClick={() => onUnitClick(unit)}>
              <span className="unit-symbol">♟</span><strong>{unit.name}</strong><small>{unit.state === 'ALIVE' ? (language === 'en' ? 'Alive' : 'Viva') : (language === 'en' ? 'Defeated' : 'Derrotada')}</small>{unit.state === 'DEFEATED' && <span className="absolute inset-0 grid place-items-center text-5xl text-red-600/60">×</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HandCard({ card, language, ownerFaction, selected, canPlay, canDiscard, onPlay, onDiscard }: {
  card: CardInstance;
  language: 'en' | 'es';
  ownerFaction: Faction;
  selected: boolean;
  canPlay: boolean;
  canDiscard: boolean;
  onPlay: () => void;
  onDiscard: () => void;
}) {
  const definition = getCardDefinition(card.type);
  const enemy = card.faction !== ownerFaction;
  const dangerousDiscard = enemy && ['SPY', 'SACK', 'SABOTAGE'].includes(card.type);
  return (
    <article className={`hand-card ${selected ? 'selected-card' : ''}`} style={{ '--faction': FACTION_META[card.faction].colour } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2"><span className="card-symbol">{card.symbol}</span><span className="text-[9px] font-bold tracking-[0.14em]" style={{ color: FACTION_META[card.faction].colour }}>{card.faction}</span></div>
      <h3 className="mt-4 font-cinzel text-base">{card.type}</h3>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{definition.labels[language]}</p>
      <p className="mt-4 min-h-20 text-xs leading-5 text-[var(--muted)]">{definition.shortText[language]}</p>
      {dangerousDiscard && <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{language === 'en' ? 'Enemy discard penalty' : 'Penalización al descartar'}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2"><button className="card-play" disabled={!canPlay} onClick={onPlay}>{language === 'en' ? 'Play' : 'Jugar'}</button><button className="card-discard" disabled={!canDiscard} onClick={onDiscard}>{language === 'en' ? 'Discard' : 'Descartar'}</button></div>
    </article>
  );
}

function RevealedCard({ card, language }: { card: CardInstance; language: 'en' | 'es' }) {
  const definition = getCardDefinition(card.type);
  return <div className="rounded-xl border border-[var(--line)] border-t-4 bg-[var(--page)] p-4" style={{ borderTopColor: FACTION_META[card.faction].colour }}><div className="flex items-center justify-between"><span className="text-2xl">{card.symbol}</span><small>{card.faction}</small></div><strong className="mt-3 block font-cinzel">{card.type}</strong><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{definition.shortText[language]}</p></div>;
}

function DecisionModal({ title, text, primary, secondary, onPrimary, onSecondary }: { title: string; text: string; primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void }) {
  return <div className="modal-backdrop"><div className="modal-panel max-w-md p-6 text-center sm:p-8"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 leading-7 text-[var(--muted)]">{text}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><button className="primary-button justify-center" onClick={onPrimary}>{primary}</button><button className="secondary-button justify-center" onClick={onSecondary}>{secondary}</button></div></div></div>;
}
