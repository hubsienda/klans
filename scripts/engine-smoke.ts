import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCardDefinition } from '../lib/cards';
import {
  autoStepForTests,
  beginTurn,
  canEndTurn,
  canPlayCard,
  closeComputerHandReveal,
  discardCard,
  endTurn,
  playCard,
  resolveDefence,
  startGame,
} from '../lib/gameEngine';
import type { CardInstance, CardType, Difficulty, Faction, GameState, PlayerId } from '../lib/types';

let sequence = 0;
const makeCard = (faction: Faction, type: CardType): CardInstance => ({
  instanceId: `test-${faction}-${type}-${sequence += 1}`,
  faction,
  type,
  symbol: getCardDefinition(type).symbol,
});

const readyGame = (human: Faction = 'ROMAN', computer: Faction = 'VIKING', difficulty: Difficulty = 'SKILLED'): GameState =>
  startGame({ humanFaction: human, computerFaction: computer, difficulty }, () => 0.1);

const activeHumanGame = (): GameState => {
  const game = readyGame();
  return beginTurn(game, 'HUMAN');
};

const targetId = (game: GameState, player: PlayerId, index = 0): string =>
  (player === 'HUMAN' ? game.human.units : game.computer.units)[index].id;

// 1. Opening hands are five cards each.
{
  const game = readyGame();
  assert.equal(game.human.hand.length, 5);
  assert.equal(game.computer.hand.length, 5);
}

// 2. Each side starts with five living units.
{
  const game = readyGame();
  assert.equal(game.human.units.filter((unit) => unit.state === 'ALIVE').length, 5);
  assert.equal(game.computer.units.filter((unit) => unit.state === 'ALIVE').length, 5);
}

// 3. Starting player is genuinely randomisable, not hard-coded HUMAN.
{
  const humanStarts = startGame({ humanFaction: 'ROMAN', computerFaction: 'VIKING', difficulty: 'SIMPLE' }, () => 0.1);
  const computerStarts = startGame({ humanFaction: 'ROMAN', computerFaction: 'VIKING', difficulty: 'SIMPLE' }, () => 0.9);
  assert.equal(humanStarts.startingPlayer, 'HUMAN');
  assert.equal(computerStarts.startingPlayer, 'COMPUTER');
}

// 4. A normal turn draws exactly one card when a card is available.
{
  const game = readyGame();
  const before = game.human.hand.length;
  const after = beginTurn(game, 'HUMAN');
  assert.equal(after.human.hand.length, before + 1);
}

// 5. A player cannot end a turn with more than five cards.
{
  const game = activeHumanGame();
  assert.ok(game.human.hand.length > 5);
  assert.equal(canEndTurn(game, 'HUMAN'), false);
  assert.equal(endTurn(game, 'HUMAN').ok, false);
}

// 6. A player can pass/end when hand <= 5.
{
  const game = activeHumanGame();
  game.human.hand = game.human.hand.slice(0, 5);
  assert.equal(canEndTurn(game, 'HUMAN'), true);
  assert.equal(endTurn(game, 'HUMAN').ok, true);
}

// 7. ATTACK can defeat a unit.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'ATTACK')];
  game.computer.hand = [];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId, targetId(game, 'COMPUTER'));
  assert.equal(action.ok, true);
  assert.equal(action.state.computer.units[0].state, 'DEFEATED');
}

// 8. DEFENCE blocks ATTACK.
{
  const game = activeHumanGame();
  game.currentPlayer = 'COMPUTER';
  game.computer.hand = [makeCard('VIKING', 'ATTACK')];
  game.human.hand = [makeCard('ROMAN', 'DEFENCE')];
  const attack = playCard(game, 'COMPUTER', game.computer.hand[0].instanceId, targetId(game, 'HUMAN'));
  assert.equal(attack.state.phase, 'AWAIT_DEFENCE');
  const defended = resolveDefence(attack.state, true);
  assert.equal(defended.state.human.units[0].state, 'ALIVE');
}

// 9. DEFENCE cannot be proactively played.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'DEFENCE')];
  assert.equal(canPlayCard(game, 'HUMAN', game.human.hand[0]), false);
}

// 10. AMBUSH cannot be defended.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'AMBUSH')];
  game.computer.hand = [makeCard('VIKING', 'DEFENCE')];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId, targetId(game, 'COMPUTER'));
  assert.equal(action.state.computer.units[0].state, 'DEFEATED');
  assert.equal(action.state.computer.hand.length, 1);
}

// 11. DOCTOR restores a defeated unit controlled by the player.
{
  const game = activeHumanGame();
  game.human.units[0].state = 'DEFEATED';
  game.human.hand = [makeCard('VIKING', 'DOCTOR')];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId, targetId(game, 'HUMAN'));
  assert.equal(action.state.human.units[0].state, 'ALIVE');
}

// 12. Human SPY reveals the computer hand.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'SPY')];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.equal(action.state.revealComputerHand, true);
}

