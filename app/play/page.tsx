import type { Metadata } from 'next';
import { KlanzApp } from '@/components/KlanzApp';

export const metadata: Metadata = {
  title: 'Play KLANZ Online',
  description: 'Play the streamlined Human-vs-Computer browser adaptation of KLANZ.',
};

export default function PlayPage() {
  return <KlanzApp />;
}
