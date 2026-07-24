'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CARD_DEFINITIONS, CARD_TYPES, getCardDefinition } from '@/lib/cards';
import { FACTIONS, FACTION_META } from '@/lib/factions';
import {
  aiStep,
  canAct,
  canPlayCard,
  closeComputerHandReveal,
  discardCard,
  endTurn,
  getPlayer,
  livingUnitCount,
  playCard,
  resolveDefence,
  resolvePassive,
  startGame,
  validTargetsForCard,
} from '@/lib/gameEngine';
import { t } from '@/lib/i18n';
import {
  CardInstance,
  Difficulty,
  Faction,
  GameState,
  Language,
  Screen,
  Theme,
  Unit,
} from '@/lib/types';
import { randomItem } from '@/lib/utils';

const phaseText = (game: GameState, language: Language): string => {
  if (game.phase === 'AWAIT_DEFENCE') return t(language, 'defendPhase');
  if (game.phase === 'AWAIT_PASSIVE') return t(language, 'passivePhase');
  return t(language, 'actionPhase');
};

const passivePrompt = (game: GameState, language: Language): string => {
  const kind = game.pendingPassive?.kind;
  if (kind === 'ROMAN_DISCIPLINE') {
    return language === 'en'
      ? 'Use ROMAN Discipline to ignore this defeat?'
      : '¿Usar Disciplina ROMAN para ignorar esta derrota?';
  }
  if (kind === 'VIKING_FURY') {
    return language === 'en'
      ? 'Use VIKING Fury to draw one card?'
      : '¿Usar Furia VIKING para robar una carta?';
  }
  return language === 'en'
    ? 'Use EGYPT Restoration to draw one card?'
    : '¿Usar Restauración EGYPT para robar una carta?';
};

