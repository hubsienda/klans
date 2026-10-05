import type { Metadata } from 'next';
import { KlansApp } from '@/components/KlansApp';

export const metadata: Metadata = {
  title: 'Play KLANS Online',
  description: 'Play the streamlined Human-vs-Computer browser adaptation of KLANS.',
};

export default function PlayPage() {
  return <KlansApp />;
}
