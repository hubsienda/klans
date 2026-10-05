import { FACTION_UNITS } from './factions';
import type { CardDefinition, CardInstance, CardType, Faction, Unit } from './types';
import { shuffle, uid } from './utils';

export const CARD_DEFINITIONS: CardDefinition[] = [
  {
    type: 'ATTACK',
    quantity: 5,
    symbol: '⚔',
    labels: { en: 'Attack', es: 'Ataque' },
    shortText: {
      en: 'Defeat one enemy unit. The defender may respond with DEFENCE.',
      es: 'Derrota una unidad enemiga. El rival puede responder con DEFENCE.',
    },
  },
  {
    type: 'DEFENCE',
    quantity: 5,
    symbol: '🛡',
    labels: { en: 'Defence', es: 'Defensa' },
    shortText: {
      en: 'Reactive only. Completely blocks one ATTACK.',
      es: 'Solo reactiva. Bloquea completamente un ATTACK.',
    },
  },
  {
    type: 'DOCTOR',
    quantity: 2,
    symbol: '⚕',
    labels: { en: 'Doctor', es: 'Curandero' },
    shortText: {
      en: 'Restore one defeated unit you control.',
      es: 'Recupera una unidad derrotada bajo tu control.',
    },
  },
  {
    type: 'SPY',
    quantity: 2,
    symbol: '◉',
    labels: { en: 'Spy', es: 'Espía' },
    shortText: {
      en: "Inspect the opponent's hand.",
      es: 'Mira la mano del rival.',
    },
  },
  {
    type: 'SACK',
    quantity: 2,
    symbol: '●',
    labels: { en: 'Sack', es: 'Saqueo' },
    shortText: {
      en: "Take one random card from the opponent's hand.",
      es: 'Toma una carta al azar de la mano del rival.',
    },
  },
  {
    type: 'SABOTAGE',
    quantity: 2,
    symbol: '⊙',
    labels: { en: 'Sabotage', es: 'Sabotaje' },
    shortText: {
      en: 'The opponent completely loses their next turn.',
      es: 'El rival pierde completamente su siguiente turno.',
    },
  },
  {
    type: 'AMBUSH',
    quantity: 2,
    symbol: '⌁',
    labels: { en: 'Ambush', es: 'Emboscada' },
    shortText: {
      en: 'Defeat one enemy unit. DEFENCE cannot be played.',
      es: 'Derrota una unidad enemiga. No se puede jugar DEFENCE.',
    },
  },
];

export const CARD_TYPES: CardType[] = CARD_DEFINITIONS.map((definition) => definition.type);

export const getCardDefinition = (type: CardType): CardDefinition => {
  const definition = CARD_DEFINITIONS.find((item) => item.type === type);
  if (!definition) throw new Error(`Missing card definition for ${type}`);
  return definition;
};

export const createFactionCards = (faction: Faction): CardInstance[] =>
  CARD_DEFINITIONS.flatMap((definition) =>
    Array.from({ length: definition.quantity }, (_, index) => ({
      instanceId: uid(`${faction.toLowerCase()}-${definition.type.toLowerCase()}-${index}`),
      faction,
      type: definition.type,
      symbol: definition.symbol,
    })),
  );

export const createMatchDeck = (humanFaction: Faction, computerFaction: Faction, rng: () => number = Math.random): CardInstance[] =>
  shuffle([...createFactionCards(humanFaction), ...createFactionCards(computerFaction)], rng);

export const createUnits = (faction: Faction): Unit[] =>
  FACTION_UNITS[faction].map((name) => ({ id: `${faction}-${name}`, faction, name, state: 'ALIVE' }));
