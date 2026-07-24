import { createMatchDeck, createUnits } from './cards';
import {
  ActionResult,
  CardInstance,
  CardType,
  Difficulty,
  GameLogEntry,
  GameState,
  LocalisedText,
  PendingAttack,
  PlayerId,
  PlayerState,
  StartGameOptions,
  Unit,
} from './types';
import { randomItem, shuffle, uid } from './utils';

const clone = (game: GameState): GameState => structuredClone(game);
export const opponentOf = (player: PlayerId): PlayerId => (player === 'HUMAN' ? 'COMPUTER' : 'HUMAN');
export const playerKey = (player: PlayerId): 'human' | 'computer' => (player === 'HUMAN' ? 'human' : 'computer');
export const getPlayer = (game: GameState, player: PlayerId): PlayerState => game[playerKey(player)];

const actorText = (player: PlayerId): LocalisedText =>
  player === 'HUMAN'
    ? { en: 'You', es: 'Tú' }
    : { en: 'Computer', es: 'El ordenador' };

const possessiveText = (player: PlayerId): LocalisedText =>
  player === 'HUMAN'
    ? { en: 'your', es: 'tu' }
    : { en: "computer's", es: 'del ordenador' };

const addLog = (game: GameState, text: LocalisedText): void => {
  const entry: GameLogEntry = { id: uid('log'), ...text };
  game.log.unshift(entry);
  game.lastAction = text;
  if (game.log.length > 120) game.log.length = 120;
};

const result = (state: GameState, ok: boolean, message?: LocalisedText): ActionResult => ({ state, ok, message });

const fail = (game: GameState, en: string, es: string): ActionResult =>
  result(game, false, { en, es });

const aliveUnits = (player: PlayerState): Unit[] => player.units.filter((unit) => unit.state === 'ALIVE');
const defeatedUnits = (player: PlayerState): Unit[] => player.units.filter((unit) => unit.state === 'DEFEATED');

export const livingUnitCount = (game: GameState, player: PlayerId): number => aliveUnits(getPlayer(game, player)).length;

const removeCard = (hand: CardInstance[], instanceId: string): CardInstance | undefined => {
  const index = hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) return undefined;
  return hand.splice(index, 1)[0];
};

const discardCardInstance = (game: GameState, card: CardInstance): void => {
  game.discardPile.push(card);
};

const refillDeck = (game: GameState): void => {
  if (game.deck.length > 0 || game.discardPile.length === 0) return;
  game.deck = shuffle(game.discardPile);
  game.discardPile = [];
  addLog(game, {
    en: 'The discard pile was shuffled into a new common deck.',
    es: 'La pila de descarte se barajó para formar un nuevo mazo común.',
  });
};

export const drawCard = (gameInput: GameState, player: PlayerId, logDraw = true): GameState => {
  const game = clone(gameInput);
  refillDeck(game);
  const card = game.deck.pop();
  if (!card) {
    addLog(game, {
      en: 'No card could be drawn because both deck and discard pile are empty.',
      es: 'No se pudo robar ninguna carta porque el mazo y el descarte están vacíos.',
    });
    return game;
  }
  getPlayer(game, player).hand.push(card);
  if (logDraw) {
    const actor = actorText(player);
    addLog(game, {
      en: `${actor.en} drew ${card.type}.`,
      es: player === 'HUMAN' ? `Has robado ${card.type}.` : `El ordenador robó ${card.type}.`,
    });
  }
  return game;
};

const drawOpeningHand = (gameInput: GameState, player: PlayerId, count: number): GameState => {
  let game = gameInput;
  for (let index = 0; index < count; index += 1) game = drawCard(game, player, false);
  return game;
};

