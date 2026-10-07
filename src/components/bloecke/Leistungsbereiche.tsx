import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { holeLeistungen } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Leistungsbereiche auf der Startseite: Texte und Aufbau aus dem V3-Abschnitt "Glasfaser verbindet. Wir machen sie
 * nutzbar." (vier Einsatzbereiche mit kurzer Erklärung), Darstellung als Karten mit Bild im V2-Stil (wie LeistungKarte).
 * Jeder Bereich zeigt auf eine Leistung aus der Sammlung; Bild und Link stammen von dort, ein eigenes Bild ist optional.
 * Die Seite /leistungen zeigt weiterhin alle Leistungen.
 */
export async function Leistungsbereiche({ daten: d }: { daten: BlockDaten<'leistungsbereiche'> }) {
  const leistungen = await holeLeistungen();
  const bereiche = d.bereiche.flatMap((b) => {
    const leistung = leistungen.find((l) => l.slug === b.leistung);
    if (!leistung) return [];
    return [{ titel: b.titel, text: b.text, href: `/leistungen/${leistung.slug}`, bild: b.bild ?? leistung.bild, bildAlt: b.bildAlt || leistung.bildAlt }];
  });
  if (bereiche.length < 2) return null;

  return (
    <section className="flaeche-ruhig abschnitt">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={d.linkText ? { text: d.linkText, href: '/leistungen' } : undefined}
        />
        <ul className={cn('grid gap-6 sm:grid-cols-2 lg:gap-8', bereiche.length === 4 ? 'xl:grid-cols-4' : bereiche.length === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2')}>
          {bereiche.map((b, i) => (
            <li
              key={b.href}
              data-einblenden
              style={{ '--einblenden-index': i } as React.CSSProperties}
              className="group relative flex flex-col overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche transition-colors duration-300 hover:border-marke/60"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-flaeche-dunkel">
                <Image
                  src={b.bild}
                  alt={b.bildAlt}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span
                  className="absolute top-4 left-4 font-titel text-2xl font-bold text-text-hell drop-shadow-[0_1px_8px_rgba(8,17,46,0.85)] transition-colors group-hover:text-marke"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 lg:p-8">
                <h3 className="titel-3">
                  <Link href={b.href} className="after:absolute after:inset-0">
                    {sauberText(b.titel)}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-text-leise">{sauberText(b.text)}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-titel text-xs font-semibold tracking-[0.18em] text-marke uppercase" aria-hidden>
                  Zur Leistung
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
