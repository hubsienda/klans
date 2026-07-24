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
export type Screen = 'HOME' | 'SETUP' | 'GAME' | 'END';
export type GamePhase = 'ACTION' | 'AWAIT_DEFENCE' | 'AWAIT_PASSIVE' | 'GAME_OVER';

export interface LocalisedText {
  en: string;
  es: string;
}

export interface CardDefinition {
  id: string;
  faction: Faction;
  type: CardType;
  name: string;
  quantity: number;
  symbol: string;
  labels: LocalisedText;
  shortText: LocalisedText;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  faction: Faction;
  type: CardType;
  name: string;
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
  passiveUsed: boolean;
}

export interface GameLogEntry extends LocalisedText {
  id: string;
}

export interface PendingAttack {
  attacker: PlayerId;
  defender: PlayerId;
  targetUnitId: string;
  source: 'ATTACK' | 'AMBUSH';
}

export type PassiveKind = 'ROMAN_DISCIPLINE' | 'VIKING_FURY' | 'EGYPT_RESTORATION';

export interface PendingPassive {
  player: PlayerId;
  kind: PassiveKind;
  attack?: PendingAttack;
}

export interface GameState {
  human: PlayerState;
  computer: PlayerState;
  currentPlayer: PlayerId;
  turnNumber: number;
  phase: GamePhase;
  deck: CardInstance[];
  discardPile: CardInstance[];
  actionsUsedThisTurn: number;
  pendingAttack?: PendingAttack;
  pendingPassive?: PendingPassive;
  revealComputerHand: boolean;
  computerKnowsHumanHand: boolean;
  difficulty: Difficulty;
  log: GameLogEntry[];
  winner?: PlayerId;
  lastAction?: LocalisedText;
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
