import { createMatchDeck, createUnits } from './cards';
import type {
  ActionResult,
  CardInstance,
  Difficulty,
  Faction,
  GameLogEntry,
  GameState,
  LocalisedText,
  PlayerId,
  PlayerState,
  StartGameOptions,
  Unit,
} from './types';
import { randomItem, shuffle, uid } from './utils';

const clone = (game: GameState): GameState => structuredClone(game);
export const opponentOf = (player: PlayerId): PlayerId => (player === 'HUMAN' ? 'COMPUTER' : 'HUMAN');
const playerKey = (player: PlayerId): 'human' | 'computer' => (player === 'HUMAN' ? 'human' : 'computer');
export const getPlayer = (game: GameState, player: PlayerId): PlayerState => game[playerKey(player)];

const actorName = (player: PlayerId, language: 'en' | 'es'): string => {
  if (language === 'en') return player === 'HUMAN' ? 'You' : 'Computer';
  return player === 'HUMAN' ? 'Tú' : 'El ordenador';
};

const addLog = (game: GameState, text: LocalisedText): void => {
  const entry: GameLogEntry = { id: uid('log'), ...text };
  game.log.unshift(entry);
  game.lastAction = text;
  if (game.log.length > 150) game.log.length = 150;
};

const result = (state: GameState, ok: boolean, message?: LocalisedText): ActionResult => ({ state, ok, message });
const fail = (state: GameState, en: string, es: string): ActionResult => result(state, false, { en, es });
const livingUnits = (player: PlayerState): Unit[] => player.units.filter((unit) => unit.state === 'ALIVE');
const defeatedUnits = (player: PlayerState): Unit[] => player.units.filter((unit) => unit.state === 'DEFEATED');
export const livingUnitCount = (game: GameState, player: PlayerId): number => livingUnits(getPlayer(game, player)).length;

const removeCard = (hand: CardInstance[], instanceId: string): CardInstance | undefined => {
  const index = hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) return undefined;
  return hand.splice(index, 1)[0];
};

const snapshotHumanHand = (game: GameState): void => {
  game.computerKnownHumanHand = structuredClone(game.human.hand);
};

const clearComputerKnowledgeIfHumanHandChanged = (game: GameState): void => {
  game.computerKnownHumanHand = null;
};

const drawOneMutable = (game: GameState, player: PlayerId, logDraw = true): CardInstance | undefined => {
  if (game.deck.length === 0 && game.discardPile.length > 0) {
    game.deck = shuffle(game.discardPile);
    game.discardPile = [];
    addLog(game, {
      en: 'The discard pile was shuffled to continue the common deck.',
      es: 'La pila de descarte se barajó para continuar la baraja común.',
    });
  }
  const card = game.deck.pop();
  if (!card) {
    if (logDraw) {
      addLog(game, {
        en: `${actorName(player, 'en')} could not draw because no action cards are available.`,
        es: `${actorName(player, 'es')} no pudo robar porque no hay cartas de acción disponibles.`,
      });
    }
    return undefined;
  }
  getPlayer(game, player).hand.push(card);
  if (player === 'HUMAN') clearComputerKnowledgeIfHumanHandChanged(game);
  if (logDraw) {
    addLog(game, {
      en: player === 'HUMAN' ? `You drew ${card.type}.` : 'Computer drew one card.',
      es: player === 'HUMAN' ? `Has robado ${card.type}.` : 'El ordenador robó una carta.',
    });
  }
  return card;
};

export const drawCard = (gameInput: GameState, player: PlayerId): GameState => {
  const game = clone(gameInput);
  drawOneMutable(game, player, true);
  return game;
};

const drawOpeningHandMutable = (game: GameState, player: PlayerId): void => {
  for (let index = 0; index < 5; index += 1) drawOneMutable(game, player, false);
};

