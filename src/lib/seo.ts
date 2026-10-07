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

  return {
    title: pfad === '/' ? { absolute: titel } : titel,
    description: beschreibung,
    alternates: { canonical: pfad },
    robots: ohneIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      locale: OG_LOCALE,
      url: new URL(pfad, DOMAIN).toString(),
      siteName: e.firmenname,
      title: titel,
      description: beschreibung,
      images: ogBild ? [{ url: ogBild }] : undefined,
    },
  };
}
