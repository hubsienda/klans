import { createDeck, createUnits } from './cards';
import { AttackContext, CardInstance, Difficulty, Faction, GameState, LocalisedText, PlayerId, PlayerState, UnitCard } from './types';
import { randomItem, shuffle, uid } from './utils';

const other = (id: PlayerId): PlayerId => id === 'HUMAN' ? 'COMPUTER' : 'HUMAN';
export const keyOf = (id: PlayerId): 'human' | 'computer' => id === 'HUMAN' ? 'human' : 'computer';
export const playerOf = (game: GameState, id: PlayerId) => game[keyOf(id)];

const text = (en: string, es: string): LocalisedText => ({ en, es });
export const appendLog = (game: GameState, en: string, es: string): GameState => ({
  ...game,
  log: [...game.log, { id: uid(), text: text(en, es) }].slice(-80),
});

export function newGame(humanFaction: Faction, computerFaction: Faction, difficulty: Difficulty, language: 'en' | 'es'): GameState {
  const shuffled = shuffle(createDeck([humanFaction, computerFaction]));
  const humanHand = shuffled.slice(0, 4);
  const computerHand = shuffled.slice(4, 8);
  const deck = shuffled.slice(8);
  const base = (id: PlayerId, faction: Faction, hand: CardInstance[]): PlayerState => ({
    id, faction, hand, units: createUnits(faction), skipTurns: 0, defenceDisabled: false, defenceDisabledTurns: 0,
    bushidoActive: false, testudoActive: false, mummyDoubleAttack: false, survivalUsed: false, knowsOpponentHand: false,
  });
  let game: GameState = {
    human: base('HUMAN', humanFaction, humanHand), computer: base('COMPUTER', computerFaction, computerHand),
    currentPlayer: 'HUMAN', turnNumber: 1, phase: 'DRAW', deck, discardPile: [], cardsPlayedThisTurn: 0,
    offensivePlayedThisTurn: false, specialPlayedThisTurn: false, attackLimitThisTurn: 1, attacksMadeThisTurn: 0,
    log: [], difficulty, language, aiThinking: false,
  };
  game = appendLog(game, `${humanFaction} faces ${computerFaction}.`, `${humanFaction} se enfrenta a ${computerFaction}.`);
  return beginTurn(game, 'HUMAN');
}

function recycleIfNeeded(game: GameState): GameState {
  if (game.deck.length > 0 || game.discardPile.length === 0) return game;
  return appendLog({ ...game, deck: shuffle(game.discardPile), discardPile: [] }, 'The discard pile was shuffled into a new deck.', 'La pila de descarte se barajó para formar un nuevo mazo.');
}

export function drawCards(game: GameState, playerId: PlayerId, count = 1, normalDraw = false): GameState {
  let next = game;
  for (let i = 0; i < count; i += 1) {
    next = recycleIfNeeded(next);
    if (!next.deck.length) break;
    const [card, ...deck] = next.deck;
    const playerKey = keyOf(playerId);
    next = { ...next, deck, [playerKey]: { ...next[playerKey], hand: [...next[playerKey].hand, card] } };
    const whoEn = playerId === 'HUMAN' ? 'You' : 'Computer';
    const whoEs = playerId === 'HUMAN' ? 'Has' : 'El ordenador ha';
    next = appendLog(next, `${whoEn} drew ${card.name}.`, `${whoEs} robado ${card.name}.`);
    if (normalDraw && card.immediateOnNormalDraw) next = resolveImmediateDraw(next, playerId, card);
    if (next.phase === 'ENDED' || next.currentPlayer !== playerId) break;
  }
  return next;
}

function removeFromHand(game: GameState, playerId: PlayerId, cardId: string): [GameState, CardInstance | undefined] {
  const key = keyOf(playerId); const card = game[key].hand.find((c) => c.instanceId === cardId);
  if (!card) return [game, undefined];
  return [{ ...game, [key]: { ...game[key], hand: game[key].hand.filter((c) => c.instanceId !== cardId) } }, card];
}

function discardCardInstance(game: GameState, card: CardInstance): GameState {
  return { ...game, discardPile: [...game.discardPile, card] };
}

function resolveImmediateDraw(game: GameState, playerId: PlayerId, card: CardInstance): GameState {
  if (card.type !== 'SABOTAGE') return game;
  let next: GameState; let removed: CardInstance | undefined;
  [next, removed] = removeFromHand(game, playerId, card.instanceId);
  if (!removed) return game;
  next = discardCardInstance(next, removed);
  if (card.faction === playerOf(next, playerId).faction) {
    const target = other(playerId); const targetKey = keyOf(target);
    next = { ...next, [targetKey]: { ...next[targetKey], skipTurns: next[targetKey].skipTurns + 1 } };
    return appendLog(next, `${card.faction} SABOTAGE makes the opponent skip their next turn.`, `${card.faction} SABOTAGE obliga al rival a perder su próximo turno.`);
  }
  const key = keyOf(playerId);
  next = { ...next, [key]: { ...next[key], skipTurns: next[key].skipTurns + 1 } };
  next = appendLog(next, 'Enemy SABOTAGE backfired. The current turn ends and you will skip your next turn.', 'El SABOTAGE enemigo se volvió en tu contra. El turno termina y perderás tu próximo turno.');
  return endTurn(next, true);
}

