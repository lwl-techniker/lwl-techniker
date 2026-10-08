import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Activity, Building2, Cable, Clock, FileCheck2, GraduationCap, MapPin, Package, Phone, Search, Server, ShieldCheck, Users, Wrench } from 'lucide-react';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { LeistungKarte } from '@/components/karten/Karten';
import { holeEinstellungen, holeLeistung, holeLeistungen, holeUebersichten } from '@/lib/cms';
import { renderMarkdoc } from '@/lib/markdoc';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { leistungAlsService } from '@/lib/strukturierte-daten';
import { aktualisiertVon } from '@/lib/aktualisiert';

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

/** Symbole für die Merkmale "Auf einen Blick" (Auswahl im CMS, Schema in src/keystatic.config.ts) */
const SYMBOLE = {
  spleiss: Cable,
  messung: Activity,
  protokoll: FileCheck2,
  standort: MapPin,
  rack: Server,
  team: Users,
  zeit: Clock,
  werkzeug: Wrench,
  gebaeude: Building2,
  lieferung: Package,
  schulung: GraduationCap,
  telefon: Phone,
  suche: Search,
  haken: ShieldCheck,
} as const;

/**
 * Detailseite einer Leistung (Gestaltung 7. Oktober 2026):
 * Text links in Lesegrösse mit Handlungsaufruf, rechts eine haftende Spalte mit dem Bild in moderater Grösse
 * (4:3, nie grösser als die Spalte) und der Liste "Auf einen Blick" mit Symbolen, die beim Scrollen mitläuft.
 * Darunter weitere Leistungen. Strukturierte Daten als Service.
 */
export default async function LeistungSeite({ params }: Props) {
  const { slug } = await params;
  const [l, alle, { leistungen: u }, e] = await Promise.all([holeLeistung(slug), holeLeistungen(), holeUebersichten(), holeEinstellungen()]);
  if (!l) notFound();
  const inhalt = await renderMarkdoc(l.inhalt);
  const weitere = alle.filter((x) => x.slug !== slug).slice(0, 3);
  const betreff = encodeURIComponent(sauberText(l.titel));

  return (
    <>
      <JsonLd daten={leistungAlsService(l, e)} />
      <Seitenkopf bild={l.bild} aktualisiert={aktualisiertVon(`content/leistungen/${slug}`)}
        titel={l.titel}
        einleitung={l.kurzbeschreibung}
        pfad={[
          { text: u.titel, href: '/leistungen' },
          { text: l.titel, href: `/leistungen/${slug}` },
        ]}
      />
      <section className="abschnitt">
        <div className="container-seite grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] 2xl:gap-24">
          <div className="max-w-[46rem] 3xl:max-w-[54rem]">
            <div className="fliesstext text-[1.125rem] leading-8 lg:text-xl lg:leading-9 3xl:text-[1.375rem] 3xl:leading-10 [&_p:first-child]:text-text [&_p:first-child]:font-medium">{inhalt}</div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`/kontakt?betreff=${betreff}`} className="knopf-primaer">
                Projekt besprechen
              </Link>
              <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="knopf-sekundaer">
                {e.telefon}
              </a>
            </div>
          </div>

          <aside className="self-start lg:sticky lg:top-32">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche">
              <Image src={l.bild} alt={l.bildAlt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1536px) 40vw, (min-width: 1024px) 42vw, 100vw" className="object-cover" />
            </div>
            {l.merkmale.length > 0 ? (
              <div className="mt-6 rounded-[var(--radius-karte)] border border-linie bg-flaeche/80 p-6 backdrop-blur-sm lg:p-7">
                <h2 className="text-[0.68rem] font-medium tracking-[0.28em] text-marke uppercase">Auf einen Blick</h2>
                <ul className="mt-4 space-y-3">
                  {l.merkmale.map((m, i) => {
                    const Symbol = SYMBOLE[m.symbol] ?? ShieldCheck;
                    return (
                      <li key={i} data-einblenden style={{ '--einblenden-index': i } as React.CSSProperties} className="flex items-start gap-3 text-[0.95rem] leading-6 lg:text-base">
                        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-marke/12 text-marke" aria-hidden>
                          <Symbol className="size-4" strokeWidth={2} />
                        </span>
                        <span>{sauberText(m.text)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      {weitere.length > 0 ? (
        <section className="flaeche-ruhig abschnitt">
          <div className="container-seite">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
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
