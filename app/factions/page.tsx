import { FactionsContent } from '@/components/FactionsContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Factions',
  description: 'Explore the ROMAN, VIKING, EGYPT and SAMURAI factions and all twenty KLANZ units.',
  path: '/factions',
});

export default function FactionsPage() {
  return <FactionsContent />;
}
