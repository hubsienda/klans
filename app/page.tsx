import type { Metadata } from 'next';
import { HomeContent } from '@/components/HomeContent';

export const metadata: Metadata = {
  title: 'KLANS — Strategic Card Game',
  description: 'Discover KLANS: four rival factions, seven action-card types, conquest, diplomacy, betrayal and an online Human-vs-Computer adaptation.',
};

export default function HomePage() {
  return <HomeContent />;
}