export function beginTurn(game: GameState, playerId: PlayerId): GameState {
  if (game.winner) return game;
  const key = keyOf(playerId);
  let player = game[key];
  const units = player.units.map((unit) => ({ ...unit, protectedByTestudo: false }));
  player = { ...player, units, testudoActive: false, bushidoActive: false, knowsOpponentHand: false };
  let next: GameState = {
    ...game, [key]: player, currentPlayer: playerId, phase: 'DRAW', pendingAction: undefined, cardsPlayedThisTurn: 0,
    offensivePlayedThisTurn: false, specialPlayedThisTurn: false, attackLimitThisTurn: 1, attacksMadeThisTurn: 0,
  };
  if (player.skipTurns > 0) {
    next = { ...next, [key]: { ...player, skipTurns: player.skipTurns - 1 } };
    next = appendLog(next, playerId === 'HUMAN' ? 'You skip this turn.' : 'Computer skips this turn.', playerId === 'HUMAN' ? 'Pierdes este turno.' : 'El ordenador pierde este turno.');
    return endTurn(next, true);
  }
  next = drawCards(next, playerId, 1, true);
  if (next.currentPlayer !== playerId || next.phase === 'ENDED') return next;
  return { ...next, phase: 'ACTION' };
}

export function canEndTurn(game: GameState): boolean {
  return game.phase === 'ACTION' && game.currentPlayer === 'HUMAN' && game.cardsPlayedThisTurn > 0;
}

export function endTurn(game: GameState, forced = false): GameState {
  if (game.winner) return game;
  const current = game.currentPlayer; const key = keyOf(current); let player = game[key]; let next = game;
  if (!forced && game.cardsPlayedThisTurn < 1) return appendLog(game, 'Play or discard at least one card before ending the turn.', 'Juega o descarta al menos una carta antes de terminar el turno.');
  if (player.hand.length > 5) {
    const excess = player.hand.length - 5;
    const dropped = player.hand.slice(-excess);
    player = { ...player, hand: player.hand.slice(0, 5) };
    next = { ...next, [key]: player, discardPile: [...next.discardPile, ...dropped] };
    next = appendLog(next, `${excess} card${excess > 1 ? 's were' : ' was'} discarded to respect the hand limit.`, `Se ${excess > 1 ? 'descartaron' : 'descartó'} ${excess} carta${excess > 1 ? 's' : ''} por el límite de mano.`);
  }
  player = next[key];
  if (player.defenceDisabled && player.defenceDisabledTurns > 0) {
    const turns = player.defenceDisabledTurns - 1;
    player = { ...player, defenceDisabledTurns: turns, defenceDisabled: turns > 0 };
  }
  player = { ...player, survivalUsed: false };
  const nextId = other(current);
  next = { ...next, [key]: player, turnNumber: next.turnNumber + 1 };
  return beginTurn(next, nextId);
}

export function livingUnits(player: PlayerState): UnitCard[] { return player.units.filter((unit) => unit.state === 'ALIVE'); }
export function defeatedUnits(player: PlayerState): UnitCard[] { return player.units.filter((unit) => unit.state === 'DEFEATED' && !unit.isMummy); }

function updatePlayer(game: GameState, playerId: PlayerId, updater: (player: PlayerState) => PlayerState): GameState {
  const key = keyOf(playerId); return { ...game, [key]: updater(game[key]) };
}

function markCardPlayed(game: GameState, card: CardInstance): GameState {
  return {
    ...game, cardsPlayedThisTurn: game.cardsPlayedThisTurn + 1,
    offensivePlayedThisTurn: game.offensivePlayedThisTurn || card.offensive,
    specialPlayedThisTurn: game.specialPlayedThisTurn || card.type === 'SPECIAL',
  };
}

export function isCardPlayable(game: GameState, playerId: PlayerId, card: CardInstance): boolean {
  if (game.currentPlayer !== playerId || game.phase !== 'ACTION' || game.cardsPlayedThisTurn >= 2) return false;
  const dynamicOffensive = card.offensive || (card.type === 'SPECIAL' && card.name === 'MUMMY' && card.faction !== playerOf(game, playerId).faction);
  if (dynamicOffensive && game.offensivePlayedThisTurn) return false;
  if (card.type === 'SPECIAL' && game.specialPlayedThisTurn) return false;
  if (card.type === 'SPECIAL' && card.name === 'VALHALLA' && card.faction === playerOf(game, playerId).faction) return false;
  if (card.type === 'ATTACK' && game.attacksMadeThisTurn >= game.attackLimitThisTurn) return false;
  const player = playerOf(game, playerId);
  if (card.type === 'DOCTOR' && card.faction === player.faction && defeatedUnits(player).length === 0) return false;
  if (card.type === 'DEFENCE' && (player.defenceDisabled || !livingUnits(player).some((u) => !u.defence))) return false;
  return true;
}

