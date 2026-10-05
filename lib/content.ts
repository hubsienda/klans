import type { CardType, Language } from './types';

export interface RuleSection {
  id: string;
  number: number;
  title: Record<Language, string>;
  body: Record<Language, string[]>;
  bullets?: Record<Language, string[]>;
}

export const RULE_SECTIONS: RuleSection[] = [
  {
    id: 'objective', number: 1,
    title: { en: 'Objective', es: 'Objetivo' },
    body: {
      en: ['Be the last player who still controls at least one surviving unit.'],
      es: ['Ser el último jugador que conserve al menos una unidad bajo su control.'],
    },
  },
  {
    id: 'components', number: 2,
    title: { en: 'Components', es: 'Componentes' },
    body: {
      en: ['Each faction has 5 Unit Cards. The common action-card structure contributes 20 action cards per faction.'],
      es: ['Cada facción dispone de 5 Cartas de Unidad. La estructura de cartas de acción aporta 20 cartas de acción por facción.'],
    },
    bullets: {
      en: ['5 ATTACK', '5 DEFENCE', '2 DOCTOR', '2 SPY', '2 SACK', '2 SABOTAGE', '2 AMBUSH'],
      es: ['5 ATAQUE', '5 DEFENSA', '2 CURANDERO', '2 ESPÍA', '2 SAQUEO', '2 SABOTAJE', '2 EMBOSCADA'],
    },
  },
  {
    id: 'setup', number: 3,
    title: { en: 'Setup', es: 'Preparación' },
    body: {
      en: ['Each player chooses a faction and places its five units face up. Shuffle the common deck and deal five cards to every player. Decide randomly who starts. Play proceeds clockwise.'],
      es: ['Cada jugador elige una facción y coloca sus cinco unidades boca arriba. Se mezclan todas las cartas de la baraja común y se reparten cinco cartas a cada jugador. Se decide al azar quién comienza. El juego continúa en el sentido de las agujas del reloj.'],
    },
  },
  {
    id: 'turn', number: 4,
    title: { en: 'Turn', es: 'Desarrollo del turno' },
    body: {
      en: ['At the start of your turn, draw one card. During the turn you may play a card, discard a card, or pass if you have five cards or fewer in hand.', 'You may not finish a normal turn with more than five cards. If your hand exceeds five cards, continue playing and/or discarding until it returns to five or fewer, respecting any discard consequences.'],
      es: ['Al comienzo de tu turno, roba una carta. Durante el turno puedes jugar una carta, descartar una carta o pasar si tienes cinco cartas o menos en la mano.', 'No puedes terminar un turno normal con más de cinco cartas. Si tu mano supera las cinco cartas, debes seguir jugando y/o descartando hasta volver a cinco o menos, respetando las consecuencias de cada descarte.'],
    },
  },
  {
    id: 'actions', number: 5,
    title: { en: 'Action Cards', es: 'Cartas de acción' },
    body: {
      en: ['ATTACK defeats one enemy unit; the attacked player may block it with DEFENCE from hand, after which both cards are discarded.', 'DEFENCE stays in hand and may only be played reactively when one of your units is attacked. It completely blocks ATTACK.', 'DOCTOR restores one defeated unit from a faction you control and returns it immediately to play.', "SPY lets you inspect an opponent's hand.", "SACK takes one random card from an opponent's hand and adds it to yours.", 'SABOTAGE makes the chosen opponent completely lose their next turn: no draw, play or discard.', 'AMBUSH immediately attacks a chosen enemy unit and DEFENCE cannot be played against it.'],
      es: ['ATAQUE derrota a una unidad enemiga; el jugador atacado puede bloquearlo con una DEFENSA desde su mano, tras lo cual ambas cartas se descartan.', 'DEFENSA permanece en la mano y solo puede jugarse de forma reactiva cuando una de tus unidades es atacada. Bloquea completamente un ATAQUE.', 'CURANDERO recupera una unidad derrotada de una facción bajo tu control y la devuelve inmediatamente al campo de batalla.', 'ESPÍA permite mirar la mano de un jugador rival.', 'SAQUEO toma una carta al azar de la mano de un rival y la añade a la tuya.', 'SABOTAJE hace que el rival elegido pierda completamente su siguiente turno: no roba, no juega y no descarta.', 'EMBOSCADA realiza inmediatamente un ataque contra una unidad enemiga elegida y no permite jugar DEFENSA.'],
    },
  },
  {
    id: 'conquest', number: 6,
    title: { en: 'Conquering Factions', es: 'Conquista de facciones' },
    body: {
      en: ['When a player loses the final unit of a faction, that faction is conquered by the player who delivered the final attack. The faction comes under the conqueror’s control.', 'The conqueror may restore its defeated units using DOCTOR cards. Cards from that faction are no longer considered enemy cards for the conqueror. A player may control several conquered factions during a match.'],
      es: ['Cuando un jugador pierde la última unidad de una facción, esa facción queda conquistada por el jugador que realizó el ataque final. La facción pasa a estar bajo el control del conquistador.', 'El conquistador puede recuperar sus unidades derrotadas mediante CURANDEROS. Las cartas de esa facción dejan de considerarse enemigas para él. Un jugador puede conquistar varias facciones durante la partida.'],
    },
  },
  {
    id: 'enemy-cards', number: 7,
    title: { en: 'Enemy Cards', es: 'Cartas enemigas' },
    body: {
      en: ['You may hold cards belonging to other factions. Special consequences apply only when you intentionally discard an enemy SPY, SACK or SABOTAGE. Other enemy cards may be discarded without special effect.'],
      es: ['Puedes tener cartas pertenecientes a otras facciones. Solo existen consecuencias especiales cuando decides descartar una carta enemiga de ESPÍA, SAQUEO o SABOTAJE. Las demás cartas enemigas pueden descartarse sin efecto especial.'],
    },
    bullets: {
      en: ['Enemy SPY discarded: reveal your entire hand to that faction’s player.', 'Enemy SACK discarded: that faction’s player takes one random card from your hand.', 'Enemy SABOTAGE discarded: you completely lose your next turn.'],
      es: ['ESPÍA enemigo descartado: debes enseñar toda tu mano al jugador de esa facción.', 'SAQUEO enemigo descartado: el jugador de esa facción toma una carta al azar de tu mano.', 'SABOTAJE enemigo descartado: pierdes completamente tu siguiente turno.'],
    },
  },
  {
    id: 'diplomacy', number: 8,
    title: { en: 'Diplomacy and Negotiation', es: 'Diplomacia y negociación' },
    body: {
      en: ['Before playing cards, players may negotiate freely. No pact is binding and alliances may be broken at any time.'],
      es: ['Antes de jugar cartas, los jugadores pueden negociar libremente. Ningún pacto es obligatorio y las alianzas pueden romperse en cualquier momento.'],
    },
    bullets: {
      en: ['Form alliances', 'Exchange cards', 'Promise help', 'Coordinate attacks', 'Negotiate the conquest of a faction', 'Lie and betray agreements'],
      es: ['Formar alianzas', 'Intercambiar cartas', 'Prometer ayuda', 'Coordinar ataques', 'Negociar la conquista de una facción', 'Mentir y traicionar acuerdos'],
    },
  },
  {
    id: 'elimination', number: 9,
    title: { en: 'Elimination', es: 'Eliminación' },
    body: {
      en: ['A player is eliminated only when they lose all units under their control.'],
      es: ['Un jugador queda eliminado únicamente cuando pierde todas las unidades bajo su control.'],
    },
  },
  {
    id: 'victory', number: 10,
    title: { en: 'Victory', es: 'Victoria' },
    body: {
      en: ['The last player who controls at least one faction containing at least one surviving unit wins.'],
      es: ['Gana el último jugador que conserve al menos una facción con alguna unidad viva.'],
    },
  },
];

