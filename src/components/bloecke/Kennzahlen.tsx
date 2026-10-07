import { Zaehler } from '@/components/ui/Zaehler';
import { ZaehlerGruppe } from '@/components/ui/ZaehlerGruppe';
import { holeDatenblaetter } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Kennzahlen (Werte aus V3, Zählerfunktion aus V3, Darstellung V2): Band mit grossen Zahlen im Bernstein-Verlauf.
 * Wert "automatisch:datenblaetter" wird beim Build durch die tatsächliche Anzahl eindeutiger Datenblätter ersetzt,
 * damit die Zahl nicht veraltet (Prüfung über SHA-256 in scripts/erzeuge-datenblaetter.mjs).
 * Darstellung "gelb" nutzt das gelbe Band aus V3, "dunkel" das Nachtblau-Band aus V2.
 */
export async function Kennzahlen({ daten: d }: { daten: BlockDaten<'kennzahlen'> }) {
  const datenblaetter = await holeDatenblaetter();
  const eindeutig = new Set(datenblaetter.map((b) => b.pruefsumme).filter(Boolean)).size;
  const eintraege = d.eintraege.map((e) => ({ ...e, wert: e.wert === 'automatisch:datenblaetter' ? String(eindeutig) : e.wert }));
  const gelb = d.darstellung === 'gelb';

  return (
    <section className={cn('relative overflow-hidden', gelb ? 'band-gelb' : 'flaeche-tief')}>
      {!gelb ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(240,168,0,0.08)_0%,transparent_65%)]" aria-hidden /> : null}
      <div className="container-seite relative">
        <ZaehlerGruppe>
        <dl className={cn('grid', eintraege.length === 2 ? 'grid-cols-2' : eintraege.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3')}>
          {eintraege.map((e, i) => (
            <div
              key={i}
              data-einblenden
              style={{ '--einblenden-index': i } as React.CSSProperties}
              className={cn(
                'flex flex-col-reverse px-2 py-8 sm:px-6 lg:px-10 lg:py-12',
                gelb ? 'border-[rgb(8_17_46_/_0.25)] odd:border-r sm:border-r sm:last:border-r-0 sm:first:pl-0' : 'border-linie/60 odd:border-r sm:border-r sm:last:border-r-0 sm:first:pl-0'
              )}
            >
              <dt className={cn('mt-3 text-xs tracking-[0.26em] uppercase hyphens-auto break-words', gelb ? 'text-band-text/80' : 'text-text-leise')}>{sauberText(e.bezeichnung)}</dt>
              <dd className={cn('font-titel text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl', gelb ? 'text-band-text' : 'verlauf')}>
                <Zaehler wert={e.wert} />
              </dd>
            </div>
          ))}
        </dl>
        </ZaehlerGruppe>
      </div>
    </section>
  );
}