const startTurn = (gameInput: GameState, requestedPlayer: PlayerId): GameState => {
  let game = clone(gameInput);
  let player = requestedPlayer;

  for (let guard = 0; guard < 4; guard += 1) {
    const state = getPlayer(game, player);
    game.currentPlayer = player;
    game.actionsUsedThisTurn = 0;
    game.phase = 'ACTION';
    game.pendingAttack = undefined;
    game.pendingPassive = undefined;
    game.turnNumber += 1;

    if (state.skipNextTurn) {
      state.skipNextTurn = false;
      const actor = actorText(player);
      addLog(game, {
        en: `${actor.en} skipped the turn because of SABOTAGE.`,
        es: player === 'HUMAN'
          ? 'Has perdido el turno por SABOTAGE.'
          : 'El ordenador perdió el turno por SABOTAGE.',
      });
      player = opponentOf(player);
      continue;
    }

    game = drawCard(game, player, true);
    const actor = actorText(player);
    addLog(game, {
      en: `${actor.en} began turn ${game.turnNumber}.`,
      es: player === 'HUMAN'
        ? `Has comenzado el turno ${game.turnNumber}.`
        : `El ordenador comenzó el turno ${game.turnNumber}.`,
    });
    return game;
  }

  return game;
};

export const startGame = (options: StartGameOptions): GameState => {
  if (options.humanFaction === options.computerFaction) {
    throw new Error('Human and computer factions must be different.');
  }

  let game: GameState = {
    human: {
      faction: options.humanFaction,
      hand: [],
      units: createUnits(options.humanFaction),
      skipNextTurn: false,
      passiveUsed: false,
    },
    computer: {
      faction: options.computerFaction,
      hand: [],
      units: createUnits(options.computerFaction),
      skipNextTurn: false,
      passiveUsed: false,
    },
    currentPlayer: 'HUMAN',
    turnNumber: 0,
    phase: 'ACTION',
    deck: createMatchDeck(options.humanFaction, options.computerFaction),
    discardPile: [],
    actionsUsedThisTurn: 0,
    revealComputerHand: false,
    computerKnowsHumanHand: false,
    difficulty: options.difficulty,
    log: [],
  };

  game = drawOpeningHand(game, 'HUMAN', 5);
  game = drawOpeningHand(game, 'COMPUTER', 5);
  addLog(game, {
    en: `${options.humanFaction} faces ${options.computerFaction}. Each side begins with five units and five cards.`,
    es: `${options.humanFaction} se enfrenta a ${options.computerFaction}. Cada bando comienza con cinco unidades y cinco cartas.`,
  });
  return startTurn(game, 'HUMAN');
};

export const canAct = (game: GameState, player: PlayerId): boolean =>
  !game.winner && game.phase === 'ACTION' && game.currentPlayer === player && game.actionsUsedThisTurn < 2;

export const validTargetsForCard = (game: GameState, player: PlayerId, card: CardInstance): Unit[] => {
  if (card.type === 'ATTACK' || card.type === 'AMBUSH') return aliveUnits(getPlayer(game, opponentOf(player)));
  if (card.type === 'DOCTOR' && card.faction === getPlayer(game, player).faction) return defeatedUnits(getPlayer(game, player));
  return [];
};

export const canPlayCard = (game: GameState, player: PlayerId, card: CardInstance): boolean => {
  if (!canAct(game, player)) return false;
  if (!getPlayer(game, player).hand.some((item) => item.instanceId === card.instanceId)) return false;
  if (card.type === 'DEFENCE') return false;
  if (card.type === 'DOCTOR') return validTargetsForCard(game, player, card).length > 0;
  if (card.type === 'ATTACK' || card.type === 'AMBUSH') return validTargetsForCard(game, player, card).length > 0;
  return true;
};

const checkVictoryMutable = (game: GameState): void => {
  const humanAlive = aliveUnits(game.human).length;
  const computerAlive = aliveUnits(game.computer).length;
  if (humanAlive > 0 && computerAlive > 0) return;

  game.winner = humanAlive > 0 ? 'HUMAN' : 'COMPUTER';
  game.phase = 'GAME_OVER';
  const winner = getPlayer(game, game.winner);
  addLog(game, {
    en: `${winner.faction} won the match. In Solo Playtest Edition, conquest equals victory.`,
    es: `${winner.faction} ganó la partida. En Solo Playtest Edition, la conquista equivale a la victoria.`,
  });
};

