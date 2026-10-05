export type Faction = 'ROMAN' | 'VIKING' | 'EGYPT' | 'SAMURAI';

export type CardType =
  | 'ATTACK'
  | 'DEFENCE'
  | 'DOCTOR'
  | 'SPY'
  | 'SACK'
  | 'SABOTAGE'
  | 'AMBUSH';

export type UnitState = 'ALIVE' | 'DEFEATED';
export type PlayerId = 'HUMAN' | 'COMPUTER';
export type Difficulty = 'SIMPLE' | 'SKILLED';
export type Language = 'es' | 'en';
export type Theme = 'light' | 'dark';
export type GamePhase = 'READY' | 'ACTION' | 'AWAIT_DEFENCE' | 'GAME_OVER';

export interface LocalisedText {
  en: string;
  es: string;
}

export interface CardDefinition {
  type: CardType;
  quantity: number;
  symbol: string;
  labels: LocalisedText;
  shortText: LocalisedText;
}

export interface CardInstance {
  instanceId: string;
  faction: Faction;
  type: CardType;
  symbol: string;
}

export interface Unit {
  id: string;
  faction: Faction;
  name: string;
  state: UnitState;
}

export interface PlayerState {
  faction: Faction;
  hand: CardInstance[];
  units: Unit[];
  skipNextTurn: boolean;
}

export interface PendingAttack {
  attacker: PlayerId;
  defender: PlayerId;
  targetUnitId: string;
  source: 'ATTACK';
}

export interface GameLogEntry extends LocalisedText {
  id: string;
}

export interface GameState {
  human: PlayerState;
  computer: PlayerState;
  currentPlayer: PlayerId;
  startingPlayer: PlayerId;
  turnNumber: number;
  phase: GamePhase;
  deck: CardInstance[];
  discardPile: CardInstance[];
  pendingAttack?: PendingAttack;
  revealComputerHand: boolean;
  revealReason?: 'SPY' | 'ENEMY_SPY_DISCARD';
  computerKnownHumanHand: CardInstance[] | null;
  difficulty: Difficulty;
  log: GameLogEntry[];
  lastAction?: LocalisedText;
  winner?: PlayerId;
  conqueredFaction?: Faction;
}

export interface StartGameOptions {
  humanFaction: Faction;
  computerFaction: Faction;
  difficulty: Difficulty;
}

export interface ActionResult {
  state: GameState;
  ok: boolean;
  message?: LocalisedText;
}
