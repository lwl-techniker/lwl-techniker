import type { MetadataRoute } from 'next';
import { holeAlleSeiten, holeJobs, holeLeistungen, holeReferenzen } from '@/lib/cms';
import { DOMAIN } from '@/site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seiten, leistungen, referenzen, jobs] = await Promise.all([holeAlleSeiten(), holeLeistungen(), holeReferenzen(), holeJobs()]);
  const url = (pfad: string) => new URL(pfad, DOMAIN).toString();

  return [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/leistungen'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/produkte'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/downloads'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/referenzen'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/team'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/jobs'), changeFrequency: 'weekly', priority: 0.7 },
    ...seiten.filter((s) => s.inSitemap).map((s) => ({ url: url(`/${s.slug}`), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...leistungen.map((l) => ({ url: url(`/leistungen/${l.slug}`), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...referenzen.map((r) => ({ url: url(`/referenzen/${r.slug}`), lastModified: r.datum ?? undefined, changeFrequency: 'yearly' as const, priority: 0.6 })),
    ...jobs.map((j) => ({ url: url(`/jobs/${j.slug}`), lastModified: j.datum ?? undefined, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
