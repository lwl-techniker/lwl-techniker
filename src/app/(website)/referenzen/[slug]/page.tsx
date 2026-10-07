import { ImageOff } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Galerie } from '@/components/ui/Galerie';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { ReferenzKarte } from '@/components/karten/Karten';
import { holeReferenz, holeReferenzen, holeUebersichten } from '@/lib/cms';
import { monatJahr } from '@/lib/datum';
import { renderMarkdoc } from '@/lib/markdoc';
import { metadaten } from '@/lib/seo';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await holeReferenzen()).map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const r = await holeReferenz(slug);
  if (!r) return {};
  return metadaten({ pfad: `/referenzen/${slug}`, seitentitel: r.titel, seo: r.seo, beschreibungFallback: r.kurzbeschreibung, bild: r.titelbild });
}

export default async function ReferenzSeite({ params }: Props) {
  const { slug } = await params;
  const [r, alle, { referenzen: u }] = await Promise.all([holeReferenz(slug), holeReferenzen(), holeUebersichten()]);
  if (!r) notFound();
  const inhalt = await renderMarkdoc(r.inhalt);
  const weitere = alle.filter((x) => x.slug !== slug).slice(0, 3);
  const bilder = [...(r.titelbild ? [{ bild: r.titelbild, alt: r.titelbildAlt }] : []), ...r.galerie];

  const fakten = [
    { titel: 'Bauherrschaft', wert: r.kunde },
    { titel: 'Ort', wert: r.ort },
    { titel: 'Kategorie', wert: r.kategorie },
    { titel: 'Abschluss', wert: r.datumZeigen ? monatJahr(r.datum) : '' },
  ].filter((f) => f.wert);

  return (
    <>
      <Seitenkopf
        ueberzeile={r.kategorie || undefined}
        titel={r.titel}
        einleitung={r.kurzbeschreibung}
        pfad={[
          { text: u.titel, href: '/referenzen' },
          { text: r.titel, href: `/referenzen/${slug}` },
        ]}
      />

      <div className="container-seite pt-12 lg:pt-16">
        {bilder.length > 0 ? (
          <Galerie bilder={bilder} />
        ) : (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche lg:aspect-[21/9]">
            <span className="absolute inset-0 flex items-center justify-center text-linie" aria-hidden>
              <ImageOff className="size-1/6" strokeWidth={1} />
            </span>
          </div>
        )}
      </div>

      <section className="abschnitt">
        <div className="container-seite grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-20">
          <div className="fliesstext lesebreite">{inhalt}</div>
          {fakten.length > 0 ? (
            <aside className="h-fit rounded-[var(--radius-karte)] bg-flaeche p-8 lg:sticky lg:top-32">
              <dl className="divide-y divide-linie">
                {fakten.map((f) => (
                  <div key={f.titel} className="py-4 first:pt-0 last:pb-0">
                    <dt className="text-sm text-text-leise">{f.titel}</dt>
                    <dd className="mt-1 font-semibold">{f.wert}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
        </div>
      </section>

      {weitere.length > 0 ? (
        <section className="abschnitt border-t border-linie bg-flaeche/60">
          <div className="container-seite">
            <h2 className="titel-2 mb-10">Weitere Referenzen</h2>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {weitere.map((w) => (
                <ReferenzKarte key={w.slug} referenz={w} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
