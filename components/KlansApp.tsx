'use client';

import { useEffect, useMemo, useState } from 'react';
import { CARD_DEFINITIONS } from '@/lib/cards';
import { FACTIONS, FACTION_META } from '@/lib/factions';
import {
  aiStep,
  canEndTurn,
  cancelPending,
  confirmTestudo,
  discardFromHand,
  endTurn,
  isCardPlayable,
  livingUnits,
  newGame,
  playerOf,
  resolveChoice,
  resolveHumanReaction,
  resolveTarget,
  selectCard,
  toggleTestudoTarget,
} from '@/lib/gameEngine';
import { t, ui } from '@/lib/i18n';
import type { CardInstance, Difficulty, Faction, GameState, Language, PlayerState, Screen, Theme, UnitCard } from '@/lib/types';

const opponentFor = (faction: Faction): Faction => {
  const options = FACTIONS.filter((item) => item !== faction);
  return options[Math.floor(Math.random() * options.length)];
};

export function KlansApp() {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [screen, setScreen] = useState<Screen>('HOME');
  const [showHelp, setShowHelp] = useState(false);
  const [humanFaction, setHumanFaction] = useState<Faction>('ROMAN');
  const [computerFaction, setComputerFaction] = useState<Faction | 'RANDOM'>('RANDOM');
  const [difficulty, setDifficulty] = useState<Difficulty>('SIMPLE');
  const [game, setGame] = useState<GameState>();

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('klans-language') as Language | null;
    const savedTheme = window.localStorage.getItem('klans-theme') as Theme | null;
    if (savedLanguage === 'en' || savedLanguage === 'es') setLanguage(savedLanguage);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('klans-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('klans-language', language);
    setGame((current) => current ? { ...current, language } : current);
  }, [language]);

  useEffect(() => {
    if (!game || game.winner) return;
    if (game.currentPlayer !== 'COMPUTER' || game.phase !== 'ACTION' || game.pendingAction) return;
    const timer = window.setTimeout(() => setGame((current) => current ? aiStep(current) : current), 620);
    return () => window.clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    if (game?.winner) setScreen('END');
  }, [game?.winner]);

  const startMatch = () => {
    const rival = computerFaction === 'RANDOM' || computerFaction === humanFaction ? opponentFor(humanFaction) : computerFaction;
    setGame(newGame(humanFaction, rival, difficulty, language));
    setScreen('GAME');
  };

  const resetSetup = () => {
    setGame(undefined);
    setScreen('SETUP');
  };

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--ink)] transition-colors">
      <Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} onLogo={() => setScreen('HOME')} />
      {screen === 'HOME' && <Home language={language} onStart={() => setScreen('SETUP')} onRules={() => setShowHelp(true)} />}
      {screen === 'SETUP' && (
        <Setup
          language={language}
          humanFaction={humanFaction}
          setHumanFaction={(faction) => {
            setHumanFaction(faction);
            if (computerFaction === faction) setComputerFaction('RANDOM');
          }}
          computerFaction={computerFaction}
          setComputerFaction={setComputerFaction}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={startMatch}
          onBack={() => setScreen('HOME')}
        />
      )}
      {screen === 'GAME' && game && <GameScreen game={game} language={language} setGame={setGame} onHelp={() => setShowHelp(true)} />}
      {screen === 'END' && game && <EndScreen game={game} language={language} onAgain={resetSetup} onHome={() => { setGame(undefined); setScreen('HOME'); }} />}
      {showHelp && <HelpPanel language={language} onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function Header({ language, setLanguage, theme, setTheme, onLogo }: {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogo: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--page-alpha)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={onLogo} className="flex items-center gap-3" aria-label="KLANS home">
          <img src="/logo.png" alt="KLANS" className="h-10 w-auto max-w-[150px] object-contain sm:h-12" />
          <span className="hidden border-l border-[var(--line)] pl-3 text-[10px] font-semibold tracking-[0.22em] text-[var(--muted)] sm:block">SOLO PLAYTEST</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="segmented" aria-label="Language selector">
            {(['es', 'en'] as Language[]).map((item) => (
              <button key={item} onClick={() => setLanguage(item)} className={language === item ? 'active' : ''}>{item.toUpperCase()}</button>
            ))}
          </div>
          <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Use dark mode' : 'Use light mode'}>
            {theme === 'light' ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </header>
  );
}

function Home({ language, onStart, onRules }: { language: Language; onStart: () => void; onRules: () => void }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
      <div>
        <p className="eyebrow">{t(ui.prototype, language)}</p>
        <h1 className="mt-4 max-w-3xl font-cinzel text-5xl font-semibold leading-[1.03] tracking-[0.04em] text-[#CFA24A] sm:text-7xl">KLANS</h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-[var(--ink)] sm:text-2xl">{t(ui.intro, language)}</p>
        <p className="mt-5 max-w-xl leading-relaxed text-[var(--muted)]">{t(ui.prototypeNote, language)}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button className="primary-button" onClick={onStart}>{t(ui.start, language)} <span>→</span></button>
          <button className="secondary-button" onClick={onRules}>{t(ui.rules, language)}</button>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[var(--muted)]">
          <span>✓ 1 vs 1</span><span>✓ ES / EN</span><span>✓ Local browser play</span><span>✓ No account</span>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl">
        <div className="absolute -inset-8 rounded-full bg-[#CFA24A]/10 blur-3xl" />
        <div className="relative rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-card sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Choose a side</span>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">34-card match deck</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FACTIONS.map((faction) => <FactionPreview key={faction} faction={faction} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FactionPreview({ faction }: { faction: Faction }) {
  const meta = FACTION_META[faction];
  return (
    <div className="rounded-2xl border border-[var(--line)] p-4" style={{ borderTopColor: meta.colour, borderTopWidth: 3 }}>
      <span className="text-2xl" style={{ color: meta.colour }}>{meta.symbol}</span>
      <div className="mt-5 font-cinzel text-sm font-semibold tracking-wide">{faction}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">5 units · 17 cards</div>
    </div>
  );
}

function Setup({ language, humanFaction, setHumanFaction, computerFaction, setComputerFaction, difficulty, setDifficulty, onStart, onBack }: {
  language: Language;
  humanFaction: Faction;
  setHumanFaction: (faction: Faction) => void;
  computerFaction: Faction | 'RANDOM';
  setComputerFaction: (faction: Faction | 'RANDOM') => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <button className="text-button" onClick={onBack}>← {t(ui.back, language)}</button>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="eyebrow">01</p>
          <h1 className="section-title">{t(ui.chooseFaction, language)}</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FACTIONS.map((faction) => (
              <FactionChoice key={faction} faction={faction} language={language} selected={humanFaction === faction} onClick={() => setHumanFaction(faction)} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-card sm:p-7">
          <p className="eyebrow">02</p>
          <h2 className="text-xl font-semibold">{t(ui.opponent, language)}</h2>
          <select className="select mt-4" value={computerFaction} onChange={(event) => setComputerFaction(event.target.value as Faction | 'RANDOM')}>
            <option value="RANDOM">{t(ui.random, language)}</option>
            {FACTIONS.filter((faction) => faction !== humanFaction).map((faction) => <option key={faction} value={faction}>{faction}</option>)}
          </select>
          <p className="eyebrow mt-8">03</p>
          <h2 className="text-xl font-semibold">{t(ui.difficulty, language)}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(['SIMPLE', 'SKILLED'] as Difficulty[]).map((level) => (
              <button key={level} onClick={() => setDifficulty(level)} className={`choice-button ${difficulty === level ? 'selected' : ''}`}>
                <strong>{level === 'SIMPLE' ? t(ui.simple, language) : t(ui.skilled, language)}</strong>
                <small>{level === 'SIMPLE' ? (language === 'en' ? 'Legal, varied moves' : 'Movimientos legales y variados') : (language === 'en' ? 'More tactical priorities' : 'Prioridades más tácticas')}</small>
              </button>
            ))}
          </div>
          <button className="primary-button mt-8 w-full justify-center" onClick={onStart}>{t(ui.begin, language)} <span>→</span></button>
        </div>
      </div>
    </section>
  );
}

function FactionChoice({ faction, language, selected, onClick }: { faction: Faction; language: Language; selected: boolean; onClick: () => void }) {
  const meta = FACTION_META[faction];
  return (
    <button onClick={onClick} className={`faction-choice ${selected ? 'selected' : ''}`} style={{ '--faction': meta.colour } as React.CSSProperties}>
      <span className="text-3xl" style={{ color: meta.colour }}>{meta.symbol}</span>
      <span>
        <strong className="font-cinzel tracking-wide">{faction}</strong>
        <small>{t(meta.description, language)}</small>
      </span>
      <span className="ml-auto text-lg">{selected ? '●' : '○'}</span>
    </button>
  );
}

function GameScreen({ game, language, setGame, onHelp }: { game: GameState; language: Language; setGame: React.Dispatch<React.SetStateAction<GameState | undefined>>; onHelp: () => void }) {
  const isHumanTurn = game.currentPlayer === 'HUMAN';
  const action = game.pendingAction;
  const update = (fn: (current: GameState) => GameState) => setGame((current) => current ? fn(current) : current);

  return (
    <section className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="turn-pill" data-human={isHumanTurn}>{isHumanTurn ? t(ui.yourTurn, language) : t(ui.computerTurn, language)} · {game.phase}</div>
        <div className="flex items-center gap-2">
          <Counter label={t(ui.deck, language)} value={game.deck.length} />
          <Counter label={t(ui.discard, language)} value={game.discardPile.length} />
          <button className="small-button" onClick={onHelp}>? {t(ui.help, language)}</button>
        </div>
      </div>

      <div className="game-grid">
        <div className="space-y-4">
          <PlayerArea ownerId="COMPUTER" currentPlayer={game.currentPlayer} player={game.computer} language={language} concealed handCount={game.computer.hand.length} pending={action} onUnit={(id) => update((current) => resolveTarget(current, id))} onToggleTestudo={(id) => update((current) => toggleTestudoTarget(current, id))} />
          <div className="table-centre">
            <div className="deck-stack"><span>KLANS</span><strong>{game.deck.length}</strong></div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Turn {game.turnNumber}</p>
              <p className="mt-1 text-sm font-medium">{game.cardsPlayedThisTurn}/2 cards · {game.offensivePlayedThisTurn ? 'Offensive used' : 'Offensive ready'}</p>
            </div>
          </div>
          <PlayerArea ownerId="HUMAN" currentPlayer={game.currentPlayer} player={game.human} language={language} pending={action} onUnit={(id) => {
            if (action?.kind === 'TESTUDO_TARGETS') update((current) => toggleTestudoTarget(current, id));
            else update((current) => resolveTarget(current, id));
          }} onToggleTestudo={(id) => update((current) => toggleTestudoTarget(current, id))} />
          <Hand game={game} language={language} onPlay={(id) => update((current) => selectCard(current, 'HUMAN', id))} onDiscard={(id) => update((current) => discardFromHand(current, 'HUMAN', id))} />
        </div>
        <aside className="space-y-4">
          <ActionPanel game={game} language={language} update={update} />
          <GameLog game={game} language={language} />
          <button className="primary-button w-full justify-center" disabled={!canEndTurn(game)} onClick={() => update((current) => endTurn(current))}>{t(ui.endTurn, language)}</button>
        </aside>
      </div>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return <div className="counter"><span>{label}</span><strong>{value}</strong></div>;
}

function PlayerArea({ ownerId, currentPlayer, player, language, concealed = false, handCount, pending, onUnit, onToggleTestudo }: {
  ownerId: 'HUMAN' | 'COMPUTER';
  currentPlayer: 'HUMAN' | 'COMPUTER';
  player: PlayerState;
  language: Language;
  concealed?: boolean;
  handCount?: number;
  pending?: GameState['pendingAction'];
  onUnit: (id: string) => void;
  onToggleTestudo: (id: string) => void;
}) {
  const meta = FACTION_META[player.faction];
  const offensiveTarget = pending && ['ATTACK_TARGET', 'BERSERKER_TARGET'].includes(pending.kind) && ownerId !== currentPlayer;
  const friendlyTarget = pending && ['DOCTOR_TARGET', 'DEFENCE_TARGET'].includes(pending.kind) && ownerId === currentPlayer;
  const testudoTarget = pending?.kind === 'TESTUDO_TARGETS' && ownerId === currentPlayer;
  const targetable = Boolean(offensiveTarget || friendlyTarget || testudoTarget);
  const allowDefeated = pending?.kind === 'DOCTOR_TARGET' && ownerId === currentPlayer;
  return (
    <div className="player-area" style={{ '--faction': meta.colour } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="text-2xl" style={{ color: meta.colour }}>{meta.symbol}</span><div><h2 className="font-cinzel font-semibold tracking-wide">{player.faction}</h2><p className="text-xs text-[var(--muted)]">{livingUnits(player).length} {t(ui.alive, language).toLowerCase()} · {concealed ? `${handCount} cards` : `${player.hand.length} cards`}</p></div></div>
        <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
          {player.skipTurns > 0 && <EffectBadge>Skip ×{player.skipTurns}</EffectBadge>}
          {player.defenceDisabled && <EffectBadge>Defence off</EffectBadge>}
          {player.bushidoActive && <EffectBadge>Bushido</EffectBadge>}
          {player.testudoActive && <EffectBadge>Testudo</EffectBadge>}
          {player.mummyDoubleAttack && <EffectBadge>Mummy</EffectBadge>}
        </div>
      </div>
      <div className="unit-row">
        {player.units.map((unit) => {
          const selected = pending?.kind === 'TESTUDO_TARGETS' && pending.selected.includes(unit.id);
          const requiresDefeated = pending?.kind === 'DOCTOR_TARGET';
          const canTarget = targetable && (requiresDefeated ? unit.state === 'DEFEATED' && !unit.isMummy : unit.state === 'ALIVE');
          return <Unit key={unit.id} unit={unit} language={language} selected={selected} targetable={canTarget} allowDefeated={allowDefeated} onClick={() => pending?.kind === 'TESTUDO_TARGETS' ? onToggleTestudo(unit.id) : onUnit(unit.id)} />;
        })}
      </div>
    </div>
  );
}

function EffectBadge({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-[var(--line)] bg-[var(--page)] px-2 py-1 text-[var(--muted)]">{children}</span>; }

function Unit({ unit, language, selected, targetable, allowDefeated, onClick }: { unit: UnitCard; language: Language; selected: boolean; targetable: boolean; allowDefeated: boolean; onClick: () => void }) {
  const defeated = unit.state === 'DEFEATED';
  return (
    <button disabled={!targetable || (defeated && !allowDefeated)} onClick={onClick} className={`unit-card ${defeated ? 'defeated' : ''} ${selected ? 'selected' : ''} ${targetable && !defeated ? 'targetable' : ''}`}>
      <span className="unit-symbol">{unit.isMummy ? '☥' : '♟'}</span>
      <strong>{unit.name}</strong>
      <small>{defeated ? t(ui.defeated, language) : t(ui.alive, language)}</small>
      <div className="mt-auto flex min-h-5 justify-center gap-1">
        {unit.defence && <span title="DEFENCE">⬡</span>}
        {unit.protectedByTestudo && <span title="TESTUDO">◆</span>}
      </div>
    </button>
  );
}

function Hand({ game, language, onPlay, onDiscard }: { game: GameState; language: Language; onPlay: (id: string) => void; onDiscard: (id: string) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{t(ui.hand, language)}</h3><span className="text-xs text-[var(--muted)]">{game.human.hand.length}/5</span></div>
      <div className="hand-row">
        {game.human.hand.map((card) => (
          <HandCard key={card.instanceId} card={card} language={language} playable={isCardPlayable(game, 'HUMAN', card)} canDiscard={game.currentPlayer === 'HUMAN' && game.phase === 'ACTION' && !game.pendingAction && game.cardsPlayedThisTurn < 2} disabled={game.currentPlayer !== 'HUMAN' || game.phase !== 'ACTION' || Boolean(game.pendingAction)} onPlay={() => onPlay(card.instanceId)} onDiscard={() => onDiscard(card.instanceId)} />
        ))}
        {!game.human.hand.length && <div className="empty-hand">{language === 'en' ? 'Your hand is empty.' : 'Tu mano está vacía.'}</div>}
      </div>
    </div>
  );
}

function HandCard({ card, language, playable, canDiscard, disabled, onPlay, onDiscard }: { card: CardInstance; language: Language; playable: boolean; canDiscard: boolean; disabled: boolean; onPlay: () => void; onDiscard: () => void }) {
  const meta = FACTION_META[card.faction];
  return (
    <article className="hand-card" style={{ '--faction': meta.colour } as React.CSSProperties}>
      <div className="flex items-center justify-between"><span className="card-symbol">{card.symbol}</span><span className="text-[10px] font-semibold tracking-[0.16em]" style={{ color: meta.colour }}>{card.faction}</span></div>
      <div className="mt-5"><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{card.type}</p><h4 className="mt-1 font-cinzel text-sm font-semibold">{card.name}</h4></div>
      <p className="mt-3 min-h-[58px] text-xs leading-relaxed text-[var(--muted)]">{t(card.shortText, language)}</p>
      <div className="mt-4 grid grid-cols-2 gap-1.5">
        <button className="card-play" disabled={disabled || !playable} onClick={onPlay}>{t(ui.play, language)}</button>
        <button className="card-discard" disabled={disabled || !canDiscard} onClick={onDiscard}>{t(ui.discardCard, language)}</button>
      </div>
    </article>
  );
}


function ActionPanel({ game, language, update }: { game: GameState; language: Language; update: (fn: (current: GameState) => GameState) => void }) {
  const pending = game.pendingAction;
  if (!pending) return (
    <div className="panel min-h-[155px]">
      <p className="eyebrow">Action</p>
      <h3 className="mt-2 text-lg font-semibold">{game.currentPlayer === 'HUMAN' ? (language === 'en' ? 'Choose a card' : 'Elige una carta') : (language === 'en' ? 'Computer is considering its move…' : 'El ordenador está pensando…')}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{language === 'en' ? 'Play or discard up to two cards. Only one offensive card and one special card may be used per turn.' : 'Juega o descarta hasta dos cartas. Solo puede usarse una carta ofensiva y una especial por turno.'}</p>
    </div>
  );
  if (pending.kind === 'REACTION') {
    const hasDefence = game.human.hand.some((c) => c.type === 'DEFENCE') && !game.human.defenceDisabled;
    const hasValhalla = game.human.hand.some((c) => c.name === 'VALHALLA' && c.faction === game.human.faction);
    return (
      <div className="panel attention">
        <p className="eyebrow">Reaction</p><h3 className="mt-2 text-lg font-semibold">{language === 'en' ? 'Your unit is under attack' : 'Tu unidad está siendo atacada'}</h3>
        <div className="mt-4 grid gap-2">
          {hasDefence && <button className="primary-button justify-center" onClick={() => update((current) => resolveHumanReaction(current, 'DEFENCE'))}>{t(ui.useDefence, language)}</button>}
          {hasValhalla && <button className="secondary-button justify-center" onClick={() => update((current) => resolveHumanReaction(current, 'VALHALLA'))}>{t(ui.useValhalla, language)}</button>}
          <button className="danger-button" onClick={() => update((current) => resolveHumanReaction(current, 'HIT'))}>{t(ui.takeHit, language)}</button>
        </div>
      </div>
    );
  }
  if (pending.kind === 'SACK_CHOICE') return <ChoicePanel language={language} title={t(ui.choose, language)} choices={[['DRAW', t(ui.drawCard, language)], ['STEAL', t(ui.stealCard, language)]]} onChoice={(choice) => update((current) => resolveChoice(current, choice))} onCancel={() => update(cancelPending)} />;
  if (pending.kind === 'SEPPUKU_CHOICE') return <ChoicePanel language={language} title="SEPPUKU" choices={[['UNIT', t(ui.defeatUnit, language)], ['DISCARD', t(ui.discardTwo, language)]]} onChoice={(choice) => update((current) => resolveChoice(current, choice))} onCancel={() => update(cancelPending)} />;
  if (pending.kind === 'VALHALLA_FOREIGN') return <ChoicePanel language={language} title="VALHALLA" choices={[['DISCARD', t(ui.discardRandom, language)], ['HEAL', t(ui.healEnemy, language)]]} onChoice={(choice) => update((current) => resolveChoice(current, choice))} onCancel={() => update(cancelPending)} />;
  if (pending.kind === 'TESTUDO_TARGETS') return (
    <div className="panel attention"><p className="eyebrow">TESTUDO</p><h3 className="mt-2 font-semibold">{language === 'en' ? 'Select up to three living Roman units' : 'Elige hasta tres unidades romanas vivas'}</h3><p className="mt-2 text-sm text-[var(--muted)]">{pending.selected.length}/3</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="secondary-button justify-center" onClick={() => update(cancelPending)}>{t(ui.cancel, language)}</button><button className="primary-button justify-center" disabled={!pending.selected.length} onClick={() => update(confirmTestudo)}>{t(ui.confirm, language)}</button></div></div>
  );
  const title = pending.kind === 'DOCTOR_TARGET' ? (language === 'en' ? 'Choose a defeated unit to heal' : 'Elige una unidad derrotada para curar') : pending.kind === 'DEFENCE_TARGET' ? (language === 'en' ? 'Choose a living unit to protect' : 'Elige una unidad viva para proteger') : pending.kind === 'BERSERKER_TARGET' ? `${t(ui.selectTarget, language)} · ${pending.remaining}` : t(ui.selectTarget, language);
  return <div className="panel attention"><p className="eyebrow">Target</p><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm text-[var(--muted)]">{language === 'en' ? 'Tap a highlighted unit card on the table.' : 'Pulsa una carta de unidad resaltada sobre la mesa.'}</p><button className="secondary-button mt-4 w-full justify-center" onClick={() => update(cancelPending)}>{t(ui.cancel, language)}</button></div>;
}

function ChoicePanel({ language, title, choices, onChoice, onCancel }: { language: Language; title: string; choices: [string, string][]; onChoice: (choice: string) => void; onCancel: () => void }) {
  return <div className="panel attention"><p className="eyebrow">{t(ui.choose, language)}</p><h3 className="mt-2 text-lg font-semibold">{title}</h3><div className="mt-4 grid gap-2">{choices.map(([value, label]) => <button key={value} className="secondary-button justify-center" onClick={() => onChoice(value)}>{label}</button>)}<button className="text-button mt-2" onClick={onCancel}>{t(ui.cancel, language)}</button></div></div>;
}

function GameLog({ game, language }: { game: GameState; language: Language }) {
  return (
    <div className="panel">
      <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-[0.15em]">{t(ui.log, language)}</h3><span className="text-xs text-[var(--muted)]">{game.log.length}</span></div>
      <div className="log-list">
        {[...game.log].reverse().map((entry, index) => <p key={entry.id} className={index === 0 ? 'latest' : ''}>{t(entry.text, language)}</p>)}
      </div>
    </div>
  );
}

function HelpPanel({ language, onClose }: { language: Language; onClose: () => void }) {
  const items = useMemo(() => {
    const unique = CARD_DEFINITIONS.filter((card, index, all) => all.findIndex((item) => item.type === card.type) === index && card.type !== 'UNIT');
    return unique;
  }, []);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-5 py-4 sm:px-7"><div><p className="eyebrow">KLANS</p><h2 className="text-xl font-semibold">{t(ui.rules, language)}</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
        <div className="space-y-8 p-5 sm:p-7">
          <section><h3 className="help-heading">{language === 'en' ? 'Match objective' : 'Objetivo de la partida'}</h3><p>{language === 'en' ? 'Defeat all opposing units. A faction that loses its final living unit receives one Last Breath draw before elimination.' : 'Derrota todas las unidades rivales. Una facción que pierde su última unidad viva recibe un robo de Último Aliento antes de ser eliminada.'}</p></section>
          <section><h3 className="help-heading">{language === 'en' ? 'Turn structure' : 'Estructura del turno'}</h3><p>{language === 'en' ? 'Draw one card, then play or discard up to two cards. You may use no more than one offensive card and one special card. Finish with no more than five cards.' : 'Roba una carta y después juega o descarta hasta dos cartas. Puedes usar como máximo una carta ofensiva y una especial. Termina con un máximo de cinco cartas.'}</p></section>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((card) => <div key={card.type} className="help-card"><span>{card.symbol}</span><div><strong>{card.type}</strong><p>{t(card.shortText, language)}</p></div></div>)}
          </div>
          <section className="grid gap-3 sm:grid-cols-2">
            <Rule title={language === 'en' ? 'Immediate cards' : 'Cartas inmediatas'} text={language === 'en' ? 'Immediate effects activate only during the normal draw at the start of a turn. Cards gained by SACK, DOCTOR, Survival Instinct or Last Breath do not trigger immediate effects.' : 'Los efectos inmediatos solo se activan durante el robo normal al inicio del turno. Las cartas obtenidas por SACK, DOCTOR, Instinto de Supervivencia o Último Aliento no activan efectos inmediatos.'} />
            <Rule title={language === 'en' ? 'Survival Instinct' : 'Instinto de Supervivencia'} text={language === 'en' ? 'When only one unit remains, the first incoming attack before your next turn lets you draw once. A DEFENCE drawn this way blocks immediately; any other card is kept.' : 'Cuando queda una sola unidad, el primer ataque recibido antes de tu siguiente turno permite un robo. Una DEFENCE obtenida así bloquea de inmediato; cualquier otra carta se conserva.'} />
            <Rule title={language === 'en' ? 'Last Breath' : 'Último Aliento'} text={language === 'en' ? 'After the last unit falls, draw one card. An own-faction DOCTOR or MUMMY may prevent elimination; otherwise the match ends.' : 'Tras caer la última unidad, roba una carta. Un DOCTOR de tu facción o MUMMY puede evitar la eliminación; en caso contrario termina la partida.'} />
            <Rule title={language === 'en' ? 'End of deck' : 'Fin del mazo'} text={language === 'en' ? 'When the common deck is empty, the discard pile is shuffled into a new deck. Active units, defences and timed specials stay on the table.' : 'Cuando se agota el mazo común, el descarte se baraja para formar uno nuevo. Las unidades, defensas y especiales temporales activas permanecen en la mesa.'} />
          </section>
        </div>
      </div>
    </div>
  );
}

function Rule({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-[var(--line)] p-4"><strong>{title}</strong><p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{text}</p></div>; }

function EndScreen({ game, language, onAgain, onHome }: { game: GameState; language: Language; onAgain: () => void; onHome: () => void }) {
  const won = game.winner === 'HUMAN';
  const winner = playerOf(game, game.winner ?? 'COMPUTER');
  return (
    <section className="mx-auto flex min-h-[calc(100vh-74px)] max-w-3xl items-center justify-center px-4 py-14 text-center sm:px-6">
      <div className="w-full rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-7 shadow-card sm:p-12">
        <span className="text-5xl" style={{ color: FACTION_META[winner.faction].colour }}>{FACTION_META[winner.faction].symbol}</span>
        <p className="eyebrow mt-6">{won ? t(ui.winner, language) : t(ui.defeat, language)}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-semibold tracking-wide sm:text-5xl">{winner.faction}</h1>
        <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">{won ? (language === 'en' ? 'Your faction survived Last Breath and outlasted the computer.' : 'Tu facción sobrevivió al Último Aliento y resistió más que el ordenador.') : (language === 'en' ? 'The computer preserved at least one living unit. Review the log and try another strategy.' : 'El ordenador conservó al menos una unidad viva. Revisa el registro y prueba otra estrategia.')}</p>
        <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--page)] p-4 text-sm"><div><span className="block text-[var(--muted)]">Turns</span><strong>{game.turnNumber}</strong></div><div><span className="block text-[var(--muted)]">Deck</span><strong>{game.deck.length}</strong></div><div><span className="block text-[var(--muted)]">Discard</span><strong>{game.discardPile.length}</strong></div></div>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><button className="primary-button" onClick={onAgain}>{t(ui.playAgain, language)}</button><button className="secondary-button" onClick={onHome}>{t(ui.home, language)}</button></div>
      </div>
    </section>
  );
}
