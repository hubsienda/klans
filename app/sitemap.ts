import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_ORIGIN } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((path) => ({
    url: new URL(path, SITE_ORIGIN).toString(),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/play' ? 0.9 : 0.7,
  }));
}
