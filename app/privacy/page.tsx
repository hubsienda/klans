import type { Metadata } from 'next';
import { PrivacyContent } from '@/components/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'KLANS privacy information covering technical request data, browser storage, consent preferences and privacy rights.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
