import type { Metadata } from 'next';
import { ActionCardsContent } from '@/components/ActionCardsContent';

export const metadata: Metadata = {
  title: 'Action Cards',
  description: 'Explore the seven official KLANS action-card types: ATTACK, DEFENCE, DOCTOR, SPY, SACK, SABOTAGE and AMBUSH.',
};

export default function ActionCardsPage() {
  return <ActionCardsContent />;
}