export const checkVictory = (gameInput: GameState): GameState => {
  const game = clone(gameInput);
  checkVictoryMutable(game);
  return game;
};

const discardRandomFromHand = (game: GameState, player: PlayerId, reason: LocalisedText): CardInstance | undefined => {
  const state = getPlayer(game, player);
  const card = randomItem(state.hand);
  if (!card) return undefined;
  removeCard(state.hand, card.instanceId);
  discardCardInstance(game, card);
  addLog(game, {
    en: `${actorText(player).en} discarded a random ${card.type} because of ${reason.en}.`,
    es: player === 'HUMAN'
      ? `Has descartado al azar ${card.type} por ${reason.es}.`
      : `El ordenador descartó al azar ${card.type} por ${reason.es}.`,
  });
  return card;
};

const triggerSamuraiHonour = (game: GameState, defeatedPlayer: PlayerId, attacker: PlayerId): void => {
  const defender = getPlayer(game, defeatedPlayer);
  if (defender.faction !== 'SAMURAI' || defender.passiveUsed) return;
  if (getPlayer(game, attacker).hand.length === 0) {
    addLog(game, {
      en: 'SAMURAI Honour could not trigger because the attacker had no cards.',
      es: 'Honor SAMURAI no pudo activarse porque el atacante no tenía cartas.',
    });
    return;
  }
  defender.passiveUsed = true;
  discardRandomFromHand(game, attacker, { en: 'SAMURAI Honour', es: 'Honor SAMURAI' });
  addLog(game, {
    en: 'SAMURAI Honour was used.',
    es: 'Se utilizó Honor SAMURAI.',
  });
};

const defeatUnitMutable = (game: GameState, attack: PendingAttack): boolean => {
  const defender = getPlayer(game, attack.defender);
  const unit = defender.units.find((item) => item.id === attack.targetUnitId && item.state === 'ALIVE');
  if (!unit) return false;
  unit.state = 'DEFEATED';
  addLog(game, {
    en: `${unit.name} was defeated by ${attack.source}.`,
    es: `${unit.name} fue derrotado por ${attack.source}.`,
  });
  triggerSamuraiHonour(game, attack.defender, attack.attacker);
  checkVictoryMutable(game);
  return true;
};

const maybeTriggerVikingFury = (game: GameState, attacker: PlayerId, source: 'ATTACK' | 'AMBUSH'): void => {
  if (game.winner || source !== 'ATTACK') return;
  const player = getPlayer(game, attacker);
  if (player.faction !== 'VIKING' || player.passiveUsed) return;

  if (attacker === 'HUMAN') {
    game.phase = 'AWAIT_PASSIVE';
    game.pendingPassive = { player: attacker, kind: 'VIKING_FURY' };
    return;
  }

  const shouldUse = player.hand.length < 5 || livingUnitCount(game, 'HUMAN') <= 2;
  if (!shouldUse) return;
  player.passiveUsed = true;
  const drawn = drawCard(game, attacker, false);
  Object.assign(game, drawn);
  addLog(game, {
    en: 'VIKING Fury drew one extra card.',
    es: 'Furia VIKING robó una carta adicional.',
  });
};

const resolveHitMutable = (game: GameState, attack: PendingAttack): void => {
  const defender = getPlayer(game, attack.defender);
  if (attack.source === 'ATTACK' && defender.faction === 'ROMAN' && !defender.passiveUsed) {
    if (attack.defender === 'HUMAN') {
      game.phase = 'AWAIT_PASSIVE';
      game.pendingAttack = attack;
      game.pendingPassive = { player: attack.defender, kind: 'ROMAN_DISCIPLINE', attack };
      return;
    }
    defender.passiveUsed = true;
    addLog(game, {
      en: 'ROMAN Discipline ignored the defeat.',
      es: 'Disciplina ROMAN ignoró la derrota.',
    });
    return;
  }

  const defeated = defeatUnitMutable(game, attack);
  if (defeated) maybeTriggerVikingFury(game, attack.attacker, attack.source);
};

