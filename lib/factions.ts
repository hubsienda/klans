import { Faction, LocalisedText } from './types';

export const FACTIONS: Faction[] = ['ROMAN', 'VIKING', 'EGYPT', 'SAMURAI'];

export const FACTION_UNITS: Record<Faction, string[]> = {
  ROMAN: ['AUGUSTUS', 'BRUTUS', 'FLACCUS', 'MAXIMUS', 'MAGNUS'],
  VIKING: ['BJORN', 'EINAR', 'IVAR', 'OLOF', 'RAGNAR'],
  EGYPT: ['ANHUR', 'KHEPRI', 'RAMSES', 'SETI', 'SOBEK'],
  SAMURAI: ['HANZO', 'KOJIRO', 'MUSASHI', 'RYU', 'TADAKATSU'],
};

export const FACTION_META: Record<Faction, { symbol: string; colour: string; soft: string; description: LocalisedText }> = {
  ROMAN: { symbol: '◆', colour: '#A33A32', soft: '#F8E8E2', description: { en: 'Discipline, protection and decisive duels.', es: 'Disciplina, protección y duelos decisivos.' } },
  VIKING: { symbol: 'ᛉ', colour: '#426A89', soft: '#E5EEF5', description: { en: 'Retaliation, pressure and fearless attacks.', es: 'Represalia, presión y ataques sin miedo.' } },
  EGYPT: { symbol: '☥', colour: '#188B88', soft: '#E2F4F1', description: { en: 'Control, stripped defences and an extra unit.', es: 'Control, defensas anuladas y una unidad adicional.' } },
  SAMURAI: { symbol: '✦', colour: '#5D4A7A', soft: '#EEE9F5', description: { en: 'Sacrifice, honour and tactical resistance.', es: 'Sacrificio, honor y resistencia táctica.' } },
};