export function selectCard(game: GameState, playerId: PlayerId, cardId: string): GameState {
  const card = playerOf(game, playerId).hand.find((item) => item.instanceId === cardId);
  if (!card || !isCardPlayable(game, playerId, card)) return game;
  if (card.type === 'ATTACK') return { ...game, pendingAction: { kind: 'ATTACK_TARGET', cardId } };
  if (card.type === 'DEFENCE') return { ...game, pendingAction: { kind: 'DEFENCE_TARGET', cardId } };
  if (card.type === 'DOCTOR' && card.faction === playerOf(game, playerId).faction) return { ...game, pendingAction: { kind: 'DOCTOR_TARGET', cardId } };
  if (card.type === 'SACK' && card.faction === playerOf(game, playerId).faction) return { ...game, pendingAction: { kind: 'SACK_CHOICE', cardId } };
  if (card.type === 'SPECIAL' && card.name === 'TESTUDO' && card.faction === playerOf(game, playerId).faction) return { ...game, pendingAction: { kind: 'TESTUDO_TARGETS', cardId, selected: [] } };
  if (card.type === 'SPECIAL' && card.name === 'BERSERKER' && card.faction === playerOf(game, playerId).faction) return { ...game, pendingAction: { kind: 'BERSERKER_TARGET', cardId, remaining: 2 } };
  if (card.type === 'SPECIAL' && card.name === 'SEPPUKU') {
    const own = card.faction === playerOf(game, playerId).faction;
    if (playerId === 'HUMAN' && own) {
      let next: GameState; let played: CardInstance | undefined;
      [next, played] = takeCardForPlay({ ...game, pendingAction: undefined }, playerId, cardId);
      if (!played) return game;
      next = discardCardInstance(next, played);
      return resolveSeppukuForAi(next, 'COMPUTER');
    }
    return { ...game, pendingAction: { kind: 'SEPPUKU_CHOICE', cardId, ownerEffect: own } };
  }
  if (card.type === 'SPECIAL' && card.name === 'VALHALLA' && card.faction !== playerOf(game, playerId).faction) return { ...game, pendingAction: { kind: 'VALHALLA_FOREIGN', cardId } };
  return resolvePlayedCard(game, playerId, cardId);
}

export function cancelPending(game: GameState): GameState { return { ...game, pendingAction: undefined }; }

function takeCardForPlay(game: GameState, playerId: PlayerId, cardId: string): [GameState, CardInstance | undefined] {
  let next: GameState; let card: CardInstance | undefined;
  [next, card] = removeFromHand(game, playerId, cardId);
  return card ? [markCardPlayed(next, card), card] : [game, undefined];
}

export function resolveTarget(game: GameState, unitId: string): GameState {
  const pending = game.pendingAction; if (!pending) return game;
  if (pending.kind === 'ATTACK_TARGET') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId);
    if (!card) return game;
    next = { ...next, attacksMadeThisTurn: next.attacksMadeThisTurn + 1 };
    const context: AttackContext = { attacker: game.currentPlayer, defender: other(game.currentPlayer), targetUnitId: unitId, attackCard: card, source: 'ATTACK', allowHandDefence: true, doubleHit: playerOf(next, other(game.currentPlayer)).mummyDoubleAttack };
    return initiateAttack(next, context);
  }
  if (pending.kind === 'DEFENCE_TARGET') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId);
    if (!card) return game;
    next = updatePlayer(next, game.currentPlayer, (player) => ({ ...player, units: player.units.map((unit) => unit.id === unitId ? { ...unit, defence: card } : unit) }));
    return appendLog(next, `${card.name} was placed on ${unitId.split('-').at(-1)}.`, `${card.name} fue colocada sobre ${unitId.split('-').at(-1)}.`);
  }
  if (pending.kind === 'DOCTOR_TARGET') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId);
    if (!card) return game;
    next = updatePlayer(next, game.currentPlayer, (player) => ({ ...player, units: player.units.map((unit) => unit.id === unitId ? { ...unit, state: 'ALIVE' } : unit) }));
    next = discardCardInstance(next, card);
    return appendLog(next, `${unitId.split('-').at(-1)} was healed.`, `${unitId.split('-').at(-1)} fue curado.`);
  }
  if (pending.kind === 'BERSERKER_TARGET') {
    let next = game;
    let card = playerOf(game, game.currentPlayer).hand.find((c) => c.instanceId === pending.cardId);
    if (pending.remaining === 2) {
      [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId);
      if (!card) return game;
      next = discardCardInstance(next, card);
    } else next = { ...game, pendingAction: undefined };
    const remaining = pending.remaining - 1;
    if (remaining > 0) next = { ...next, pendingAction: { kind: 'BERSERKER_TARGET', cardId: pending.cardId, remaining } };
    const context: AttackContext = { attacker: game.currentPlayer, defender: other(game.currentPlayer), targetUnitId: unitId, source: 'BERSERKER', allowHandDefence: true };
    return initiateAttack(next, context);
  }
  return game;
}

export function toggleTestudoTarget(game: GameState, unitId: string): GameState {
  const pending = game.pendingAction; if (!pending || pending.kind !== 'TESTUDO_TARGETS') return game;
  const selected = pending.selected.includes(unitId) ? pending.selected.filter((id) => id !== unitId) : pending.selected.length < 3 ? [...pending.selected, unitId] : pending.selected;
  return { ...game, pendingAction: { ...pending, selected } };
}

export function confirmTestudo(game: GameState): GameState {
  const pending = game.pendingAction; if (!pending || pending.kind !== 'TESTUDO_TARGETS' || !pending.selected.length) return game;
  let next: GameState; let card: CardInstance | undefined;
  [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId); if (!card) return game;
  next = updatePlayer(next, game.currentPlayer, (player) => ({ ...player, testudoActive: true, units: player.units.map((unit) => pending.selected.includes(unit.id) ? { ...unit, protectedByTestudo: true } : unit) }));
  next = discardCardInstance(next, card);
  return appendLog(next, 'TESTUDO protects selected Roman units until their next turn.', 'TESTUDO protege las unidades romanas elegidas hasta su próximo turno.');
}

