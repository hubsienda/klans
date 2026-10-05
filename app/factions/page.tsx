import type { Metadata } from 'next';
import { FactionsContent } from '@/components/FactionsContent';

export const metadata: Metadata = {
  title: 'Factions',
  description: 'Explore the ROMAN, VIKING, EGYPT and SAMURAI factions and all twenty KLANS units.',
};

export default function FactionsPage() {
  return <FactionsContent />;
}
