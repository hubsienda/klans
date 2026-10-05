import type { Metadata } from 'next';
import { RulesContent } from '@/components/RulesContent';

export const metadata: Metadata = {
  title: 'Rules',
  description: 'Read the complete KLANS tabletop rules: setup, turns, action cards, conquest, enemy cards, diplomacy, elimination and victory.',
};

export default function RulesPage() {
  return <RulesContent />;
}
