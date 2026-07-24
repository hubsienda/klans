import { Faction, LocalisedText } from './types';

export const FACTIONS: Faction[] = ['ROMAN', 'VIKING', 'EGYPT', 'SAMURAI'];

export const FACTION_UNITS: Record<Faction, string[]> = {
  ROMAN: ['AUGUSTUS', 'BRUTUS', 'FLACCUS', 'MAXIMUS', 'MAGNUS'],
  VIKING: ['BJORN', 'EINAR', 'IVAR', 'OLOF', 'RAGNAR'],
  EGYPT: ['ANHUR', 'KHEPRI', 'RAMSES', 'SETI', 'SOBEK'],
  SAMURAI: ['HANZO', 'KOJIRO', 'MUSASHI', 'RYU', 'TADAKATSU'],
};

export const FACTION_META: Record<
  Faction,
  { colour: string; symbol: string; passiveName: LocalisedText; passiveText: LocalisedText }
> = {
  ROMAN: {
    colour: '#B53A32',
    symbol: '◆',
    passiveName: { en: 'Discipline', es: 'Disciplina' },
    passiveText: {
      en: 'Once per match, ignore a defeat caused by ATTACK.',
      es: 'Una vez por partida, ignora una derrota causada por ATTACK.',
    },
  },
  VIKING: {
    colour: '#3F6E91',
    symbol: 'ᛉ',
    passiveName: { en: 'Fury', es: 'Furia' },
    passiveText: {
      en: 'Once per match, draw a card after ATTACK defeats an enemy unit.',
      es: 'Una vez por partida, roba una carta después de que ATTACK derrote una unidad enemiga.',
    },
  },
  EGYPT: {
    colour: '#168F91',
    symbol: '☥',
    passiveName: { en: 'Restoration', es: 'Restauración' },
    passiveText: {
      en: 'Once per match, draw a card after DOCTOR restores a unit.',
      es: 'Una vez por partida, roba una carta después de que DOCTOR recupere una unidad.',
    },
  },
  SAMURAI: {
    colour: '#63527D',
    symbol: '◈',
    passiveName: { en: 'Honour', es: 'Honor' },
    passiveText: {
      en: 'Once per match, when a unit is defeated, the attacker discards a random card.',
      es: 'Una vez por partida, cuando una unidad es derrotada, el atacante descarta una carta al azar.',
    },
  },
};