export const startGame = (
  options: StartGameOptions,
  rng: () => number = Math.random,
): GameState => {
  if (options.humanFaction === options.computerFaction) throw new Error('Human and computer factions must be different.');
  const startingPlayer: PlayerId = rng() < 0.5 ? 'HUMAN' : 'COMPUTER';
  const game: GameState = {
    human: { faction: options.humanFaction, hand: [], units: createUnits(options.humanFaction), skipNextTurn: false },
    computer: { faction: options.computerFaction, hand: [], units: createUnits(options.computerFaction), skipNextTurn: false },
    currentPlayer: startingPlayer,
    startingPlayer,
    turnNumber: 0,
    phase: 'READY',
    deck: createMatchDeck(options.humanFaction, options.computerFaction, rng),
    discardPile: [],
    revealComputerHand: false,
    computerKnownHumanHand: null,
    difficulty: options.difficulty,
    log: [],
  };
  drawOpeningHandMutable(game, 'HUMAN');
  drawOpeningHandMutable(game, 'COMPUTER');
  addLog(game, {
    en: `${options.humanFaction} faces ${options.computerFaction}. ${actorName(startingPlayer, 'en')} will start.`,
    es: `${options.humanFaction} se enfrenta a ${options.computerFaction}. ${actorName(startingPlayer, 'es')} comenzará.`,
  });
  return game;
};

export const beginTurn = (gameInput: GameState, requestedPlayer: PlayerId = gameInput.currentPlayer): GameState => {
  const game = clone(gameInput);
  let player = requestedPlayer;

  for (let guard = 0; guard < 4; guard += 1) {
    if (game.winner) return game;
    game.currentPlayer = player;
    game.pendingAttack = undefined;
    game.phase = 'ACTION';
    game.turnNumber += 1;

    const state = getPlayer(game, player);
    if (state.skipNextTurn) {
      state.skipNextTurn = false;
      addLog(game, {
        en: player === 'HUMAN'
          ? 'You completely lost this turn because of SABOTAGE. No card was drawn.'
          : 'Computer completely lost this turn because of SABOTAGE. No card was drawn.',
        es: player === 'HUMAN'
          ? 'Has perdido completamente este turno por SABOTAJE. No has robado ninguna carta.'
          : 'El ordenador perdió completamente este turno por SABOTAJE. No robó ninguna carta.',
      });
      player = opponentOf(player);
      continue;
    }

    drawOneMutable(game, player, true);
    addLog(game, {
      en: player === 'HUMAN' ? `Your turn ${game.turnNumber} began.` : `Computer turn ${game.turnNumber} began.`,
      es: player === 'HUMAN' ? `Ha comenzado tu turno ${game.turnNumber}.` : `Ha comenzado el turno ${game.turnNumber} del ordenador.`,
    });
    return game;
  }
  return game;
};

export const canAct = (game: GameState, player: PlayerId): boolean =>
  !game.winner && game.phase === 'ACTION' && game.currentPlayer === player;

export const canEndTurn = (game: GameState, player: PlayerId): boolean =>
  canAct(game, player) && getPlayer(game, player).hand.length <= 5;

export const validTargetsForCard = (game: GameState, player: PlayerId, card: CardInstance): Unit[] => {
  if (card.type === 'ATTACK' || card.type === 'AMBUSH') return livingUnits(getPlayer(game, opponentOf(player)));
  if (card.type === 'DOCTOR') return defeatedUnits(getPlayer(game, player));
  return [];
};

export const canPlayCard = (game: GameState, player: PlayerId, card: CardInstance): boolean => {
  if (!canAct(game, player)) return false;
  if (!getPlayer(game, player).hand.some((item) => item.instanceId === card.instanceId)) return false;
  if (card.type === 'DEFENCE') return false;
  if (card.type === 'ATTACK' || card.type === 'AMBUSH' || card.type === 'DOCTOR') {
    return validTargetsForCard(game, player, card).length > 0;
  }
  if (card.type === 'SACK') return getPlayer(game, opponentOf(player)).hand.length > 0;
  return true;
};

const finishVictoryMutable = (game: GameState, winner: PlayerId, conqueredFaction: Faction): void => {
  game.winner = winner;
  game.conqueredFaction = conqueredFaction;
  game.phase = 'GAME_OVER';
  game.pendingAttack = undefined;
  addLog(game, {
    en: `${conqueredFaction} was conquered. ${getPlayer(game, winner).faction} wins the solo match.`,
    es: `${conqueredFaction} fue conquistada. ${getPlayer(game, winner).faction} gana la partida individual.`,
  });
};

