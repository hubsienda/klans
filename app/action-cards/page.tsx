import { ActionCardsContent } from '@/components/ActionCardsContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Action Cards',
  description: 'Explore the seven official KLANZ action-card types: ATTACK, DEFENCE, DOCTOR, SPY, SACK, SABOTAGE and AMBUSH.',
  path: '/action-cards',
});

export default function ActionCardsPage() {
  return <ActionCardsContent />;
}