// 13. SACK transfers a random card rather than discarding it.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'SACK')];
  game.computer.hand = [makeCard('VIKING', 'ATTACK')];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.equal(action.state.human.hand.length, 1);
  assert.equal(action.state.human.hand[0].type, 'ATTACK');
  assert.equal(action.state.computer.hand.length, 0);
}

// 14. SABOTAGE skips the entire next turn, including draw.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('ROMAN', 'SABOTAGE')];
  const played = playCard(game, 'HUMAN', game.human.hand[0].instanceId).state;
  const computerBefore = played.computer.hand.length;
  const advanced = endTurn(played, 'HUMAN').state;
  assert.equal(advanced.computer.hand.length, computerBefore);
  assert.equal(advanced.computer.skipNextTurn, false);
  assert.equal(advanced.currentPlayer, 'HUMAN');
}

// 15. Discarding an enemy SPY reveals the human hand to the computer.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('VIKING', 'SPY'), makeCard('ROMAN', 'ATTACK')];
  const action = discardCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.ok(action.state.computerKnownHumanHand);
  assert.equal(action.state.computerKnownHumanHand?.length, 1);
}

// 16. Discarding an enemy SACK transfers a random card to that faction owner.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('VIKING', 'SACK'), makeCard('ROMAN', 'ATTACK')];
  game.computer.hand = [];
  const action = discardCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.equal(action.state.human.hand.length, 0);
  assert.equal(action.state.computer.hand.length, 1);
  assert.equal(action.state.computer.hand[0].type, 'ATTACK');
}

// 17. Discarding an enemy SABOTAGE makes the discarder lose their next turn.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('VIKING', 'SABOTAGE')];
  const action = discardCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.equal(action.state.human.skipNextTurn, true);
}

// 18. Other enemy cards discard normally without special penalty.
{
  const game = activeHumanGame();
  game.human.hand = [makeCard('VIKING', 'ATTACK')];
  const computerBefore = game.computer.hand.length;
  const action = discardCard(game, 'HUMAN', game.human.hand[0].instanceId);
  assert.equal(action.state.human.skipNextTurn, false);
  assert.equal(action.state.computerKnownHumanHand, null);
  assert.equal(action.state.computer.hand.length, computerBefore);
}

// 19. No obsolete faction passive ability state or source logic remains.
{
  const game = readyGame();
  assert.equal('passiveUsed' in game.human, false);
  const files = ['lib/types.ts', 'lib/factions.ts', 'lib/gameEngine.ts', 'components/KlansApp.tsx', 'README.md'];
  const forbidden = ['passiveUsed', 'ROMAN_DISCIPLINE', 'VIKING_FURY', 'EGYPT_RESTORATION', 'SAMURAI_HONOUR', 'AWAIT_PASSIVE', 'actionsUsedThisTurn'];
  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    for (const token of forbidden) assert.equal(source.includes(token), false, `${file} still contains ${token}`);
  }
}

// 20. Defeating the final enemy unit conquers that faction and wins the solo match.
{
  const game = activeHumanGame();
  game.computer.units.slice(0, 4).forEach((unit) => { unit.state = 'DEFEATED'; });
  game.computer.hand = [];
  game.human.hand = [makeCard('ROMAN', 'ATTACK')];
  const action = playCard(game, 'HUMAN', game.human.hand[0].instanceId, targetId(game, 'COMPUTER', 4));
  assert.equal(action.state.winner, 'HUMAN');
  assert.equal(action.state.conqueredFaction, 'VIKING');
}

// 21-22. Automated matches terminate legally for both SIMPLE and SKILLED AI.
const factions: Faction[] = ['ROMAN', 'VIKING', 'EGYPT', 'SAMURAI'];
let simulations = 0;
for (const human of factions) {
  for (const computer of factions) {
    if (human === computer) continue;
    for (const difficulty of ['SIMPLE', 'SKILLED'] as Difficulty[]) {
      for (let seed = 0; seed < 4; seed += 1) {
        let cursor = 0;
        const rng = () => {
          cursor += 1;
          const value = Math.sin((seed + 1) * 97 + cursor * 13) * 10000;
          return value - Math.floor(value);
        };
        let game = startGame({ humanFaction: human, computerFaction: computer, difficulty }, rng);
        game = beginTurn(game);
        let steps = 0;
        while (!game.winner && steps < 500) {
          if (game.revealComputerHand) {
            game = closeComputerHandReveal(game);
          } else if (game.phase === 'AWAIT_DEFENCE') {
            const canDefend = game.human.hand.some((card) => card.type === 'DEFENCE');
            game = resolveDefence(game, canDefend).state;
          } else if (game.phase === 'ACTION') {
            game = autoStepForTests(game, game.currentPlayer);
          }
          steps += 1;
        }
        assert.ok(game.winner, `${difficulty} match ${human} vs ${computer} did not terminate`);
        assert.ok(steps < 500, 'simulation guard reached');
        simulations += 1;
      }
    }
  }
}

assert.equal(simulations, 96);
console.log(`KLANS engine smoke tests passed: 20 targeted rule checks + ${simulations} complete automated matches.`);
