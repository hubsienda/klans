import { CookiesContent } from '@/components/CookiesContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Cookie Policy',
  description: 'KLANZ cookie and browser-storage policy covering necessary preferences, consent storage and optional technologies.',
  path: '/cookies',
});

export default function CookiesPage() {
  return <CookiesContent />;
}
