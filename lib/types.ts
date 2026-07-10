export type Faction = 'ROMAN' | 'VIKING' | 'EGYPT' | 'SAMURAI';
export type CardType = 'UNIT' | 'ATTACK' | 'DEFENCE' | 'DOCTOR' | 'SPY' | 'SABOTAGE' | 'SACK' | 'SPECIAL';
export type UnitState = 'ALIVE' | 'DEFEATED';
export type PlayerId = 'HUMAN' | 'COMPUTER';
export type Difficulty = 'SIMPLE' | 'SKILLED';
export type Language = 'es' | 'en';
export type Theme = 'light' | 'dark';
export type Screen = 'HOME' | 'SETUP' | 'GAME' | 'END';
export type GamePhase = 'DRAW' | 'ACTION' | 'REACTION' | 'ENDED';

export interface LocalisedText { es: string; en: string }

export interface CardDefinition {
  id: string;
  faction: Faction;
  type: CardType;
  name: string;
  quantity: number;
  offensive: boolean;
  special: boolean;
  immediateOnNormalDraw: boolean;
  symbol: string;
  labels: LocalisedText;
  shortText: LocalisedText;
}

export interface CardInstance extends CardDefinition { instanceId: string }

export interface UnitCard {
  id: string;
  name: string;
  faction: Faction;
  state: UnitState;
  defence?: CardInstance;
  protectedByTestudo?: boolean;
  isMummy?: boolean;
}

export interface PlayerState {
  id: PlayerId;
  faction: Faction;
  hand: CardInstance[];
  units: UnitCard[];
  skipTurns: number;
  defenceDisabled: boolean;
  defenceDisabledTurns: number;
  bushidoActive: boolean;
  testudoActive: boolean;
  mummyDoubleAttack: boolean;
  survivalUsed: boolean;
  knowsOpponentHand: boolean;
}

export interface LogEntry { id: string; text: LocalisedText }

export interface AttackContext {
  attacker: PlayerId;
  defender: PlayerId;
  targetUnitId: string;
  attackCard?: CardInstance;
  source: string;
  allowHandDefence: boolean;
  doubleHit?: boolean;
  valhallaEligible?: boolean;
}

export type PendingAction =
  | { kind: 'ATTACK_TARGET'; cardId: string }
  | { kind: 'DEFENCE_TARGET'; cardId: string }
  | { kind: 'DOCTOR_TARGET'; cardId: string }
  | { kind: 'TESTUDO_TARGETS'; cardId: string; selected: string[] }
  | { kind: 'BERSERKER_TARGET'; cardId: string; remaining: number }
  | { kind: 'SACK_CHOICE'; cardId: string }
  | { kind: 'SEPPUKU_CHOICE'; cardId: string; ownerEffect: boolean }
  | { kind: 'VALHALLA_FOREIGN'; cardId: string }
  | { kind: 'REACTION'; context: AttackContext };

export interface GameState {
  human: PlayerState;
  computer: PlayerState;
  currentPlayer: PlayerId;
  turnNumber: number;
  phase: GamePhase;
  deck: CardInstance[];
  discardPile: CardInstance[];
  cardsPlayedThisTurn: number;
  offensivePlayedThisTurn: boolean;
  specialPlayedThisTurn: boolean;
  attackLimitThisTurn: number;
  attacksMadeThisTurn: number;
  pendingAction?: PendingAction;
  log: LogEntry[];
  winner?: PlayerId;
  difficulty: Difficulty;
  language: Language;
  aiThinking: boolean;
}