const finishAttackAgainstComputer = (game: GameState, attack: PendingAttack): void => {
  const defender = getPlayer(game, 'COMPUTER');
  const defence = defender.hand.find((card) => card.type === 'DEFENCE');
  if (attack.source === 'ATTACK' && defence) {
    removeCard(defender.hand, defence.instanceId);
    discardCardInstance(game, defence);
    addLog(game, {
      en: 'Computer played DEFENCE. The attack was blocked.',
      es: 'El ordenador jugó DEFENCE. El ataque fue bloqueado.',
    });
    return;
  }
  resolveHitMutable(game, attack);
};

const useCardMutable = (game: GameState, player: PlayerId, card: CardInstance): void => {
  removeCard(getPlayer(game, player).hand, card.instanceId);
  discardCardInstance(game, card);
  game.actionsUsedThisTurn += 1;
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
  if (!canPlayCard(game, player, card)) {
    return fail(gameInput, 'That card cannot be played now.', 'Esa carta no se puede jugar ahora.');
  }

  const actor = actorText(player);

  if (card.type === 'ATTACK' || card.type === 'AMBUSH') {
    const target = validTargetsForCard(game, player, card).find((unit) => unit.id === targetUnitId);
    if (!target) return fail(gameInput, 'Select a valid living enemy unit.', 'Selecciona una unidad enemiga viva válida.');
    useCardMutable(game, player, card);
    addLog(game, {
      en: `${actor.en} played ${card.type} against ${target.name}.`,
      es: player === 'HUMAN'
        ? `Has jugado ${card.type} contra ${target.name}.`
        : `El ordenador jugó ${card.type} contra ${target.name}.`,
    });
    const attack: PendingAttack = {
      attacker: player,
      defender: opponentOf(player),
      targetUnitId: target.id,
      source: card.type,
    };

    if (attack.defender === 'HUMAN' && attack.source === 'ATTACK') {
      const defenceAvailable = getPlayer(game, 'HUMAN').hand.some((item) => item.type === 'DEFENCE');
      if (defenceAvailable) {
        game.phase = 'AWAIT_DEFENCE';
        game.pendingAttack = attack;
        addLog(game, {
          en: 'You may play DEFENCE or accept the attack.',
          es: 'Puedes jugar DEFENCE o aceptar el ataque.',
        });
        return result(game, true);
      }
    }

    if (attack.defender === 'COMPUTER') finishAttackAgainstComputer(game, attack);
    else resolveHitMutable(game, attack);
    return result(game, true);
  }

  if (card.type === 'DOCTOR') {
    const target = validTargetsForCard(game, player, card).find((unit) => unit.id === targetUnitId);
    if (!target) return fail(gameInput, 'Select a defeated unit of the Doctor’s faction.', 'Selecciona una unidad derrotada de la facción del Doctor.');
    useCardMutable(game, player, card);
    target.state = 'ALIVE';
    addLog(game, {
      en: `${actor.en} played DOCTOR and restored ${target.name}.`,
      es: player === 'HUMAN'
        ? `Has jugado DOCTOR y recuperado a ${target.name}.`
        : `El ordenador jugó DOCTOR y recuperó a ${target.name}.`,
    });

    if (state.faction === 'EGYPT' && !state.passiveUsed) {
      if (player === 'HUMAN') {
        game.phase = 'AWAIT_PASSIVE';
        game.pendingPassive = { player, kind: 'EGYPT_RESTORATION' };
      } else {
        state.passiveUsed = true;
        const drawn = drawCard(game, player, false);
        Object.assign(game, drawn);
        addLog(game, {
          en: 'EGYPT Restoration drew one extra card.',
          es: 'Restauración EGYPT robó una carta adicional.',
        });
      }
    }
    return result(game, true);
  }

  useCardMutable(game, player, card);

  if (card.type === 'SPY') {
    if (player === 'HUMAN') game.revealComputerHand = true;
    else game.computerKnowsHumanHand = true;
    addLog(game, {
      en: `${actor.en} played SPY and inspected ${possessiveText(opponentOf(player)).en} hand.`,
      es: player === 'HUMAN'
        ? 'Has jugado SPY y has inspeccionado la mano del ordenador.'
        : 'El ordenador jugó SPY e inspeccionó tu mano.',
    });
  }

  if (card.type === 'SACK') {
    const opponent = getPlayer(game, opponentOf(player));
    const stolen = randomItem(opponent.hand);
    if (stolen) {
      removeCard(opponent.hand, stolen.instanceId);
      state.hand.push(stolen);
      addLog(game, {
        en: `${actor.en} played SACK and stole a random ${stolen.type}.`,
        es: player === 'HUMAN'
          ? `Has jugado SACK y robado al azar ${stolen.type}.`
          : `El ordenador jugó SACK y robó al azar ${stolen.type}.`,
      });
    } else {
      addLog(game, {
        en: `${actor.en} played SACK, but the opponent had no cards.`,
        es: player === 'HUMAN'
          ? 'Has jugado SACK, pero el ordenador no tenía cartas.'
          : 'El ordenador jugó SACK, pero no tenías cartas.',
      });
    }
  }

  if (card.type === 'SABOTAGE') {
    getPlayer(game, opponentOf(player)).skipNextTurn = true;
    addLog(game, {
      en: `${actor.en} played SABOTAGE. The opponent will skip the next turn.`,
      es: player === 'HUMAN'
        ? 'Has jugado SABOTAGE. El ordenador perderá su próximo turno.'
        : 'El ordenador jugó SABOTAGE. Perderás tu próximo turno.',
    });
  }

  return result(game, true);
};