export function resolveChoice(game: GameState, choice: string): GameState {
  const pending = game.pendingAction; if (!pending) return game;
  if (pending.kind === 'SACK_CHOICE') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId); if (!card) return game;
    next = discardCardInstance(next, card);
    if (choice === 'DRAW') return drawCards(appendLog(next, 'SACK draws from the common deck.', 'SACK roba del mazo común.'), game.currentPlayer, 1, false);
    return stealRandomCard(next, game.currentPlayer, other(game.currentPlayer));
  }
  if (pending.kind === 'SEPPUKU_CHOICE') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId); if (!card) return game;
    next = discardCardInstance(next, card);
    const affected = pending.ownerEffect ? other(game.currentPlayer) : game.currentPlayer;
    if (affected === 'COMPUTER') return resolveSeppukuForAi(next, affected);
    if (choice === 'DISCARD' && playerOf(next, affected).hand.length >= 2) {
      const dropped = playerOf(next, affected).hand.slice(0, 2);
      next = updatePlayer(next, affected, (p) => ({ ...p, hand: p.hand.slice(2) }));
      next = { ...next, discardPile: [...next.discardPile, ...dropped] };
      return appendLog(next, 'Two cards were discarded for SEPPUKU.', 'Se descartaron dos cartas por SEPPUKU.');
    }
    const unit = randomItem(livingUnits(playerOf(next, affected))); return unit ? defeatUnit(next, affected, unit.id, 'SEPPUKU') : next;
  }
  if (pending.kind === 'VALHALLA_FOREIGN') {
    let next: GameState; let card: CardInstance | undefined;
    [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, game.currentPlayer, pending.cardId); if (!card) return game;
    next = discardCardInstance(next, card);
    if (choice === 'DISCARD') {
      const player = playerOf(next, game.currentPlayer); const extra = randomItem(player.hand);
      if (extra) { next = updatePlayer(next, game.currentPlayer, (p) => ({ ...p, hand: p.hand.filter((c) => c.instanceId !== extra.instanceId) })); next = discardCardInstance(next, extra); }
      return appendLog(next, 'VALHALLA and an extra card were discarded.', 'Se descartaron VALHALLA y una carta adicional.');
    }
    const enemy = other(game.currentPlayer); const unit = randomItem(defeatedUnits(playerOf(next, enemy)));
    if (unit) next = updatePlayer(next, enemy, (p) => ({ ...p, units: p.units.map((u) => u.id === unit.id ? { ...u, state: 'ALIVE' } : u) }));
    return appendLog(next, unit ? `${unit.name} was healed by VALHALLA.` : 'VALHALLA had no defeated enemy to heal.', unit ? `${unit.name} fue curado por VALHALLA.` : 'VALHALLA no encontró un enemigo derrotado que curar.');
  }
  return game;
}

export function discardFromHand(game: GameState, playerId: PlayerId, cardId: string): GameState {
  if (game.currentPlayer !== playerId || game.phase !== 'ACTION' || game.cardsPlayedThisTurn >= 2) return game;
  let next: GameState; let card: CardInstance | undefined;
  [next, card] = removeFromHand(game, playerId, cardId); if (!card) return game;
  next = { ...next, cardsPlayedThisTurn: next.cardsPlayedThisTurn + 1 };
  next = discardCardInstance(next, card);
  next = appendLog(next, playerId === 'HUMAN' ? `You discarded ${card.name}.` : `Computer discarded ${card.name}.`, playerId === 'HUMAN' ? `Has descartado ${card.name}.` : `El ordenador descartó ${card.name}.`);
  if (card.type === 'SABOTAGE' && card.faction !== playerOf(next, playerId).faction) {
    const key = keyOf(playerId); next = { ...next, [key]: { ...next[key], skipTurns: next[key].skipTurns + 1 } };
    next = appendLog(next, 'Enemy SABOTAGE backfired. You will skip your next turn.', 'El SABOTAGE enemigo se volvió en tu contra. Perderás tu próximo turno.');
  }
  if (card.type === 'SPY' && card.faction !== playerOf(next, playerId).faction) next = revealHand(next, playerId, other(playerId));
  if (card.type === 'SACK' && card.faction !== playerOf(next, playerId).faction) next = stealRandomCard(next, other(playerId), playerId);
  return next;
}

function resolvePlayedCard(game: GameState, playerId: PlayerId, cardId: string): GameState {
  let next: GameState; let card: CardInstance | undefined;
  [next, card] = takeCardForPlay({ ...game, pendingAction: undefined }, playerId, cardId); if (!card) return game;
  next = discardCardInstance(next, card);
  const own = card.faction === playerOf(next, playerId).faction;
  if (card.type === 'SPECIAL' && card.name === 'MUMMY' && !own) next = { ...next, offensivePlayedThisTurn: true };
  if (card.type === 'DOCTOR' && !own) return drawCards(appendLog(next, 'A foreign DOCTOR was exchanged for one card.', 'Un DOCTOR extranjero se cambió por una carta.'), playerId, 1, false);
  if (card.type === 'SPY') return own ? revealHand(next, other(playerId), playerId) : revealHand(next, playerId, other(playerId));
  if (card.type === 'SABOTAGE') {
    const affected = own ? other(playerId) : playerId; const key = keyOf(affected);
    next = { ...next, [key]: { ...next[key], skipTurns: next[key].skipTurns + 1 } };
    return appendLog(next, own ? 'SABOTAGE makes the opponent skip their next turn.' : 'Enemy SABOTAGE backfired. You will skip your next turn.', own ? 'SABOTAGE obliga al rival a perder su próximo turno.' : 'El SABOTAGE enemigo se volvió en tu contra. Perderás tu próximo turno.');
  }
  if (card.type === 'SACK' && !own) return stealRandomCard(next, other(playerId), playerId);
  if (card.type === 'SPECIAL') return resolveSpecial(next, playerId, card, own);
  return next;
}

