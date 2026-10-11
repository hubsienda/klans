import type { Metadata } from 'next';

export const SITE_ORIGIN = 'https://klanz.naralimon.com';
export const OLD_SITE_HOST = 'klans.naralimon.com';

export const PUBLIC_ROUTES = [
  '/',
  '/play',
  '/rules',
  '/factions',
  '/action-cards',
  '/privacy',
  '/cookies',
] as const;

interface PageMetadataOptions {
  title: string;
  description: string;
  path: (typeof PUBLIC_ROUTES)[number];
  absoluteTitle?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      siteName: 'KLANZ',
      title,
      description,
      url: path,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