export const resolveDefence = (gameInput: GameState, useDefence: boolean): ActionResult => {
  const game = clone(gameInput);
  const attack = game.pendingAttack;
  if (game.phase !== 'AWAIT_DEFENCE' || !attack || attack.defender !== 'HUMAN') {
    return fail(gameInput, 'No attack is awaiting a defence.', 'No hay ningún ataque esperando una defensa.');
  }

  game.pendingAttack = undefined;
  game.phase = 'ACTION';
  if (useDefence) {
    const defence = game.human.hand.find((card) => card.type === 'DEFENCE');
    if (!defence) return fail(gameInput, 'No DEFENCE card is available.', 'No hay ninguna carta DEFENCE disponible.');
    removeCard(game.human.hand, defence.instanceId);
    discardCardInstance(game, defence);
    addLog(game, {
      en: 'You played DEFENCE. The attack was blocked.',
      es: 'Has jugado DEFENCE. El ataque fue bloqueado.',
    });
    return result(game, true);
  }

  resolveHitMutable(game, attack);
  return result(game, true);
};

export const resolvePassive = (gameInput: GameState, usePassive: boolean): ActionResult => {
  const game = clone(gameInput);
  const pending = game.pendingPassive;
  if (game.phase !== 'AWAIT_PASSIVE' || !pending || pending.player !== 'HUMAN') {
    return fail(gameInput, 'No passive ability is awaiting a decision.', 'No hay ninguna habilidad pasiva esperando una decisión.');
  }

  game.pendingPassive = undefined;
  game.phase = 'ACTION';

  if (pending.kind === 'ROMAN_DISCIPLINE') {
    const attack = pending.attack;
    game.pendingAttack = undefined;
    if (!attack) return fail(gameInput, 'The pending attack is missing.', 'Falta el ataque pendiente.');
    if (usePassive) {
      game.human.passiveUsed = true;
      addLog(game, {
        en: 'ROMAN Discipline prevented the unit from being defeated.',
        es: 'Disciplina ROMAN evitó que la unidad fuera derrotada.',
      });
      return result(game, true);
    }
    const defeated = defeatUnitMutable(game, attack);
    if (defeated) maybeTriggerVikingFury(game, attack.attacker, attack.source);
    return result(game, true);
  }

  if (!usePassive) {
    addLog(game, {
      en: 'You kept the passive ability available for later.',
      es: 'Has conservado la habilidad pasiva para más adelante.',
    });
    return result(game, true);
  }

  game.human.passiveUsed = true;
  const drawn = drawCard(game, 'HUMAN', false);
  Object.assign(game, drawn);
  addLog(game, pending.kind === 'VIKING_FURY'
    ? { en: 'VIKING Fury drew one extra card.', es: 'Furia VIKING robó una carta adicional.' }
    : { en: 'EGYPT Restoration drew one extra card.', es: 'Restauración EGYPT robó una carta adicional.' });
  return result(game, true);
};

