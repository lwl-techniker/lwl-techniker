import type { MetadataRoute } from 'next';
import { DOMAIN, INDEXIERBAR } from '@/site.config';

/**
 * Nur die freigegebene produktive Seite darf erfasst werden (SITE_INDEXABLE=true im Production-Kontext).
 * Alle Vorschauen und Branch-Deploys bleiben gesperrt.
 *
 * Suchmaschinen und KI-Systeme (Google, Bing, Apple, OpenAI, Anthropic, Perplexity, Common Crawl) erhalten dieselbe
 * Freigabe: öffentliche Seiten ja, CMS und API nein. Die Zusammenfassung für Sprachmodelle liegt unter /llms.txt.
 */
const GESPERRT = ['/keystatic', '/api/', '/__forms.html', '/veroeffentlichen'];
const KI_BOTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent'];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXIERBAR) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: GESPERRT },
      { userAgent: KI_BOTS, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: GESPERRT },
    ],
    sitemap: new URL('/sitemap.xml', DOMAIN).toString(),
    host: DOMAIN,
  };
}
