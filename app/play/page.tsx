import { KlanzApp } from '@/components/KlanzApp';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Play KLANZ Online',
  description: 'Play the streamlined Human-vs-Computer browser adaptation of KLANZ.',
  path: '/play',
});

export default function PlayPage() {
  return <KlanzApp />;
}