const applyEnemyDiscardPenalty = (game: GameState, player: PlayerId, card: CardInstance): void => {
  const owner = getPlayer(game, player);
  if (card.faction === owner.faction) return;

  if (card.type === 'SPY') {
    if (player === 'HUMAN') game.computerKnowsHumanHand = true;
    else game.revealComputerHand = true;
    addLog(game, {
      en: `${actorText(player).en} discarded an enemy SPY and revealed the hand.`,
      es: player === 'HUMAN'
        ? 'Has descartado un SPY enemigo y revelado tu mano.'
        : 'El ordenador descartó un SPY enemigo y reveló su mano.',
    });
  }

  if (card.type === 'SACK') {
    const opponent = opponentOf(player);
    const remaining = getPlayer(game, player).hand;
    const stolen = randomItem(remaining);
    if (stolen) {
      removeCard(remaining, stolen.instanceId);
      getPlayer(game, opponent).hand.push(stolen);
      addLog(game, {
        en: `${actorText(opponent).en} stole a random ${stolen.type} because an enemy SACK was discarded.`,
        es: opponent === 'HUMAN'
          ? `Has robado al azar ${stolen.type} porque el ordenador descartó un SACK enemigo.`
          : `El ordenador robó al azar ${stolen.type} porque descartaste un SACK enemigo.`,
      });
    } else {
      addLog(game, {
        en: 'The enemy SACK penalty had no effect because the discarding hand was empty.',
        es: 'La penalización del SACK enemigo no tuvo efecto porque la mano quedó vacía.',
      });
    }
  }

  if (card.type === 'SABOTAGE') {
    owner.skipNextTurn = true;
    addLog(game, {
      en: `${actorText(player).en} discarded an enemy SABOTAGE and will skip the next turn.`,
      es: player === 'HUMAN'
        ? 'Has descartado un SABOTAGE enemigo y perderás tu próximo turno.'
        : 'El ordenador descartó un SABOTAGE enemigo y perderá su próximo turno.',
    });
  }
};

export const discardCard = (gameInput: GameState, player: PlayerId, cardInstanceId: string): ActionResult => {
  const game = clone(gameInput);
  if (!canAct(game, player)) return fail(gameInput, 'You cannot discard now.', 'No puedes descartar ahora.');
  const state = getPlayer(game, player);
  const card = removeCard(state.hand, cardInstanceId);
  if (!card) return fail(gameInput, 'That card is not in the hand.', 'Esa carta no está en la mano.');
  discardCardInstance(game, card);
  game.actionsUsedThisTurn += 1;
  addLog(game, {
    en: `${actorText(player).en} discarded ${card.type}.`,
    es: player === 'HUMAN' ? `Has descartado ${card.type}.` : `El ordenador descartó ${card.type}.`,
  });
  applyEnemyDiscardPenalty(game, player, card);
  return result(game, true);
};

export const endTurn = (gameInput: GameState, player: PlayerId): ActionResult => {
  const game = clone(gameInput);
  if (game.winner) return fail(gameInput, 'The match has already ended.', 'La partida ya ha terminado.');
  if (game.currentPlayer !== player || game.phase !== 'ACTION') {
    return fail(gameInput, 'The turn cannot end during another action.', 'El turno no puede terminar durante otra acción.');
  }
  if (game.actionsUsedThisTurn < 1) {
    return fail(gameInput, 'Play or discard at least one card before ending the turn.', 'Juega o descarta al menos una carta antes de terminar el turno.');
  }
  return result(startTurn(game, opponentOf(player)), true);
};

const playableCards = (game: GameState, player: PlayerId): CardInstance[] =>
  getPlayer(game, player).hand.filter((card) => canPlayCard(game, player, card));