const defeatUnitMutable = (game: GameState, defender: PlayerId, attacker: PlayerId, unitId: string, source: 'ATTACK' | 'AMBUSH'): void => {
  const unit = getPlayer(game, defender).units.find((item) => item.id === unitId && item.state === 'ALIVE');
  if (!unit) return;
  unit.state = 'DEFEATED';
  addLog(game, {
    en: `${unit.name} was defeated by ${source}.`,
    es: `${unit.name} fue derrotado por ${source}.`,
  });
  if (livingUnits(getPlayer(game, defender)).length === 0) {
    finishVictoryMutable(game, attacker, getPlayer(game, defender).faction);
  }
};

const discardUsedCardMutable = (game: GameState, player: PlayerId, card: CardInstance): void => {
  removeCard(getPlayer(game, player).hand, card.instanceId);
  game.discardPile.push(card);
  if (player === 'HUMAN') clearComputerKnowledgeIfHumanHandChanged(game);
};

const computerShouldDefend = (game: GameState, targetUnitId: string): boolean => {
  const defence = game.computer.hand.some((card) => card.type === 'DEFENCE');
  if (!defence) return false;
  if (game.difficulty === 'SIMPLE') return true;
  const targetIsFinalUnit = livingUnitCount(game, 'COMPUTER') === 1;
  const target = game.computer.units.find((unit) => unit.id === targetUnitId);
  return targetIsFinalUnit || Boolean(target);
};

const transferRandomCardMutable = (game: GameState, from: PlayerId, to: PlayerId): CardInstance | undefined => {
  const source = getPlayer(game, from);
  const target = getPlayer(game, to);
  const chosen = randomItem(source.hand);
  if (!chosen) return undefined;
  removeCard(source.hand, chosen.instanceId);
  target.hand.push(chosen);
  if (from === 'HUMAN' || to === 'HUMAN') clearComputerKnowledgeIfHumanHandChanged(game);
  return chosen;
};

export const playCard = (
  gameInput: GameState,
  player: PlayerId,
  cardInstanceId: string,
  targetUnitId?: string,
): ActionResult => {
  const game = clone(gameInput);
  const state = getPlayer(game, player);
  const card = state.hand.find((item) => item.instanceId === cardInstanceId);
  if (!card) return fail(gameInput, 'That card is not in your hand.', 'Esa carta no está en tu mano.');
  if (!canPlayCard(game, player, card)) return fail(gameInput, 'That card cannot be played now.', 'Esa carta no se puede jugar ahora.');

  if (card.type === 'ATTACK' || card.type === 'AMBUSH') {
    const target = validTargetsForCard(game, player, card).find((unit) => unit.id === targetUnitId);
    if (!target) return fail(gameInput, 'Select a valid living enemy unit.', 'Selecciona una unidad enemiga viva válida.');
    discardUsedCardMutable(game, player, card);
    addLog(game, {
      en: player === 'HUMAN' ? `You played ${card.type} against ${target.name}.` : `Computer played ${card.type} against ${target.name}.`,
      es: player === 'HUMAN' ? `Has jugado ${card.type} contra ${target.name}.` : `El ordenador jugó ${card.type} contra ${target.name}.`,
    });

    const defender = opponentOf(player);
    if (card.type === 'AMBUSH') {
      defeatUnitMutable(game, defender, player, target.id, 'AMBUSH');
      return result(game, true);
    }

    if (defender === 'HUMAN') {
      const humanHasDefence = game.human.hand.some((item) => item.type === 'DEFENCE');
      if (humanHasDefence) {
        game.pendingAttack = { attacker: player, defender, targetUnitId: target.id, source: 'ATTACK' };
        game.phase = 'AWAIT_DEFENCE';
        return result(game, true);
      }
      defeatUnitMutable(game, defender, player, target.id, 'ATTACK');
      return result(game, true);
    }

    if (computerShouldDefend(game, target.id)) {
      const defence = game.computer.hand.find((item) => item.type === 'DEFENCE');
      if (defence) {
        discardUsedCardMutable(game, 'COMPUTER', defence);
        addLog(game, {
          en: 'Computer played DEFENCE. The ATTACK was completely blocked.',
          es: 'El ordenador jugó DEFENCE. El ATTACK fue bloqueado completamente.',
        });
        return result(game, true);
      }
    }
    defeatUnitMutable(game, defender, player, target.id, 'ATTACK');
    return result(game, true);
  }

  if (card.type === 'DOCTOR') {
    const target = validTargetsForCard(game, player, card).find((unit) => unit.id === targetUnitId);
    if (!target) return fail(gameInput, 'Select a defeated unit you control.', 'Selecciona una unidad derrotada bajo tu control.');
    discardUsedCardMutable(game, player, card);
    target.state = 'ALIVE';
    addLog(game, {
      en: player === 'HUMAN' ? `You played DOCTOR. ${target.name} returned to play.` : `Computer played DOCTOR. ${target.name} returned to play.`,
      es: player === 'HUMAN' ? `Has jugado DOCTOR. ${target.name} volvió al campo de batalla.` : `El ordenador jugó DOCTOR. ${target.name} volvió al campo de batalla.`,
    });
    return result(game, true);
  }

  if (card.type === 'SPY') {
    discardUsedCardMutable(game, player, card);
    if (player === 'HUMAN') {
      game.revealComputerHand = true;
      game.revealReason = 'SPY';
      addLog(game, { en: 'You played SPY and may inspect the computer hand.', es: 'Has jugado SPY y puedes mirar la mano del ordenador.' });
    } else {
      snapshotHumanHand(game);
      addLog(game, { en: 'Computer played SPY and inspected your hand.', es: 'El ordenador jugó SPY y miró tu mano.' });
    }
    return result(game, true);
  }

  if (card.type === 'SACK') {
    discardUsedCardMutable(game, player, card);
    const stolen = transferRandomCardMutable(game, opponentOf(player), player);
    if (stolen) {
      addLog(game, {
        en: player === 'HUMAN' ? `You played SACK and took ${stolen.type}.` : `Computer played SACK and took your ${stolen.type}.`,
        es: player === 'HUMAN' ? `Has jugado SACK y has tomado ${stolen.type}.` : `El ordenador jugó SACK y tomó tu ${stolen.type}.`,
      });
    }
    return result(game, true);
  }

  if (card.type === 'SABOTAGE') {
    discardUsedCardMutable(game, player, card);
    getPlayer(game, opponentOf(player)).skipNextTurn = true;
    addLog(game, {
      en: player === 'HUMAN' ? 'You played SABOTAGE. Computer will completely lose its next turn.' : 'Computer played SABOTAGE. You will completely lose your next turn.',
      es: player === 'HUMAN' ? 'Has jugado SABOTAGE. El ordenador perderá completamente su próximo turno.' : 'El ordenador jugó SABOTAGE. Perderás completamente tu próximo turno.',
    });
    return result(game, true);
  }

  return fail(gameInput, 'DEFENCE is reactive only.', 'DEFENCE solo puede jugarse de forma reactiva.');
};