export interface ActionCardEditorial {
  type: CardType;
  image: string;
  name: Record<Language, string>;
  effect: Record<Language, string>;
}

export const ACTION_CARD_EDITORIAL: ActionCardEditorial[] = [
  { type: 'ATTACK', image: '/factions/action-cards/attack.png', name: { en: 'ATTACK', es: 'ATAQUE' }, effect: { en: 'Defeats one enemy unit. The defender may play DEFENCE from hand.', es: 'Derrota una unidad enemiga. El rival puede jugar DEFENSA desde su mano.' } },
  { type: 'DEFENCE', image: '/factions/action-cards/defence.png', name: { en: 'DEFENCE', es: 'DEFENSA' }, effect: { en: 'Reactive only. Completely blocks ATTACK.', es: 'Solo reactiva. Bloquea completamente ATAQUE.' } },
  { type: 'DOCTOR', image: '/factions/action-cards/doctor.png', name: { en: 'DOCTOR', es: 'CURANDERO' }, effect: { en: 'Restores one defeated unit from a faction you control.', es: 'Recupera una unidad derrotada de una facción bajo tu control.' } },
  { type: 'SPY', image: '/factions/action-cards/spy.png', name: { en: 'SPY', es: 'ESPÍA' }, effect: { en: "Inspect an opponent's hand.", es: 'Mira la mano de un jugador rival.' } },
  { type: 'SACK', image: '/factions/action-cards/sack.png', name: { en: 'SACK', es: 'SAQUEO' }, effect: { en: "Take one random card from an opponent's hand.", es: 'Toma una carta al azar de la mano de un rival.' } },
  { type: 'SABOTAGE', image: '/factions/action-cards/sabotage.png', name: { en: 'SABOTAGE', es: 'SABOTAJE' }, effect: { en: 'The chosen opponent completely loses their next turn.', es: 'El rival elegido pierde completamente su siguiente turno.' } },
  { type: 'AMBUSH', image: '/factions/action-cards/ambush.png', name: { en: 'AMBUSH', es: 'EMBOSCADA' }, effect: { en: 'Immediately attacks one enemy unit. DEFENCE cannot be played.', es: 'Ataca inmediatamente a una unidad enemiga. No se puede jugar DEFENSA.' } },
];
