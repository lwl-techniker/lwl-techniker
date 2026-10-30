import type { MetadataRoute } from 'next';
import { DOMAIN, INDEXIERBAR } from '@/site.config';

/**
 * Nur die freigegebene produktive Seite darf erfasst werden (SITE_INDEXABLE=true im Production-Kontext).
 * Alle Vorschauen und Branch-Deploys bleiben gesperrt.
 *
 * Suchmaschinen und KI-Systeme erhalten dieselbe Freigabe: öffentliche Seiten ja, CMS und API nein. Die Zusammenfassung
 * für Sprachmodelle liegt unter /llms.txt. Bing und die KI-Crawler von OpenAI, Anthropic, Perplexity, Google, Apple,
 * Amazon, DuckDuckGo, Mistral, Meta, ByteDance und Common Crawl sind namentlich aufgeführt, damit die Freigabe auf einen
 * Blick sichtbar ist (inhaltlich gilt für sie dieselbe Regel wie für alle).
 */
const GESPERRT = ['/keystatic', '/api/', '/__forms.html'];
const NAMENTLICH = [
  'Bingbot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'meta-externalagent',
  'meta-externalfetcher',
  'Bytespider',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXIERBAR) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: GESPERRT },
      { userAgent: NAMENTLICH, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: GESPERRT },
    ],
    sitemap: new URL('/sitemap.xml', DOMAIN).toString(),
    host: DOMAIN,
  };
}