function revealHand(game: GameState, revealed: PlayerId, observer: PlayerId): GameState {
  let next = updatePlayer(game, observer, (p) => ({ ...p, knowsOpponentHand: true }));
  const names = playerOf(next, revealed).hand.map((c) => c.name).join(', ') || 'empty';
  return appendLog(next, `${revealed === 'HUMAN' ? 'Your' : 'Computer'} hand was revealed: ${names}.`, `${revealed === 'HUMAN' ? 'Tu' : 'La'} mano ${revealed === 'HUMAN' ? '' : 'del ordenador '}fue revelada: ${names}.`);
}

function stealRandomCard(game: GameState, thief: PlayerId, victim: PlayerId): GameState {
  const stolen = randomItem(playerOf(game, victim).hand);
  if (!stolen) return appendLog(game, 'SACK failed because the target hand was empty.', 'SACK falló porque la mano objetivo estaba vacía.');
  let next = updatePlayer(game, victim, (p) => ({ ...p, hand: p.hand.filter((c) => c.instanceId !== stolen.instanceId) }));
  next = updatePlayer(next, thief, (p) => ({ ...p, hand: [...p.hand, stolen] }));
  return appendLog(next, `${thief === 'HUMAN' ? 'You stole' : 'Computer stole'} one random card.`, `${thief === 'HUMAN' ? 'Has robado' : 'El ordenador robó'} una carta al azar.`);
}

function resolveSpecial(game: GameState, playerId: PlayerId, card: CardInstance, own: boolean): GameState {
  let next = game;
  if (card.name === 'TESTUDO' && !own) {
    const affected = playerId;
    next = updatePlayer(next, affected, (p) => ({ ...p, defenceDisabled: true, defenceDisabledTurns: 2 }));
    return appendLog(next, 'Foreign TESTUDO disables your active defences until the end of your next turn.', 'TESTUDO extranjero desactiva tus defensas hasta el final de tu próximo turno.');
  }
  if (card.name === 'GLADIATORES') {
    const currentPlayerWins = Math.random() >= 0.5;
    const causesDefeat = own ? currentPlayerWins : !currentPlayerWins;
    const affected = own ? other(playerId) : playerId;
    if (causesDefeat) { const target = randomItem(livingUnits(playerOf(next, affected))); if (target) next = defeatUnit(next, affected, target.id, 'GLADIATORES'); }
    return appendLog(next, causesDefeat ? 'The GLADIATORES duel caused a defeat.' : 'The GLADIATORES duel caused no defeat.', causesDefeat ? 'El duelo de GLADIATORES causó una derrota.' : 'El duelo de GLADIATORES no causó ninguna derrota.');
  }
  if (card.name === 'VALHALLA' && own) return appendLog(next, 'VALHALLA is a reaction card and was kept for a future defeat.', 'VALHALLA es una carta de reacción y se conservó para una futura derrota.');
  if (card.name === 'BERSERKER' && !own) {
    const attacker = other(playerId); const defender = playerId; const count = livingUnits(playerOf(next, defender)).length === 1 ? 2 : 1;
    for (let i = 0; i < count; i += 1) { const target = randomItem(livingUnits(playerOf(next, defender))); if (target) next = initiateAttack(next, { attacker, defender, targetUnitId: target.id, source: 'BERSERKER', allowHandDefence: false }); }
    return next;
  }
  if (card.name === 'BUSHIDO') {
    if (own) next = updatePlayer(next, playerId, (p) => ({ ...p, bushidoActive: true }));
    else next = updatePlayer(next, playerId, (p) => ({ ...p, defenceDisabled: true, defenceDisabledTurns: 2 }));
    return appendLog(next, own ? 'BUSHIDO allows normal defences against offensive specials until your next turn.' : 'Foreign BUSHIDO disables your defences until the end of your next turn.', own ? 'BUSHIDO permite defensas normales contra especiales ofensivas hasta tu próximo turno.' : 'BUSHIDO extranjero desactiva tus defensas hasta el final de tu próximo turno.');
  }
  if (card.name === 'RA') {
    const affected = own ? other(playerId) : playerId;
    const active = playerOf(next, affected).units.flatMap((u) => u.defence ? [u.defence] : []);
    next = updatePlayer(next, affected, (p) => ({ ...p, units: p.units.map((u) => ({ ...u, defence: undefined })), hand: own ? p.hand : p.hand.filter((c) => c.type !== 'DEFENCE') }));
    if (!own) { const handDefences = playerOf(game, affected).hand.filter((c) => c.type === 'DEFENCE'); next = { ...next, discardPile: [...next.discardPile, ...active, ...handDefences] }; }
    else next = { ...next, discardPile: [...next.discardPile, ...active] };
    return appendLog(next, 'RA destroyed active defences.', 'RA destruyó las defensas activas.');
  }
  if (card.name === 'MUMMY') {
    if (own) {
      const mummy: UnitCard = { id: `${playerOf(next, playerId).faction}-MUMMY-${uid()}`, name: 'MUMMY', faction: playerOf(next, playerId).faction, state: 'ALIVE', isMummy: true };
      next = updatePlayer(next, playerId, (p) => ({ ...p, units: [...p.units, mummy] }));
      return appendLog(next, 'MUMMY entered play as an extra living unit.', 'MUMMY entró en juego como unidad viva adicional.');
    }
    next = updatePlayer(next, playerId, (p) => ({ ...p, mummyDoubleAttack: true }));
    return appendLog(next, 'The next attack received will strike twice.', 'El próximo ataque recibido golpeará dos veces.');
  }
  return next;
}

