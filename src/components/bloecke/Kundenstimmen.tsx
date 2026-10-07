import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function Kundenstimmen({ daten: d }: { daten: BlockDaten<'kundenstimmen'> }) {
  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf titel={d.titel} />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {d.eintraege.map((e, i) => (
            <figure key={i} className="flex flex-col rounded-[var(--radius-karte)] border border-linie p-8 lg:p-10">
              <blockquote className="flex-1 text-lg leading-relaxed lg:text-xl">
                <p>«{sauberText(e.zitat)}»</p>
              </blockquote>
              <figcaption className="mt-8 border-t border-linie pt-6">
                <p className="font-semibold">{e.name}</p>
                {e.funktion ? <p className="text-text-leise">{e.funktion}</p> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
