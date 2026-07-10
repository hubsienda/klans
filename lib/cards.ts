import { CardDefinition, CardInstance, CardType, Faction, UnitCard } from './types';
import { FACTION_UNITS } from './factions';

const genericText: Record<CardType, { symbol: string; en: string; es: string }> = {
  UNIT: { symbol: '♟', en: 'Living fighter. Last faction standing wins.', es: 'Combatiente vivo. Gana la última facción en pie.' },
  ATTACK: { symbol: '⚔', en: 'Defeat one enemy unit unless defended.', es: 'Derrota una unidad enemiga salvo que sea defendida.' },
  DEFENCE: { symbol: '⬡', en: 'Block one attack or protect a unit in advance.', es: 'Bloquea un ataque o protege una unidad por adelantado.' },
  DOCTOR: { symbol: '✚', en: 'Heal one defeated unit of its own faction.', es: 'Cura una unidad derrotada de su propia facción.' },
  SPY: { symbol: '◉', en: 'Reveal the opponent hand — or expose yours.', es: 'Revela la mano rival, o deja expuesta la tuya.' },
  SABOTAGE: { symbol: '⚙', en: 'Force a skipped turn. It may backfire.', es: 'Obliga a perder un turno. Puede volverse en tu contra.' },
  SACK: { symbol: '⬟', en: 'Draw or steal a card. It may help the opponent.', es: 'Roba del mazo o al rival. Puede beneficiar al oponente.' },
  SPECIAL: { symbol: '★', en: 'Unique faction power.', es: 'Poder único de facción.' },
};

const common = (faction: Faction, type: CardType, quantity: number): CardDefinition => ({
  id: `${faction}-${type}`,
  faction,
  type,
  name: type,
  quantity,
  offensive: type === 'ATTACK',
  special: false,
  immediateOnNormalDraw: type === 'SABOTAGE',
  symbol: genericText[type].symbol,
  labels: { en: type, es: type },
  shortText: { en: genericText[type].en, es: genericText[type].es },
});

const special = (faction: Faction, name: string, offensive: boolean, en: string, es: string): CardDefinition => ({
  id: `${faction}-SPECIAL-${name}`,
  faction,
  type: 'SPECIAL',
  name,
  quantity: 1,
  offensive,
  special: true,
  immediateOnNormalDraw: false,
  symbol: '★',
  labels: { en: name, es: name },
  shortText: { en, es },
});

export const CARD_DEFINITIONS: CardDefinition[] = [
  ...(['ROMAN', 'VIKING', 'EGYPT', 'SAMURAI'] as Faction[]).flatMap((faction) => [
    common(faction, 'ATTACK', 5), common(faction, 'DEFENCE', 5), common(faction, 'DOCTOR', 2),
    common(faction, 'SPY', 1), common(faction, 'SABOTAGE', 1), common(faction, 'SACK', 1),
  ]),
  special('ROMAN', 'TESTUDO', false, 'Protect up to three Romans until your next turn.', 'Protege hasta tres romanos hasta tu próximo turno.'),
  special('ROMAN', 'GLADIATORES', true, 'Resolve a one-on-one duel.', 'Resuelve un duelo uno contra uno.'),
  special('VIKING', 'VALHALLA', false, 'A fallen Viking takes an attacker with it.', 'Un vikingo caído arrastra consigo a un atacante.'),
  special('VIKING', 'BERSERKER', true, 'Launch two immediate attacks.', 'Lanza dos ataques inmediatos.'),
  special('SAMURAI', 'SEPPUKU', true, 'Force a unit defeat or two-card discard.', 'Obliga a derrotar una unidad o descartar dos cartas.'),
  special('SAMURAI', 'BUSHIDO', false, 'Allow normal defences against offensive specials.', 'Permite defensas normales contra especiales ofensivas.'),
  special('EGYPT', 'RA', false, 'Destroy active enemy defences.', 'Destruye las defensas enemigas activas.'),
  special('EGYPT', 'MUMMY', false, 'Create an extra living unit.', 'Crea una unidad viva adicional.'),
];

export function createDeck(factions: Faction[]): CardInstance[] {
  let serial = 0;
  const cards = CARD_DEFINITIONS.filter((card) => factions.includes(card.faction));
  return cards.flatMap((definition) => Array.from({ length: definition.quantity }, () => ({
    ...definition,
    instanceId: `${definition.id}-${serial++}-${Math.random().toString(36).slice(2, 7)}`,
  })));
}

export function createUnits(faction: Faction): UnitCard[] {
  return FACTION_UNITS[faction].map((name) => ({ id: `${faction}-${name}`, name, faction, state: 'ALIVE' }));
}