export function initiateAttack(game: GameState, context: AttackContext): GameState {
  const defender = playerOf(game, context.defender); const target = defender.units.find((u) => u.id === context.targetUnitId && u.state === 'ALIVE');
  if (!target) return context.attackCard ? discardCardInstance(game, context.attackCard) : game;
  let next = appendLog(game, `${context.source} targets ${target.name}.`, `${context.source} apunta a ${target.name}.`);
  if (target.protectedByTestudo && context.source === 'ATTACK') {
    if (context.attackCard) next = discardCardInstance(next, context.attackCard);
    return appendLog(next, `${target.name} is protected by TESTUDO.`, `${target.name} está protegido por TESTUDO.`);
  }
  if (target.defence && !defender.defenceDisabled) {
    next = updatePlayer(next, context.defender, (p) => ({ ...p, units: p.units.map((u) => u.id === target.id ? { ...u, defence: undefined } : u) }));
    next = { ...next, discardPile: [...next.discardPile, target.defence, ...(context.attackCard ? [context.attackCard] : [])] };
    next = appendLog(next, `${target.name}'s active DEFENCE blocked the attack.`, `La DEFENCE activa de ${target.name} bloqueó el ataque.`);
    if (context.doubleHit) {
      next = updatePlayer(next, context.defender, (p) => ({ ...p, mummyDoubleAttack: false }));
      return initiateAttack(next, { ...context, attackCard: undefined, doubleHit: false });
    }
    return next;
  }
  if (livingUnits(defender).length === 1 && !defender.survivalUsed) {
    next = updatePlayer(next, context.defender, (p) => ({ ...p, survivalUsed: true }));
    const before = playerOf(next, context.defender).hand.length;
    next = drawCards(next, context.defender, 1, false);
    const drawn = playerOf(next, context.defender).hand.at(-1);
    if (drawn && playerOf(next, context.defender).hand.length > before && drawn.type === 'DEFENCE' && !defender.defenceDisabled) {
      let removed: CardInstance | undefined; [next, removed] = removeFromHand(next, context.defender, drawn.instanceId);
      if (removed) next = { ...next, discardPile: [...next.discardPile, removed, ...(context.attackCard ? [context.attackCard] : [])] };
      next = appendLog(next, 'Survival Instinct found DEFENCE and blocked the attack.', 'Instinto de Supervivencia encontró DEFENCE y bloqueó el ataque.');
      if (context.doubleHit) {
        next = updatePlayer(next, context.defender, (p) => ({ ...p, mummyDoubleAttack: false }));
        return initiateAttack(next, { ...context, attackCard: undefined, doubleHit: false });
      }
      return next;
    }
    next = appendLog(next, 'Survival Instinct did not find DEFENCE.', 'Instinto de Supervivencia no encontró DEFENCE.');
  }
  const handDefence = defender.hand.find((c) => c.type === 'DEFENCE');
  const valhalla = defender.hand.find((c) => c.type === 'SPECIAL' && c.name === 'VALHALLA' && c.faction === defender.faction);
  if (context.defender === 'HUMAN' && context.allowHandDefence && !defender.defenceDisabled && (handDefence || valhalla)) return { ...next, phase: 'REACTION', pendingAction: { kind: 'REACTION', context: { ...context, valhallaEligible: Boolean(valhalla) } } };
  if (context.defender === 'COMPUTER' && context.allowHandDefence && !defender.defenceDisabled && handDefence) {
    const shouldDefend = game.difficulty === 'SKILLED' || Math.random() > 0.35;
    if (shouldDefend) return resolveAiDefence(next, context, handDefence);
  }
  if (context.defender === 'COMPUTER' && valhalla && (game.difficulty === 'SKILLED' || Math.random() > 0.55)) return resolveAiValhalla(next, context, valhalla);
  next = defeatUnit(next, context.defender, target.id, context.source);
  if (context.attackCard) next = discardCardInstance(next, context.attackCard);
  if (context.doubleHit && !next.winner) {
    next = updatePlayer(next, context.defender, (p) => ({ ...p, mummyDoubleAttack: false }));
    const same = playerOf(next, context.defender).units.find((u) => u.id === target.id && u.state === 'ALIVE');
    if (same) next = initiateAttack(next, { ...context, attackCard: undefined, doubleHit: false });
  }
  return next;
}

function resolveAiDefence(game: GameState, context: AttackContext, defence: CardInstance): GameState {
  let next: GameState; let removed: CardInstance | undefined; [next, removed] = removeFromHand(game, context.defender, defence.instanceId);
  if (removed) next = { ...next, discardPile: [...next.discardPile, removed, ...(context.attackCard ? [context.attackCard] : [])] };
  next = appendLog(next, 'Computer played DEFENCE from hand. The attack was blocked.', 'El ordenador jugó DEFENCE desde la mano. El ataque fue bloqueado.');
  if (context.doubleHit) {
    next = updatePlayer(next, context.defender, (p) => ({ ...p, mummyDoubleAttack: false }));
    return initiateAttack(next, { ...context, attackCard: undefined, doubleHit: false });
  }
  return next;
}

