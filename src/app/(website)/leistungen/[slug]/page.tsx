import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { LeistungKarte } from '@/components/karten/Karten';
import { holeLeistung, holeLeistungen, holeUebersichten } from '@/lib/cms';
import { renderMarkdoc } from '@/lib/markdoc';
import { metadaten } from '@/lib/seo';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await holeLeistungen()).map((l) => ({ slug: l.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const l = await holeLeistung(slug);
  if (!l) return {};
  return metadaten({ pfad: `/leistungen/${slug}`, seitentitel: l.titel, seo: l.seo, beschreibungFallback: l.kurzbeschreibung, bild: l.bild });
}

export default async function LeistungSeite({ params }: Props) {
  const { slug } = await params;
  const [l, alle, { leistungen: u }] = await Promise.all([holeLeistung(slug), holeLeistungen(), holeUebersichten()]);
  if (!l) notFound();
  const inhalt = await renderMarkdoc(l.inhalt);
  const weitere = alle.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <Seitenkopf
        titel={l.titel}
        einleitung={l.kurzbeschreibung}
        pfad={[
          { text: u.titel, href: '/leistungen' },
          { text: l.titel, href: `/leistungen/${slug}` },
        ]}
      />
      <section className="abschnitt">
        <div className="container-seite grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20 2xl:gap-28">
          <div className="fliesstext lesebreite">{inhalt}</div>
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche lg:sticky lg:top-32">
              <Image src={l.bild} alt={l.bildAlt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>
      {weitere.length > 0 ? (
        <section className="abschnitt border-t border-linie">
          <div className="container-seite">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 className="titel-2">Weitere Leistungen</h2>
              <Link href="/leistungen" className="font-semibold hover:text-marke">
                Alle Leistungen
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {weitere.map((w) => (
                <LeistungKarte key={w.slug} leistung={w} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
