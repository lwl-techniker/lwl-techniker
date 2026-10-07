import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function Vorteile({ daten: d }: { daten: BlockDaten<'vorteile'> }) {
  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf ueberzeile={d.ueberzeile} titel={d.titel} />
        <ol className="grid gap-px border border-linie bg-linie sm:grid-cols-2 xl:grid-cols-3">
          {d.eintraege.map((e, i) => (
            <li key={i} data-einblenden className="group bg-flaeche p-8 transition-colors hover:bg-blau/20 lg:p-10">
              <span className="font-titel text-sm font-bold tracking-[0.1em] text-marke" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="titel-3 mt-4">{sauberText(e.titel)}</h3>
              <p className="text-kompakt mt-3">{sauberText(e.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