export const resolveDefence = (gameInput: GameState, useDefence: boolean): ActionResult => {
  const game = clone(gameInput);
  const attack = game.pendingAttack;
  if (!attack || game.phase !== 'AWAIT_DEFENCE' || attack.defender !== 'HUMAN') {
    return fail(gameInput, 'There is no attack waiting for a defence decision.', 'No hay ningún ataque esperando una decisión de defensa.');
  }
  game.pendingAttack = undefined;
  game.phase = 'ACTION';

  if (useDefence) {
    const defence = game.human.hand.find((card) => card.type === 'DEFENCE');
    if (!defence) return fail(gameInput, 'No DEFENCE card is available.', 'No hay ninguna carta DEFENCE disponible.');
    discardUsedCardMutable(game, 'HUMAN', defence);
    addLog(game, { en: 'You played DEFENCE. The ATTACK was completely blocked.', es: 'Has jugado DEFENCE. El ATTACK fue bloqueado completamente.' });
  } else {
    defeatUnitMutable(game, attack.defender, attack.attacker, attack.targetUnitId, 'ATTACK');
  }

  if (!game.winner && attack.attacker === 'COMPUTER' && game.computer.hand.length <= 5) {
    return endTurn(game, 'COMPUTER');
  }
  return result(game, true);
};