function resolveAiValhalla(game: GameState, context: AttackContext, valhalla: CardInstance): GameState {
  let next: GameState; let removed: CardInstance | undefined; [next, removed] = removeFromHand(game, context.defender, valhalla.instanceId);
  if (removed) next = discardCardInstance(next, removed);
  next = defeatUnit(next, context.defender, context.targetUnitId, context.source, true);
  const retaliation = randomItem(livingUnits(playerOf(next, context.attacker)));
  if (retaliation) next = defeatUnit(next, context.attacker, retaliation.id, 'VALHALLA');
  if (context.attackCard) next = discardCardInstance(next, context.attackCard);
  next = appendLog(next, 'VALHALLA caused a retaliatory defeat.', 'VALHALLA causó una derrota de represalia.');
  if (!next.winner && livingUnits(playerOf(next, context.defender)).length === 0) next = resolveLastBreath(next, context.defender);
  return next;
}

export function resolveHumanReaction(game: GameState, choice: 'DEFENCE' | 'VALHALLA' | 'HIT'): GameState {
  const pending = game.pendingAction; if (!pending || pending.kind !== 'REACTION') return game;
  const context = pending.context; let next: GameState = { ...game, pendingAction: undefined, phase: 'ACTION' };
  const defender = playerOf(next, 'HUMAN');
  if (choice === 'DEFENCE') {
    const defence = defender.hand.find((c) => c.type === 'DEFENCE');
    if (defence) {
      let removed: CardInstance | undefined; [next, removed] = removeFromHand(next, 'HUMAN', defence.instanceId);
      if (removed) next = { ...next, discardPile: [...next.discardPile, removed, ...(context.attackCard ? [context.attackCard] : [])] };
      next = appendLog(next, 'You played DEFENCE from hand. The attack was blocked.', 'Has jugado DEFENCE desde la mano. El ataque fue bloqueado.');
      if (context.doubleHit) {
        next = updatePlayer(next, 'HUMAN', (p) => ({ ...p, mummyDoubleAttack: false }));
        return initiateAttack(next, { ...context, attackCard: undefined, doubleHit: false });
      }
      return next;
    }
  }
  if (choice === 'VALHALLA') {
    const valhalla = defender.hand.find((c) => c.type === 'SPECIAL' && c.name === 'VALHALLA' && c.faction === defender.faction);
    if (valhalla) return resolveAiValhalla(next, context, valhalla);
  }
  next = defeatUnit(next, 'HUMAN', context.targetUnitId, context.source);
  if (context.attackCard) next = discardCardInstance(next, context.attackCard);
  if (context.doubleHit) next = updatePlayer(next, 'HUMAN', (p) => ({ ...p, mummyDoubleAttack: false }));
  return next;
}

function defeatUnit(game: GameState, playerId: PlayerId, unitId: string, source: string, suppressLastBreath = false): GameState {
  const unit = playerOf(game, playerId).units.find((u) => u.id === unitId); if (!unit || unit.state === 'DEFEATED') return game;
  const activeDefence = unit.defence;
  let next = updatePlayer(game, playerId, (p) => ({ ...p, units: p.units.map((u) => u.id === unitId ? { ...u, state: 'DEFEATED', defence: undefined } : u) }));
  if (activeDefence) next = discardCardInstance(next, activeDefence);
  if (unit.isMummy) next = updatePlayer(next, playerId, (p) => ({ ...p, units: p.units.filter((u) => u.id !== unitId) }));
  next = appendLog(next, `${unit.name} was defeated by ${source}.`, `${unit.name} fue derrotado por ${source}.`);
  if (!suppressLastBreath && livingUnits(playerOf(next, playerId)).length === 0) return resolveLastBreath(next, playerId);
  return next;
}

function resolveLastBreath(game: GameState, playerId: PlayerId): GameState {
  let next = appendLog(game, 'Last Breath activated.', 'Último Aliento activado.');
  next = recycleIfNeeded(next);
  if (!next.deck.length) return declareWinner(next, other(playerId));
  const [card, ...deck] = next.deck; next = { ...next, deck };
  const player = playerOf(next, playerId);
  if (card.type === 'DOCTOR' && card.faction === player.faction && defeatedUnits(player).length) {
    const unit = defeatedUnits(player)[0];
    next = updatePlayer(next, playerId, (p) => ({ ...p, units: p.units.map((u) => u.id === unit.id ? { ...u, state: 'ALIVE' } : u) }));
    next = discardCardInstance(next, card);
    return appendLog(next, `Last Breath found DOCTOR. ${unit.name} returned.`, `Último Aliento encontró DOCTOR. ${unit.name} regresó.`);
  }
  if (card.type === 'SPECIAL' && card.name === 'MUMMY' && card.faction === player.faction) {
    const mummy: UnitCard = { id: `${player.faction}-MUMMY-${uid()}`, name: 'MUMMY', faction: player.faction, state: 'ALIVE', isMummy: true };
    next = updatePlayer(next, playerId, (p) => ({ ...p, units: [...p.units, mummy] }));
    next = discardCardInstance(next, card);
    return appendLog(next, 'Last Breath found MUMMY and prevented elimination.', 'Último Aliento encontró MUMMY y evitó la eliminación.');
  }
  next = discardCardInstance(next, card);
  return declareWinner(next, other(playerId));
}

