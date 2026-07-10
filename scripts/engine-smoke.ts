import { FACTIONS } from '../lib/factions';
import {
  aiStep,
  canEndTurn,
  confirmTestudo,
  discardFromHand,
  endTurn,
  isCardPlayable,
  livingUnits,
  newGame,
  resolveChoice,
  resolveHumanReaction,
  resolveTarget,
  selectCard,
  toggleTestudoTarget,
} from '../lib/gameEngine';
import type { Faction, GameState } from '../lib/types';

function resolvePending(game: GameState): GameState {
  const pending = game.pendingAction;
  if (!pending) return game;
  switch (pending.kind) {
    case 'ATTACK_TARGET': {
      const target = livingUnits(game.computer)[0];
      return target ? resolveTarget(game, target.id) : game;
    }
    case 'DEFENCE_TARGET': {
      const target = livingUnits(game.human).find((unit) => !unit.defence);
      return target ? resolveTarget(game, target.id) : game;
    }
    case 'DOCTOR_TARGET': {
      const target = game.human.units.find((unit) => unit.state === 'DEFEATED' && !unit.isMummy);
      return target ? resolveTarget(game, target.id) : game;
    }
    case 'BERSERKER_TARGET': {
      const target = livingUnits(game.computer)[0];
      return target ? resolveTarget(game, target.id) : game;
    }
    case 'TESTUDO_TARGETS': {
      let next = game;
      for (const unit of livingUnits(game.human).slice(0, 3)) next = toggleTestudoTarget(next, unit.id);
      return confirmTestudo(next);
    }
    case 'SACK_CHOICE':
      return resolveChoice(game, game.computer.hand.length ? 'STEAL' : 'DRAW');
    case 'SEPPUKU_CHOICE':
      return resolveChoice(game, game.human.hand.length >= 2 && livingUnits(game.human).length <= 2 ? 'DISCARD' : 'UNIT');
    case 'VALHALLA_FOREIGN':
      return resolveChoice(game, game.computer.units.some((unit) => unit.state === 'DEFEATED') ? 'HEAL' : 'DISCARD');
    case 'REACTION': {
      const hasDefence = game.human.hand.some((card) => card.type === 'DEFENCE') && !game.human.defenceDisabled;
      const hasValhalla = game.human.hand.some((card) => card.name === 'VALHALLA' && card.faction === game.human.faction);
      return resolveHumanReaction(game, hasDefence ? 'DEFENCE' : hasValhalla ? 'VALHALLA' : 'HIT');
    }
  }
}

function humanStep(game: GameState): GameState {
  if (game.pendingAction) return resolvePending(game);
  if (game.currentPlayer !== 'HUMAN' || game.phase !== 'ACTION') return game;
  if (game.cardsPlayedThisTurn >= 2) return endTurn(game);
  const playable = game.human.hand.find((card) => isCardPlayable(game, 'HUMAN', card));
  if (playable) return selectCard(game, 'HUMAN', playable.instanceId);
  if (game.human.hand[0]) return discardFromHand(game, 'HUMAN', game.human.hand[0].instanceId);
  return endTurn(game, true);
}

function runMatch(human: Faction, computer: Faction, skilled: boolean): number {
  let game = newGame(human, computer, skilled ? 'SKILLED' : 'SIMPLE', 'en');
  for (let step = 1; step <= 3000; step += 1) {
    if (game.winner) return step;
    const before = JSON.stringify({
      current: game.currentPlayer,
      phase: game.phase,
      pending: game.pendingAction?.kind,
      cards: game.cardsPlayedThisTurn,
      hands: [game.human.hand.length, game.computer.hand.length],
      units: [livingUnits(game.human).length, livingUnits(game.computer).length],
      deck: game.deck.length,
      discard: game.discardPile.length,
      turn: game.turnNumber,
    });
    game = game.currentPlayer === 'COMPUTER' && !game.pendingAction ? aiStep(game) : humanStep(game);
    if (game.currentPlayer === 'HUMAN' && canEndTurn(game) && !game.pendingAction && game.cardsPlayedThisTurn >= 2) game = endTurn(game);
    const after = JSON.stringify({
      current: game.currentPlayer,
      phase: game.phase,
      pending: game.pendingAction?.kind,
      cards: game.cardsPlayedThisTurn,
      hands: [game.human.hand.length, game.computer.hand.length],
      units: [livingUnits(game.human).length, livingUnits(game.computer).length],
      deck: game.deck.length,
      discard: game.discardPile.length,
      turn: game.turnNumber,
    });
    if (before === after) throw new Error(`Stalled at step ${step}: ${human} vs ${computer} (${game.currentPlayer}, ${game.pendingAction?.kind ?? game.phase})`);
  }
  throw new Error(`No winner after 3000 steps: ${human} vs ${computer}`);
}

let matches = 0;
let longest = 0;
for (const human of FACTIONS) {
  for (const computer of FACTIONS) {
    if (human === computer) continue;
    for (const skilled of [false, true]) {
      for (let repeat = 0; repeat < 4; repeat += 1) {
        const steps = runMatch(human, computer, skilled);
        longest = Math.max(longest, steps);
        matches += 1;
      }
    }
  }
}
console.log(`Engine smoke test passed: ${matches} complete matches; longest ${longest} state transitions.`);
