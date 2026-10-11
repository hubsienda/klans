import { RulesContent } from '@/components/RulesContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Rules',
  description: 'Read the complete KLANZ tabletop rules: setup, turns, action cards, conquest, enemy cards, diplomacy, elimination and victory.',
  path: '/rules',
});

export default function RulesPage() {
  return <RulesContent />;
}