const chooseTarget = (game: GameState, player: PlayerId, card: CardInstance, skilled: boolean): Unit | undefined => {
  const targets = validTargetsForCard(game, player, card);
  if (!skilled) return randomItem(targets);
  return targets[0];
};

const chooseComputerCard = (game: GameState): CardInstance | undefined => {
  const player = game.computer;
  const cards = playableCards(game, 'COMPUTER');
  const byType = (type: CardType) => cards.find((card) => card.type === type);
  const ownDoctor = cards.find((card) => card.type === 'DOCTOR' && card.faction === player.faction);

  if (game.difficulty === 'SIMPLE') {
    return ownDoctor
      ?? byType('ATTACK')
      ?? byType('AMBUSH')
      ?? byType('SABOTAGE')
      ?? byType('SACK')
      ?? byType('SPY');
  }

  const humanAlive = livingUnitCount(game, 'HUMAN');
  const computerAlive = livingUnitCount(game, 'COMPUTER');
  const humanHasDefence = game.computerKnowsHumanHand && game.human.hand.some((card) => card.type === 'DEFENCE');

  if (ownDoctor && (computerAlive <= 2 || computerAlive < humanAlive)) return ownDoctor;
  if (!game.computerKnowsHumanHand && byType('SPY')) return byType('SPY');
  if (humanHasDefence && byType('AMBUSH')) return byType('AMBUSH');
  if (humanAlive <= 2 && byType('ATTACK')) return byType('ATTACK');
  if (game.human.hand.length >= 4 && byType('SACK')) return byType('SACK');
  if (humanAlive > computerAlive && byType('SABOTAGE')) return byType('SABOTAGE');
  return byType('ATTACK')
    ?? byType('AMBUSH')
    ?? ownDoctor
    ?? byType('SABOTAGE')
    ?? byType('SACK')
    ?? byType('SPY');
};

export const aiStep = (gameInput: GameState, player: PlayerId = 'COMPUTER', difficulty?: Difficulty): GameState => {
  let game = clone(gameInput);
  if (game.winner || game.phase !== 'ACTION' || game.currentPlayer !== player) return game;
  if (difficulty) game.difficulty = difficulty;

  if (game.actionsUsedThisTurn >= 2) return endTurn(game, player).state;

  const card = player === 'COMPUTER'
    ? chooseComputerCard(game)
    : playableCards(game, player)[0];

  if (card) {
    const target = chooseTarget(game, player, card, game.difficulty === 'SKILLED');
    const played = playCard(game, player, card.instanceId, target?.id);
    game = played.state;
  } else {
    const state = getPlayer(game, player);
    const discard = game.difficulty === 'SKILLED'
      ? state.hand.find((item) => item.type === 'DOCTOR' && item.faction !== state.faction)
        ?? state.hand.find((item) => !['SPY', 'SACK', 'SABOTAGE'].includes(item.type) || item.faction === state.faction)
        ?? state.hand[0]
      : randomItem(state.hand);
    if (discard) game = discardCard(game, player, discard.instanceId).state;
  }

  if (game.winner || game.phase !== 'ACTION') return game;
  if (game.actionsUsedThisTurn >= 2) return endTurn(game, player).state;

  const stillUseful = playableCards(game, player).length > 0;
  if (!stillUseful || game.actionsUsedThisTurn >= 1 && Math.random() < 0.25) {
    return endTurn(game, player).state;
  }
  return game;
};

export const autoResolvePending = (gameInput: GameState): GameState => {
  let game = gameInput;
  if (game.phase === 'AWAIT_DEFENCE') {
    const useDefence = game.human.hand.some((card) => card.type === 'DEFENCE');
    game = resolveDefence(game, useDefence).state;
  }
  if (game.phase === 'AWAIT_PASSIVE') game = resolvePassive(game, true).state;
  return game;
};

export const closeComputerHandReveal = (gameInput: GameState): GameState => {
  const game = clone(gameInput);
  game.revealComputerHand = false;
  return game;
};