export const discardCard = (gameInput: GameState, player: PlayerId, cardInstanceId: string): ActionResult => {
  const game = clone(gameInput);
  if (!canAct(game, player)) return fail(gameInput, 'You cannot discard now.', 'No puedes descartar ahora.');
  const state = getPlayer(game, player);
  const card = state.hand.find((item) => item.instanceId === cardInstanceId);
  if (!card) return fail(gameInput, 'That card is not in your hand.', 'Esa carta no está en tu mano.');

  removeCard(state.hand, card.instanceId);
  game.discardPile.push(card);
  if (player === 'HUMAN') clearComputerKnowledgeIfHumanHandChanged(game);
  addLog(game, {
    en: player === 'HUMAN' ? `You discarded ${card.type}.` : `Computer discarded ${card.type}.`,
    es: player === 'HUMAN' ? `Has descartado ${card.type}.` : `El ordenador descartó ${card.type}.`,
  });

  const enemyFaction = getPlayer(game, opponentOf(player)).faction;
  const isEnemy = card.faction === enemyFaction;
  if (!isEnemy) return result(game, true);

  if (card.type === 'SPY') {
    if (player === 'HUMAN') {
      snapshotHumanHand(game);
      addLog(game, { en: 'Enemy SPY discard penalty: Computer saw your entire hand.', es: 'Penalización por descartar ESPÍA enemigo: el ordenador vio toda tu mano.' });
    } else {
      game.revealComputerHand = true;
      game.revealReason = 'ENEMY_SPY_DISCARD';
      addLog(game, { en: 'Enemy SPY discard penalty: Computer must reveal its entire hand to you.', es: 'Penalización por descartar ESPÍA enemigo: el ordenador debe mostrarte toda su mano.' });
    }
  } else if (card.type === 'SACK') {
    const transferred = transferRandomCardMutable(game, player, opponentOf(player));
    if (transferred) {
      addLog(game, {
        en: player === 'HUMAN' ? `Enemy SACK discard penalty: Computer took your ${transferred.type}.` : `Enemy SACK discard penalty: You received ${transferred.type} from the computer.`,
        es: player === 'HUMAN' ? `Penalización por descartar SAQUEO enemigo: el ordenador tomó tu ${transferred.type}.` : `Penalización por descartar SAQUEO enemigo: recibiste ${transferred.type} del ordenador.`,
      });
    }
  } else if (card.type === 'SABOTAGE') {
    state.skipNextTurn = true;
    addLog(game, {
      en: player === 'HUMAN' ? 'Enemy SABOTAGE discard penalty: You will completely lose your next turn.' : 'Enemy SABOTAGE discard penalty: Computer will completely lose its next turn.',
      es: player === 'HUMAN' ? 'Penalización por descartar SABOTAJE enemigo: perderás completamente tu próximo turno.' : 'Penalización por descartar SABOTAJE enemigo: el ordenador perderá completamente su próximo turno.',
    });
  }

  return result(game, true);
};

export const endTurn = (gameInput: GameState, player: PlayerId): ActionResult => {
  if (!canAct(gameInput, player)) return fail(gameInput, 'You cannot end the turn now.', 'No puedes terminar el turno ahora.');
  if (getPlayer(gameInput, player).hand.length > 5) {
    return fail(gameInput, 'Reduce your hand to five cards or fewer before ending the turn.', 'Reduce tu mano a cinco cartas o menos antes de terminar el turno.');
  }
  const game = beginTurn(gameInput, opponentOf(player));
  return result(game, true);
};

export const closeComputerHandReveal = (gameInput: GameState): GameState => {
  const game = clone(gameInput);
  game.revealComputerHand = false;
  game.revealReason = undefined;
  if (game.currentPlayer === 'COMPUTER' && game.phase === 'ACTION' && game.computer.hand.length <= 5) {
    return endTurn(game, 'COMPUTER').state;
  }
  return game;
};

const chooseTarget = (game: GameState, player: PlayerId, card: CardInstance, difficulty: Difficulty): Unit | undefined => {
  const targets = validTargetsForCard(game, player, card);
  if (targets.length === 0) return undefined;
  if (card.type === 'DOCTOR') return targets[0];
  if (difficulty === 'SKILLED') return targets[0];
  return randomItem(targets);
};

const priorityScore = (game: GameState, card: CardInstance, difficulty: Difficulty): number => {
  const humanLiving = livingUnitCount(game, 'HUMAN');
  const computerLiving = livingUnitCount(game, 'COMPUTER');
  if (difficulty === 'SIMPLE') {
    const scores: Record<CardInstance['type'], number> = { DOCTOR: 70, ATTACK: 65, AMBUSH: 60, SABOTAGE: 50, SACK: 40, SPY: 30, DEFENCE: -100 };
    return scores[card.type];
  }
  if (humanLiving === 1 && card.type === 'AMBUSH') return 120;
  if (humanLiving === 1 && card.type === 'ATTACK') return 115;
  if (game.computerKnownHumanHand?.some((known) => known.type === 'DEFENCE') && card.type === 'AMBUSH') return 110;
  if (computerLiving <= 2 && card.type === 'DOCTOR') return 105;
  const scores: Record<CardInstance['type'], number> = { SABOTAGE: 90, AMBUSH: 86, ATTACK: 82, DOCTOR: 78, SACK: 70, SPY: 62, DEFENCE: -100 };
  return scores[card.type];
};

