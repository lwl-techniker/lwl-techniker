import type { Metadata } from 'next';
import { DOMAIN, OG_LOCALE } from '@/site.config';
import { holeEinstellungen } from './cms';
import { sauberText } from './text';

type SeoFelder = { titel: string; beschreibung: string } | null | undefined;

/**
 * Einheitliche Metadaten für jede Seite.
 * - Titel: SEO-Titel oder Seitentitel. Der Firmenname wird über das Template im Layout angehängt,
 *   deshalb hier NIE selbst anhängen (sonst erscheint er doppelt).
 * - Canonical: immer der eigene Pfad, nie die Startseite.
 */
export async function metadaten({
  pfad,
  seitentitel,
  seo,
  beschreibungFallback,
  bild,
  ohneIndex,
}: {
  pfad: string;
  seitentitel?: string;
  seo?: SeoFelder;
  beschreibungFallback?: string;
  bild?: string | null;
  ohneIndex?: boolean;
}): Promise<Metadata> {
  const e = await holeEinstellungen();
  const titel = sauberText(seo?.titel || seitentitel || e.seoTitel);
  const beschreibung = sauberText(seo?.beschreibung || beschreibungFallback || e.seoBeschreibung);
  const ogBild = bild || e.ogbild;

  const bilder = ogBild ? [{ url: ogBild, width: ogBild === e.ogbild ? 1200 : undefined, height: ogBild === e.ogbild ? 630 : undefined, alt: titel }] : undefined;

  return {
    title: pfad === '/' ? { absolute: titel } : titel,
    description: beschreibung,
    applicationName: e.firmenname,
    authors: [{ name: e.firmenname, url: DOMAIN }],
    creator: e.firmenname,
    publisher: e.firmenname,
    alternates: { canonical: pfad },
    robots: ohneIndex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    formatDetection: { telephone: true, email: true, address: true },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE,
      url: new URL(pfad, DOMAIN).toString(),
      siteName: e.firmenname,
      title: titel,
      description: beschreibung,
      images: bilder,
    },
    twitter: {
      card: 'summary_large_image',
      title: titel,
      description: beschreibung,
      images: ogBild ? [ogBild] : undefined,
    },
  };
}
