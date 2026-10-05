import type { Metadata } from 'next';
import { CookiesContent } from '@/components/CookiesContent';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'KLANS cookie and browser-storage policy covering necessary preferences, consent storage and optional technologies.',
};

export default function CookiesPage() {
  return <CookiesContent />;
}
