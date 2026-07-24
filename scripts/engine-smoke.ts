import { createMatchDeck } from '../lib/cards';
import { FACTIONS } from '../lib/factions';
import {
  aiStep,
  autoResolvePending,
  getPlayer,
  livingUnitCount,
  startGame,
} from '../lib/gameEngine';
import { Difficulty, Faction, GameState } from '../lib/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const faction of FACTIONS) {
  const opponent = FACTIONS.find((candidate) => candidate !== faction) as Faction;
  const deck = createMatchDeck(faction, opponent);
  assert(deck.length === 40, `${faction} match deck should contain 40 cards`);
  assert(deck.filter((card) => card.faction === faction).length === 20, `${faction} should contribute 20 cards`);
  assert(deck.filter((card) => card.type === 'ATTACK').length === 10, 'Match deck should contain 10 ATTACK cards');
  assert(deck.filter((card) => card.type === 'DEFENCE').length === 10, 'Match deck should contain 10 DEFENCE cards');
  for (const type of ['DOCTOR', 'SPY', 'SACK', 'SABOTAGE', 'AMBUSH'] as const) {
    assert(deck.filter((card) => card.type === type).length === 4, `Match deck should contain 4 ${type} cards`);
  }
}

const runMatch = (humanFaction: Faction, computerFaction: Faction, difficulty: Difficulty): GameState => {
  let game = startGame({ humanFaction, computerFaction, difficulty });

  for (let step = 0; step < 2500 && !game.winner; step += 1) {
    game = autoResolvePending(game);
    if (game.winner) break;

    if (game.phase === 'ACTION') {
      game = aiStep(game, game.currentPlayer, difficulty);
    }
  }

  assert(game.winner, `${humanFaction} vs ${computerFaction} (${difficulty}) stalled without a winner`);
  const winner = game.winner;
  assert(livingUnitCount(game, winner) > 0, 'Winner must have at least one living unit');
  assert(livingUnitCount(game, winner === 'HUMAN' ? 'COMPUTER' : 'HUMAN') === 0, 'Loser must have no living units');
  assert(game.turnNumber > 0, 'Turn counter must advance');
  assert(game.log.length > 0, 'Game log must contain entries');
  assert(getPlayer(game, 'HUMAN').units.length === 5, 'Human must retain five unit records');
  assert(getPlayer(game, 'COMPUTER').units.length === 5, 'Computer must retain five unit records');
  return game;
};

let completed = 0;
for (const humanFaction of FACTIONS) {
  for (const computerFaction of FACTIONS) {
    if (humanFaction === computerFaction) continue;
    for (const difficulty of ['SIMPLE', 'SKILLED'] as Difficulty[]) {
      for (let repetition = 0; repetition < 4; repetition += 1) {
        runMatch(humanFaction, computerFaction, difficulty);
        completed += 1;
      }
    }
  }
}

console.log(`KLANS engine smoke test passed: ${completed} complete matches.`);