const chooseComputerPlay = (game: GameState): CardInstance | undefined => {
  const playable = game.computer.hand.filter((card) => canPlayCard(game, 'COMPUTER', card));
  return playable.sort((a, b) => priorityScore(game, b, game.difficulty) - priorityScore(game, a, game.difficulty))[0];
};

const chooseComputerDiscard = (game: GameState): CardInstance | undefined => {
  const enemyFaction = game.human.faction;
  const dangerous = (card: CardInstance): boolean => card.faction === enemyFaction && ['SPY', 'SACK', 'SABOTAGE'].includes(card.type);
  const ownOrSafe = game.computer.hand.filter((card) => !dangerous(card));
  const pool = ownOrSafe.length > 0 ? ownOrSafe : game.computer.hand;
  return pool.sort((a, b) => priorityScore(game, a, game.difficulty) - priorityScore(game, b, game.difficulty))[0];
};

export const aiStep = (gameInput: GameState): GameState => {
  if (gameInput.winner || gameInput.phase !== 'ACTION' || gameInput.currentPlayer !== 'COMPUTER' || gameInput.revealComputerHand) return gameInput;
  const mustReduce = gameInput.computer.hand.length > 5;
  const card = chooseComputerPlay(gameInput);

  if (card) {
    const target = chooseTarget(gameInput, 'COMPUTER', card, gameInput.difficulty);
    const action = playCard(gameInput, 'COMPUTER', card.instanceId, target?.id);
    if (!action.ok) return gameInput;
    const next = action.state;
    if (next.winner || next.phase !== 'ACTION' || next.revealComputerHand) return next;
    if (next.computer.hand.length <= 5) return endTurn(next, 'COMPUTER').state;
    return next;
  }

  if (mustReduce) {
    const discard = chooseComputerDiscard(gameInput);
    if (!discard) return gameInput;
    const action = discardCard(gameInput, 'COMPUTER', discard.instanceId);
    if (!action.ok) return gameInput;
    if (action.state.revealComputerHand) return action.state;
    if (action.state.computer.hand.length <= 5) return endTurn(action.state, 'COMPUTER').state;
    return action.state;
  }

  return endTurn(gameInput, 'COMPUTER').state;
};

export const autoStepForTests = (gameInput: GameState, player: PlayerId): GameState => {
  if (gameInput.winner || gameInput.phase !== 'ACTION' || gameInput.currentPlayer !== player) return gameInput;
  if (player === 'COMPUTER') return aiStep(gameInput);

  const state = getPlayer(gameInput, 'HUMAN');
  const playable = state.hand
    .filter((card) => canPlayCard(gameInput, 'HUMAN', card))
    .sort((a, b) => priorityScore(gameInput, b, 'SKILLED') - priorityScore(gameInput, a, 'SKILLED'));
  const card = playable[0];
  if (card) {
    const target = chooseTarget(gameInput, 'HUMAN', card, 'SKILLED');
    const action = playCard(gameInput, 'HUMAN', card.instanceId, target?.id);
    let next = action.state;
    if (next.phase === 'AWAIT_DEFENCE') next = resolveDefence(next, Boolean(next.human.hand.find((item) => item.type === 'DEFENCE'))).state;
    if (next.winner || next.phase !== 'ACTION' || next.revealComputerHand) {
      if (next.revealComputerHand) next = closeComputerHandReveal(next);
      return next;
    }
    if (next.human.hand.length <= 5) return endTurn(next, 'HUMAN').state;
    return next;
  }
  if (state.hand.length > 5) {
    const action = discardCard(gameInput, 'HUMAN', state.hand[0].instanceId);
    if (action.state.revealComputerHand) return closeComputerHandReveal(action.state);
    return action.state.human.hand.length <= 5 ? endTurn(action.state, 'HUMAN').state : action.state;
  }
  return endTurn(gameInput, 'HUMAN').state;
};