export function KlansApp() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [humanFaction, setHumanFaction] = useState<Faction>('ROMAN');
  const [computerFaction, setComputerFaction] = useState<Faction | 'RANDOM'>('RANDOM');
  const [difficulty, setDifficulty] = useState<Difficulty>('SIMPLE');
  const [game, setGame] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('klans-language');
    const savedTheme = window.localStorage.getItem('klans-theme');
    if (savedLanguage === 'en' || savedLanguage === 'es') setLanguage(savedLanguage);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('klans-language', language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('klans-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!game || game.winner) return;
    if (game.currentPlayer !== 'COMPUTER' || game.phase !== 'ACTION') return;
    const timer = window.setTimeout(() => setGame((current) => current ? aiStep(current) : current), 550);
    return () => window.clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    if (game?.winner) setScreen('END');
    if (game?.phase !== 'ACTION') setSelectedCardId(null);
  }, [game?.winner, game?.phase]);

  const copy = (key: Parameters<typeof t>[1]) => t(language, key);

  const beginMatch = () => {
    const available = FACTIONS.filter((faction) => faction !== humanFaction);
    const opponent = computerFaction === 'RANDOM'
      ? randomItem(available) ?? available[0]
      : computerFaction;
    if (opponent === humanFaction) return;
    setGame(startGame({ humanFaction, computerFaction: opponent, difficulty }));
    setSelectedCardId(null);
    setNotice('');
    setScreen('GAME');
  };

  const restartMatch = () => {
    if (!game) return;
    setGame(startGame({
      humanFaction: game.human.faction,
      computerFaction: game.computer.faction,
      difficulty: game.difficulty,
    }));
    setScreen('GAME');
    setNotice('');
    setSelectedCardId(null);
  };

  const act = (result: ReturnType<typeof playCard>) => {
    if (!result.ok) setNotice(result.message?.[language] ?? copy('invalid'));
    else setNotice('');
    setGame(result.state);
    setSelectedCardId(null);
  };

  const handlePlay = (card: CardInstance) => {
    if (!game) return;
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
    if (!game || !selectedCardId) return;
    act(playCard(game, 'HUMAN', selectedCardId, unit.id));
  };

  const handleDiscard = (card: CardInstance) => {
    if (!game) return;
    const result = discardCard(game, 'HUMAN', card.instanceId);
    if (!result.ok) setNotice(result.message?.[language] ?? copy('invalid'));
    else setNotice('');
    setGame(result.state);
    setSelectedCardId(null);
  };

  const handleEndTurn = () => {
    if (!game) return;
    const result = endTurn(game, 'HUMAN');
    if (!result.ok) setNotice(result.message?.[language] ?? copy('invalid'));
    else setNotice('');
    setGame(result.state);
    setSelectedCardId(null);
  };

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--page-alpha)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button className="flex items-center gap-3" onClick={() => setScreen('HOME')} aria-label="KLANS home">
            <Image src="/logo.png" alt="KLANS" width={150} height={50} className="h-9 w-auto object-contain" priority />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] md:block">
              {copy('playtest')}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="segmented" aria-label="Language">
              <button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}>ES</button>
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
            </div>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>
      {children}
      {rulesOpen && <RulesModal language={language} onClose={() => setRulesOpen(false)} />}
    </main>
  );

  if (screen === 'HOME') {
    return shell(
      <section className="mx-auto grid min-h-[calc(100vh-66px)] max-w-6xl place-items-center px-5 py-14">
        <div className="max-w-3xl text-center">
          <Image src="/logo.png" alt="KLANS" width={620} height={210} className="mx-auto h-auto w-full max-w-xl object-contain" priority />
          <p className="eyebrow mt-7">{copy('prototype')}</p>
          <h1 className="mt-3 font-cinzel text-3xl font-semibold tracking-wide sm:text-5xl">
            KLANS — {copy('playtest')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">{copy('intro')}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="primary-button justify-center" onClick={() => setScreen('SETUP')}>{copy('start')} <span>→</span></button>
            <button className="secondary-button justify-center" onClick={() => setRulesOpen(true)}>{copy('rules')}</button>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            40-card match deck · 5 units each · 2 actions per turn
          </p>
        </div>
      </section>,
    );
  }

  if (screen === 'SETUP') {
    const opponentChoices = FACTIONS.filter((faction) => faction !== humanFaction);
    return shell(
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <button className="text-button" onClick={() => setScreen('HOME')}>← {copy('back')}</button>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="eyebrow">01</p>
            <h1 className="section-title">{copy('chooseFaction')}</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                  <span>
                    <strong className="font-cinzel text-lg">{faction}</strong>
                    <small>{FACTION_META[faction].passiveName[language]} — {FACTION_META[faction].passiveText[language]}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <aside className="panel h-fit lg:sticky lg:top-24">
            <p className="eyebrow">02</p>
            <h2 className="mt-2 text-xl font-semibold">{copy('chooseOpponent')}</h2>
            <select className="select mt-4" value={computerFaction} onChange={(event) => setComputerFaction(event.target.value as Faction | 'RANDOM')}>
              <option value="RANDOM">{copy('random')}</option>
              {opponentChoices.map((faction) => <option key={faction} value={faction}>{faction}</option>)}
            </select>
            <p className="eyebrow mt-7">03</p>
            <h2 className="mt-2 text-xl font-semibold">{copy('difficulty')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(['SIMPLE', 'SKILLED'] as Difficulty[]).map((level) => (
                <button key={level} className={`choice-button ${difficulty === level ? 'selected' : ''}`} onClick={() => setDifficulty(level)}>
                  <strong>{level === 'SIMPLE' ? copy('simple') : copy('skilled')}</strong>
                  <small>{level === 'SIMPLE'
                    ? (language === 'en' ? 'Legal, direct decisions.' : 'Decisiones legales y directas.')
                    : (language === 'en' ? 'More deliberate card use.' : 'Uso de cartas más deliberado.')}</small>
                </button>
              ))}
            </div>
            <button className="primary-button mt-7 w-full justify-center" onClick={beginMatch}>{copy('begin')} <span>→</span></button>
          </aside>
        </div>
      </section>,
    );
  }

  if (!game) return shell(null);

  if (screen === 'END') {
    const humanWon = game.winner === 'HUMAN';
    const winner = getPlayer(game, game.winner ?? 'COMPUTER');
    return shell(
      <section className="mx-auto grid min-h-[calc(100vh-66px)] max-w-3xl place-items-center px-5 py-14">
        <div className="panel w-full p-7 text-center sm:p-12">
          <p className="eyebrow">{copy('winner')}</p>
          <div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-full border border-[var(--line)] text-4xl" style={{ color: FACTION_META[winner.faction].colour }}>
            {FACTION_META[winner.faction].symbol}
          </div>
          <h1 className="mt-5 font-cinzel text-4xl">{winner.faction}</h1>
          <p className="mt-2 text-2xl font-semibold">{humanWon ? copy('victory') : copy('defeat')}</p>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-[var(--muted)]">{humanWon ? copy('humanWon') : copy('computerWon')}</p>
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--page)] p-4 text-sm">
            <div><span className="block text-xs text-[var(--muted)]">{copy('turn')}</span><strong>{game.turnNumber}</strong></div>
            <div><span className="block text-xs text-[var(--muted)]">{game.human.faction}</span><strong>{livingUnitCount(game, 'HUMAN')}/5</strong></div>
            <div><span className="block text-xs text-[var(--muted)]">{game.computer.faction}</span><strong>{livingUnitCount(game, 'COMPUTER')}/5</strong></div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="primary-button justify-center" onClick={restartMatch}>{copy('playAgain')}</button>
            <button className="secondary-button justify-center" onClick={() => { setGame(null); setScreen('HOME'); }}>{copy('home')}</button>
          </div>
        </div>
      </section>,
    );
  }

  const selectedCard = selectedCardId ? game.human.hand.find((card) => card.instanceId === selectedCardId) : undefined;
  const validTargetIds = new Set(selectedCard ? validTargetsForCard(game, 'HUMAN', selectedCard).map((unit) => unit.id) : []);
  const humanTurn = game.currentPlayer === 'HUMAN' && game.phase === 'ACTION';

  return shell(
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="turn-pill" data-human={humanTurn}>{humanTurn ? copy('you') : copy('computer')} · {copy('turn')} {game.turnNumber}</span>
          <span className="hidden text-sm text-[var(--muted)] sm:inline">{phaseText(game, language)}</span>
        </div>
        <div className="flex gap-2">
          <Counter label={copy('deck')} value={game.deck.length} />
          <Counter label={copy('discard')} value={game.discardPile.length} />
        </div>
      </div>

      <div className="game-grid">
        <div className="space-y-4">
          <PlayerArea
            title={copy('computer')}
            player={game.computer}
            hiddenHandCount={game.computer.hand.length}
            language={language}
            targetIds={validTargetIds}
            onUnitClick={handleTarget}
          />

          <div className="table-centre">
            <div className="deck-stack"><span>{copy('deck')}</span><strong>{game.deck.length}</strong></div>
            <div className="text-center">
              <p className="eyebrow">{copy('phase')}</p>
              <p className="mt-2 max-w-xs text-sm font-semibold">{phaseText(game, language)}</p>
            </div>
            <div className="deck-stack opacity-60"><span>{copy('discard')}</span><strong>{game.discardPile.length}</strong></div>
          </div>

          <PlayerArea
            title={copy('you')}
            player={game.human}
            language={language}
            targetIds={validTargetIds}
            onUnitClick={handleTarget}
          />

          <section className="panel">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{copy('hand')}</p>
                <h2 className="mt-1 text-xl font-semibold">{game.human.hand.length} {copy('cards')}</h2>
              </div>
              <div className="text-right text-xs text-[var(--muted)]">
                <span className="block">{copy('actions')}</span>
                <strong className="text-lg text-[var(--ink)]">{game.actionsUsedThisTurn}/2</strong>
              </div>
            </div>
            <div className="hand-row">
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
            <p className="mt-3 min-h-12 text-sm leading-6">
              {notice || (humanTurn ? copy('actionPhase') : language === 'en' ? 'Computer is deciding…' : 'El ordenador está decidiendo…')}
            </p>
            {selectedCard && (
              <button className="small-button mt-3 w-full" onClick={() => { setSelectedCardId(null); setNotice(''); }}>{copy('cancel')}</button>
            )}
            <button className="primary-button mt-3 w-full justify-center" disabled={!humanTurn || game.actionsUsedThisTurn < 1} onClick={handleEndTurn}>{copy('endTurn')}</button>
          </section>

          <section className="panel">
            <p className="eyebrow">{copy('passive')}</p>
            <h3 className="mt-2 font-cinzel text-lg">{game.human.faction} — {FACTION_META[game.human.faction].passiveName[language]}</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{FACTION_META[game.human.faction].passiveText[language]}</p>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${game.human.passiveUsed ? 'bg-[var(--page)] text-[var(--muted)]' : 'bg-[var(--accent)] text-[var(--accent-ink)]'}`}>
              {game.human.passiveUsed ? copy('used') : copy('available')}
            </span>
          </section>

          <section className="panel">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{copy('gameLog')}</p>
              <button className="text-button" onClick={() => setRulesOpen(true)}>{copy('rules')}</button>
            </div>
            <div className="log-list mt-3">
              {game.log.map((entry, index) => <p key={entry.id} className={index === 0 ? 'latest' : ''}>{entry[language]}</p>)}
            </div>
          </section>
        </aside>
      </div>

      {game.phase === 'AWAIT_DEFENCE' && (
        <DecisionModal
          title={language === 'en' ? 'Your unit is under attack' : 'Tu unidad está siendo atacada'}
          text={language === 'en' ? 'Use one DEFENCE card to block the attack completely?' : '¿Usar una carta DEFENCE para bloquear por completo el ataque?'}
          primary={copy('defend')}
          secondary={copy('takeHit')}
          onPrimary={() => setGame(resolveDefence(game, true).state)}
          onSecondary={() => setGame(resolveDefence(game, false).state)}
        />
      )}

      {game.phase === 'AWAIT_PASSIVE' && (
        <DecisionModal
          title={`${game.human.faction} — ${FACTION_META[game.human.faction].passiveName[language]}`}
          text={passivePrompt(game, language)}
          primary={copy('usePassive')}
          secondary={copy('keepPassive')}
          onPrimary={() => setGame(resolvePassive(game, true).state)}
          onSecondary={() => setGame(resolvePassive(game, false).state)}
        />
      )}

      {game.revealComputerHand && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div><p className="eyebrow">SPY</p><h2 className="mt-1 text-2xl font-semibold">{copy('spyReveal')}</h2></div>
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
    </section>,
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return <div className="counter"><span>{label}</span><strong>{value}</strong></div>;
}

function PlayerArea({
  title,
  player,
  hiddenHandCount,
  language,
  targetIds,
  onUnitClick,
}: {
  title: string;
  player: GameState['human'];
  hiddenHandCount?: number;
  language: Language;
  targetIds: Set<string>;
  onUnitClick: (unit: Unit) => void;
}) {
  const meta = FACTION_META[player.faction];
  return (
    <section className="player-area" style={{ '--faction': meta.colour } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ color: meta.colour }}>{meta.symbol}</span>
          <div><p className="eyebrow">{title}</p><h2 className="font-cinzel text-lg">{player.faction}</h2></div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span>{player.units.filter((unit) => unit.state === 'ALIVE').length}/5 {language === 'en' ? 'alive' : 'vivas'}</span>
          {hiddenHandCount !== undefined && <span>● {hiddenHandCount}</span>}
          <span className={player.passiveUsed ? '' : 'font-bold text-[var(--ink)]'}>{player.passiveUsed ? (language === 'en' ? 'Passive used' : 'Pasiva usada') : (language === 'en' ? 'Passive ready' : 'Pasiva lista')}</span>
        </div>
      </div>
      <div className="unit-row">
        {player.units.map((unit) => {
          const targetable = targetIds.has(unit.id);
          return (
            <button
              key={unit.id}
              className={`unit-card ${unit.state === 'DEFEATED' ? 'defeated' : ''} ${targetable ? 'targetable' : ''}`}
              disabled={!targetable}
              onClick={() => onUnitClick(unit)}
            >
              <span className="unit-symbol">♟</span>
              <strong>{unit.name}</strong>
              <small>{unit.state === 'ALIVE' ? (language === 'en' ? 'Alive' : 'Viva') : (language === 'en' ? 'Defeated' : 'Derrotada')}</small>
              {unit.state === 'DEFEATED' && <span className="absolute inset-0 grid place-items-center text-5xl text-red-600/60">×</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HandCard({
  card,
  language,
  ownerFaction,
  selected,
  canPlay,
  canDiscard,
  onPlay,
  onDiscard,
}: {
  card: CardInstance;
  language: Language;
  ownerFaction: Faction;
  selected: boolean;
  canPlay: boolean;
  canDiscard: boolean;
  onPlay: () => void;
  onDiscard: () => void;
}) {
  const definition = getCardDefinition(card.faction, card.type);
  const enemy = card.faction !== ownerFaction;
  const dangerousDiscard = enemy && ['SPY', 'SACK', 'SABOTAGE'].includes(card.type);
  return (
    <article className={`hand-card ${selected ? 'selected-card' : ''}`} style={{ '--faction': FACTION_META[card.faction].colour } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <span className="card-symbol">{card.symbol}</span>
        <span className="text-[9px] font-bold tracking-[0.14em]" style={{ color: FACTION_META[card.faction].colour }}>{card.faction}</span>
      </div>
      <h3 className="mt-4 font-cinzel text-base">{card.type}</h3>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{definition.labels[language]}</p>
      <p className="mt-4 min-h-20 text-xs leading-5 text-[var(--muted)]">{definition.shortText[language]}</p>
      {dangerousDiscard && <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{language === 'en' ? 'Enemy discard penalty' : 'Penalización al descartar'}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="card-play" disabled={!canPlay} onClick={onPlay}>{language === 'en' ? 'Play' : 'Jugar'}</button>
        <button className="card-discard" disabled={!canDiscard} onClick={onDiscard}>{language === 'en' ? 'Discard' : 'Descartar'}</button>
      </div>
    </article>
  );
}

function RevealedCard({ card, language }: { card: CardInstance; language: Language }) {
  const definition = getCardDefinition(card.faction, card.type);
  return (
    <div className="rounded-xl border border-[var(--line)] border-t-4 bg-[var(--page)] p-4" style={{ borderTopColor: FACTION_META[card.faction].colour }}>
      <div className="flex items-center justify-between"><span className="text-2xl">{card.symbol}</span><small>{card.faction}</small></div>
      <strong className="mt-3 block font-cinzel">{card.type}</strong>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{definition.shortText[language]}</p>
    </div>
  );
}

function DecisionModal({ title, text, primary, secondary, onPrimary, onSecondary }: {
  title: string;
  text: string;
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-4 leading-7 text-[var(--muted)]">{text}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button className="primary-button justify-center" onClick={onPrimary}>{primary}</button>
          <button className="secondary-button justify-center" onClick={onSecondary}>{secondary}</button>
        </div>
      </div>
    </div>
  );
}

function RulesModal({ language, onClose }: { language: Language; onClose: () => void }) {
  const copy = (key: Parameters<typeof t>[1]) => t(language, key);
  const genericDefinitions = CARD_TYPES.map((type) => CARD_DEFINITIONS.find((card) => card.type === type)!).filter(Boolean);
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] p-5 sm:px-7">
          <div><p className="eyebrow">KLANS</p><h2 className="mt-1 text-2xl font-semibold">{copy('rulesTitle')}</h2></div>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>
        <div className="grid gap-7 p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <RuleBlock title={copy('objectiveTitle')} text={copy('objectiveText')} />
            <RuleBlock title={copy('turnTitle')} text={copy('turnText')} />
          </div>
          <div>
            <h3 className="help-heading">{language === 'en' ? 'Cards and symbols' : 'Cartas y símbolos'}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {genericDefinitions.map((card) => (
                <div key={card.type} className="help-card">
                  <span>{card.symbol}</span>
                  <div><strong>{card.type} · {card.labels[language]}</strong><p>{card.shortText[language]}</p></div>
                </div>
              ))}
            </div>
          </div>
          <RuleBlock title={copy('penaltiesTitle')} text={copy('penaltiesText')} />
          <div>
            <h3 className="help-heading">{copy('passivesTitle')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FACTIONS.map((faction) => (
                <div key={faction} className="help-card">
                  <span style={{ color: FACTION_META[faction].colour }}>{FACTION_META[faction].symbol}</span>
                  <div><strong>{faction} — {FACTION_META[faction].passiveName[language]}</strong><p>{FACTION_META[faction].passiveText[language]}</p></div>
                </div>
              ))}
            </div>
          </div>
          <RuleBlock title={copy('futureTitle')} text={copy('futureText')} />
        </div>
      </div>
    </div>
  );
}

function RuleBlock({ title, text }: { title: string; text: string }) {
  return <div><h3 className="help-heading">{title}</h3><p className="text-sm leading-7 text-[var(--muted)]">{text}</p></div>;
}
