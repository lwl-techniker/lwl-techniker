import type { MetadataRoute } from 'next';
import { DOMAIN, INDEXIERBAR } from '@/site.config';

/**
 * Nur die freigegebene produktive Seite darf von Google erfasst werden (SITE_INDEXABLE=true im Production-Kontext).
 * Alle Vorschauen und Branch-Deploys bleiben gesperrt.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXIERBAR) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/keystatic', '/api/'] }],
    sitemap: new URL('/sitemap.xml', DOMAIN).toString(),
  };
}
