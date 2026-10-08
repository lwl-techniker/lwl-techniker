import type { MetadataRoute } from 'next';
import { holeAlleSeiten, holeJobs, holeLeistungen, holeReferenzen } from '@/lib/cms';
import { aktualisiertVon } from '@/lib/aktualisiert';
import { DOMAIN } from '@/site.config';

/**
 * Sitemap mit "lastmod" aus der Git-Historie der Inhaltsdateien (content/aktualisiert.json, scripts/aktualisiert.mjs).
 * Google wertet lastmod als Signal für erneutes Crawlen; changefreq und priority dienen anderen Suchmaschinen.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seiten, leistungen, referenzen, jobs] = await Promise.all([holeAlleSeiten(), holeLeistungen(), holeReferenzen(), holeJobs()]);
  const url = (pfad: string) => new URL(pfad, DOMAIN).toString();
  const uebersichten = 'content/einstellungen/uebersichten.json';

  return [
    { url: url('/'), lastModified: aktualisiertVon('content/startseite', 'content/leistungen', 'content/referenzen'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/leistungen'), lastModified: aktualisiertVon(uebersichten, 'content/leistungen'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/produkte'), lastModified: aktualisiertVon(uebersichten, 'content/produkte'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/downloads'), lastModified: aktualisiertVon('content/produkte'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/referenzen'), lastModified: aktualisiertVon(uebersichten, 'content/referenzen'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/kunden'), lastModified: aktualisiertVon(uebersichten), changeFrequency: 'yearly', priority: 0.6 },
    { url: url('/team'), lastModified: aktualisiertVon('content/team.json'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/jobs'), lastModified: aktualisiertVon(uebersichten, 'content/jobs'), changeFrequency: 'weekly', priority: 0.7 },
    ...seiten.filter((s) => s.inSitemap).map((s) => ({ url: url(`/${s.slug}`), lastModified: aktualisiertVon(`content/seiten/${s.slug}`), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...leistungen.map((l) => ({ url: url(`/leistungen/${l.slug}`), lastModified: aktualisiertVon(`content/leistungen/${l.slug}`), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...referenzen.map((r) => ({ url: url(`/referenzen/${r.slug}`), lastModified: aktualisiertVon(`content/referenzen/${r.slug}`) ?? r.datum ?? undefined, changeFrequency: 'yearly' as const, priority: 0.6 })),
    ...jobs.map((j) => ({ url: url(`/jobs/${j.slug}`), lastModified: aktualisiertVon(`content/jobs/${j.slug}`) ?? j.datum ?? undefined, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