function declareWinner(game: GameState, winner: PlayerId): GameState {
  return appendLog({ ...game, winner, phase: 'ENDED', currentPlayer: winner, pendingAction: undefined }, `${winner === 'HUMAN' ? 'You win' : 'Computer wins'} the match.`, `${winner === 'HUMAN' ? 'Has ganado' : 'El ordenador gana'} la partida.`);
}

function resolveSeppukuForAi(game: GameState, affected: PlayerId): GameState {
  const player = playerOf(game, affected);
  if (player.hand.length >= 2 && livingUnits(player).length <= 2) {
    const dropped = player.hand.slice(-2);
    let next = updatePlayer(game, affected, (p) => ({ ...p, hand: p.hand.slice(0, -2) }));
    next = { ...next, discardPile: [...next.discardPile, ...dropped] };
    return appendLog(next, 'Computer discarded two cards for SEPPUKU.', 'El ordenador descartó dos cartas por SEPPUKU.');
  }
  const unit = randomItem(livingUnits(player)); return unit ? defeatUnit(game, affected, unit.id, 'SEPPUKU') : game;
}

export function aiStep(game: GameState): GameState {
  if (game.currentPlayer !== 'COMPUTER' || game.phase !== 'ACTION' || game.pendingAction || game.winner) return game;
  if (game.cardsPlayedThisTurn >= 2) return endTurn(game);
  const ai = game.computer;
  const ownDoctor = ai.hand.find((c) => c.type === 'DOCTOR' && c.faction === ai.faction && defeatedUnits(ai).length);
  const spy = ai.hand.find((c) => c.type === 'SPY' && c.faction === ai.faction && !ai.knowsOpponentHand);
  const attack = ai.hand.find((c) => c.type === 'ATTACK' && isCardPlayable(game, 'COMPUTER', c));
  const sabotage = ai.hand.find((c) => c.type === 'SABOTAGE' && c.faction === ai.faction && isCardPlayable(game, 'COMPUTER', c));
  const sack = ai.hand.find((c) => c.type === 'SACK' && c.faction === ai.faction && isCardPlayable(game, 'COMPUTER', c));
  const defence = ai.hand.find((c) => c.type === 'DEFENCE' && isCardPlayable(game, 'COMPUTER', c));
  const specialCard = ai.hand.find((c) => c.type === 'SPECIAL' && !(c.name === 'VALHALLA' && c.faction === ai.faction) && isCardPlayable(game, 'COMPUTER', c));
  let card = ownDoctor || (game.difficulty === 'SKILLED' ? spy : undefined) || attack || sabotage || sack || defence || specialCard;
  if (!card) {
    const discard = ai.hand.find((c) => c.faction !== ai.faction) || ai.hand[0];
    return discard ? discardFromHand(game, 'COMPUTER', discard.instanceId) : endTurn(game, true);
  }
  if (card.type === 'DOCTOR') {
    const unit = defeatedUnits(ai)[0]; let next = selectCard(game, 'COMPUTER', card.instanceId); return unit ? resolveTarget(next, unit.id) : discardFromHand(game, 'COMPUTER', card.instanceId);
  }
  if (card.type === 'ATTACK') {
    const targets = livingUnits(game.human).sort((a, b) => Number(Boolean(a.defence || a.protectedByTestudo)) - Number(Boolean(b.defence || b.protectedByTestudo)));
    const target = targets[0]; let next = selectCard(game, 'COMPUTER', card.instanceId); return target ? resolveTarget(next, target.id) : endTurn(game, true);
  }
  if (card.type === 'DEFENCE') {
    const target = livingUnits(ai).find((u) => !u.defence); let next = selectCard(game, 'COMPUTER', card.instanceId); return target ? resolveTarget(next, target.id) : discardFromHand(game, 'COMPUTER', card.instanceId);
  }
  if (card.type === 'SACK') {
    let next = selectCard(game, 'COMPUTER', card.instanceId); return resolveChoice(next, game.human.hand.length ? 'STEAL' : 'DRAW');
  }
  if (card.type === 'SPECIAL' && card.name === 'TESTUDO' && card.faction === ai.faction) {
    let next = selectCard(game, 'COMPUTER', card.instanceId); const units = livingUnits(ai).slice(0, 3); units.forEach((u) => { next = toggleTestudoTarget(next, u.id); }); return confirmTestudo(next);
  }
  if (card.type === 'SPECIAL' && card.name === 'BERSERKER' && card.faction === ai.faction) {
    let next = selectCard(game, 'COMPUTER', card.instanceId); for (let i = 0; i < 2 && !next.winner; i += 1) { const target = randomItem(livingUnits(next.human)); if (target) next = resolveTarget(next, target.id); } return next;
  }
  if (card.type === 'SPECIAL' && card.name === 'SEPPUKU') {
    const next = selectCard(game, 'COMPUTER', card.instanceId);
    return card.faction === ai.faction ? next : resolveChoice(next, ai.hand.length >= 2 && livingUnits(ai).length <= 2 ? 'DISCARD' : 'UNIT');
  }
  if (card.type === 'SPECIAL' && card.name === 'VALHALLA' && card.faction !== ai.faction) {
    let next = selectCard(game, 'COMPUTER', card.instanceId); return resolveChoice(next, defeatedUnits(game.human).length ? 'HEAL' : 'DISCARD');
  }
  return selectCard(game, 'COMPUTER', card.instanceId);
}
