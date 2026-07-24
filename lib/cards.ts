import { FACTION_UNITS, FACTIONS } from './factions';
import { CardDefinition, CardInstance, CardType, Faction, Unit } from './types';
import { shuffle, uid } from './utils';

const CARD_META: Record<
  CardType,
  { quantity: number; symbol: string; labels: { en: string; es: string }; shortText: { en: string; es: string } }
> = {
  ATTACK: {
    quantity: 5,
    symbol: '⚔',
    labels: { en: 'Attack', es: 'Ataque' },
    shortText: {
      en: 'Choose a living enemy unit. The opponent may answer with DEFENCE.',
      es: 'Elige una unidad enemiga viva. El rival puede responder con DEFENCE.',
    },
  },
  DEFENCE: {
    quantity: 5,
    symbol: '⬡',
    labels: { en: 'Defence', es: 'Defensa' },
    shortText: {
      en: 'Play only in response to ATTACK. Blocks it completely.',
      es: 'Juega solo como respuesta a ATTACK. Lo bloquea por completo.',
    },
  },
  DOCTOR: {
    quantity: 2,
    symbol: '✚',
    labels: { en: 'Doctor', es: 'Médico' },
    shortText: {
      en: 'Restore one defeated unit belonging to this card’s faction.',
      es: 'Recupera una unidad derrotada perteneciente a la facción de esta carta.',
    },
  },
  SPY: {
    quantity: 2,
    symbol: '◉',
    labels: { en: 'Spy', es: 'Espía' },
    shortText: {
      en: 'Inspect the opponent’s hand.',
      es: 'Inspecciona la mano del rival.',
    },
  },
  SACK: {
    quantity: 2,
    symbol: '♜',
    labels: { en: 'Sack', es: 'Saqueo' },
    shortText: {
      en: 'Steal one random card from the opponent’s hand.',
      es: 'Roba una carta al azar de la mano del rival.',
    },
  },
  SABOTAGE: {
    quantity: 2,
    symbol: '⚙',
    labels: { en: 'Sabotage', es: 'Sabotaje' },
    shortText: {
      en: 'The opponent skips their next turn completely.',
      es: 'El rival pierde por completo su próximo turno.',
    },
  },
  AMBUSH: {
    quantity: 2,
    symbol: '⌁',
    labels: { en: 'Ambush', es: 'Emboscada' },
    shortText: {
      en: 'Defeat a living enemy unit. DEFENCE cannot be used.',
      es: 'Derrota una unidad enemiga viva. No se puede usar DEFENCE.',
    },
  },
};

export const CARD_TYPES: CardType[] = [
  'ATTACK',
  'DEFENCE',
  'DOCTOR',
  'SPY',
  'SACK',
  'SABOTAGE',
  'AMBUSH',
];

export const CARD_DEFINITIONS: CardDefinition[] = FACTIONS.flatMap((faction) =>
  CARD_TYPES.map((type) => {
    const meta = CARD_META[type];
    return {
      id: `${faction}-${type}`,
      faction,
      type,
      name: type,
      quantity: meta.quantity,
      symbol: meta.symbol,
      labels: meta.labels,
      shortText: meta.shortText,
    };
  }),
);

export const getCardDefinition = (faction: Faction, type: CardType): CardDefinition => {
  const definition = CARD_DEFINITIONS.find((card) => card.faction === faction && card.type === type);
  if (!definition) throw new Error(`Missing card definition for ${faction} ${type}`);
  return definition;
};

export const createFactionDeck = (faction: Faction): CardInstance[] =>
  CARD_DEFINITIONS.filter((definition) => definition.faction === faction).flatMap((definition) =>
    Array.from({ length: definition.quantity }, (_, index) => ({
      instanceId: uid(`${definition.id.toLowerCase()}-${index + 1}`),
      definitionId: definition.id,
      faction: definition.faction,
      type: definition.type,
      name: definition.name,
      symbol: definition.symbol,
    })),
  );

export const createMatchDeck = (humanFaction: Faction, computerFaction: Faction): CardInstance[] =>
  shuffle([...createFactionDeck(humanFaction), ...createFactionDeck(computerFaction)]);

export const createUnits = (faction: Faction): Unit[] =>
  FACTION_UNITS[faction].map((name) => ({
    id: uid(`${faction.toLowerCase()}-${name.toLowerCase()}`),
    faction,
    name,
    state: 'ALIVE',
  }));
