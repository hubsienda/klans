import { PrivacyContent } from '@/components/PrivacyContent';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'KLANZ privacy information covering technical request data, browser storage, consent preferences and privacy rights.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
