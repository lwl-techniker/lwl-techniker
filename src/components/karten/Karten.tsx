import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ImageOff, MapPin, Clock } from 'lucide-react';
import type { Job, Leistung, Referenz } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { BildOhneBeschnitt } from '@/components/ui/BildOhneBeschnitt';
import { monatJahr } from '@/lib/datum';
import { sauberText } from '@/lib/text';

/** Grössenangaben für next/image, passend zu rasterFuerKacheln (1, 2, 3 oder 4 Spalten). */
const KARTEN_SIZES = '(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

type Ebene = 'h2' | 'h3';

/**
 * Kachelraster ohne leere Spalten: 4 Spalten auf grossen Bildschirmen nur,
 * wenn die Anzahl dazu passt (4, 8, 12 ...). Sonst bleibt es bei 3.
 */
export function rasterFuerKacheln(anzahl: number) {
  const vier = anzahl >= 4 && anzahl % 4 === 0;
  return cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8', vier && '2xl:grid-cols-4');
}

export function ReferenzKarte({ referenz: r, titelEbene = 'h3', sizes = KARTEN_SIZES }: { referenz: Referenz; titelEbene?: Ebene; sizes?: string }) {
  const Titel = titelEbene;
  return (
    <article data-einblenden className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche">
        {r.titelbild ? (
          <BildOhneBeschnitt src={r.titelbild} alt={r.titelbildAlt} sizes={sizes} zoomBeiHover />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-linie" aria-hidden>
            <ImageOff className="size-1/6" strokeWidth={1} />
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-leise">
        {r.kategorie ? <span className="text-xs font-medium tracking-[0.2em] text-marke uppercase">{r.kategorie}</span> : null}
        {r.ort ? <span>{r.ort}</span> : null}
        {r.datum && r.datumZeigen ? <span>{monatJahr(r.datum)}</span> : null}
      </div>
      <Titel className="titel-3 mt-2">
        <Link href={`/referenzen/${r.slug}`} className="after:absolute after:inset-0">
          {sauberText(r.titel)}
        </Link>
      </Titel>
      <p className="mt-2 line-clamp-3 text-text-leise hyphens-auto break-words">{sauberText(r.kurzbeschreibung)}</p>
    </article>
  );
}

export function LeistungKarte({ leistung: l, titelEbene = 'h3', sizes = KARTEN_SIZES }: { leistung: Leistung; titelEbene?: Ebene; sizes?: string }) {
  const Titel = titelEbene;
  return (
    <article
      data-einblenden
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche transition-colors duration-300 hover:border-marke/60"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-flaeche">
        <Image src={l.bild} alt={l.bildAlt} fill sizes={sizes} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <Titel className="titel-3">
          <Link href={`/leistungen/${l.slug}`} className="after:absolute after:inset-0">
            {sauberText(l.titel)}
          </Link>
        </Titel>
        <p className="mt-3 flex-1 text-text-leise">{sauberText(l.kurzbeschreibung)}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-titel text-xs font-semibold tracking-[0.18em] text-marke uppercase" aria-hidden>
          Zur Leistung
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

export function JobZeile({ job: j, titelEbene = 'h3' }: { job: Job; titelEbene?: Ebene }) {
  const Titel = titelEbene;
  return (
    <article data-einblenden className="group relative grid gap-4 border-b border-linie py-7 transition-colors md:grid-cols-[1fr_auto] md:items-center md:gap-10 lg:py-8">
      <div>
        <Titel className="titel-3">
          <Link href={`/jobs/${j.slug}`} className="after:absolute after:inset-0 group-hover:text-marke">
            {sauberText(j.titel)}
          </Link>
        </Titel>
        <p className="mt-2 max-w-3xl text-text-leise">{sauberText(j.kurzbeschreibung)}</p>
      </div>
      <div className="text-kompakt flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end">
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4" aria-hidden />
          {j.pensum}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="size-4" aria-hidden />
          {j.arbeitsort}
        </span>
        <ArrowRight className="hidden size-6 text-marke transition-transform group-hover:translate-x-1 md:block" aria-hidden />
      </div>
    </article>
  );
}
