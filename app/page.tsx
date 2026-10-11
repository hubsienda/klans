import { HomeContent } from '@/components/HomeContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'KLANZ — Strategic Card Game',
  description: 'Discover KLANZ: four rival factions, seven action-card types, conquest, diplomacy, betrayal and an online Human-vs-Computer adaptation.',
  path: '/',
  absoluteTitle: true,
});

export default function HomePage() {
  return <HomeContent />;
}
