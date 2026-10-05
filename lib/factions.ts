import type { Faction } from './types';

export const FACTIONS: Faction[] = ['ROMAN', 'VIKING', 'EGYPT', 'SAMURAI'];

export const FACTION_UNITS: Record<Faction, string[]> = {
  ROMAN: ['AUGUSTUS', 'BRUTUS', 'FLACCUS', 'MAGNUS', 'MAXIMUS'],
  VIKING: ['BJORN', 'EINAR', 'IVAR', 'OLOF', 'RAGNAR'],
  EGYPT: ['ANHUR', 'KHEPRI', 'RAMSES', 'SETI', 'SOBEK'],
  SAMURAI: ['HANZO', 'KOJIRO', 'MUSASHI', 'RYU', 'TADAKATSU'],
};

export const FACTION_META: Record<Faction, { colour: string; symbol: string }> = {
  ROMAN: { colour: '#A53A32', symbol: '◆' },
  VIKING: { colour: '#3D78A2', symbol: '✦' },
  EGYPT: { colour: '#3C9B9D', symbol: '◇' },
  SAMURAI: { colour: '#735A91', symbol: '✧' },
};

export const FACTION_IMAGES: Record<Faction, Array<{ name: string; src: string }>> = {
  ROMAN: FACTION_UNITS.ROMAN.map((name) => ({ name, src: `/factions/roman/${name.toLowerCase()}.jpg` })),
  VIKING: FACTION_UNITS.VIKING.map((name) => ({ name, src: `/factions/viking/${name.toLowerCase()}.jpg` })),
  EGYPT: FACTION_UNITS.EGYPT.map((name) => ({ name, src: `/factions/egypt/${name.toLowerCase()}.jpg` })),
  SAMURAI: FACTION_UNITS.SAMURAI.map((name) => ({ name, src: `/factions/samurai/${name.toLowerCase()}.jpg` })),
};
