import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pyeongtaekstay.com';
const locales = ['ko', 'en', 'ja', 'zh'];

const roomSlugs = [
  'standard',
  'standard-premium',
  'deluxe',
  'family-twin',
  'family-triple',
  'royal-suite',
  'party-suite',
];

const staticPages = [
  '',
  '/rooms',
  '/facilities',
  '/location',
  '/events',
  '/booking',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Room detail pages for each locale
  for (const slug of roomSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/rooms/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
