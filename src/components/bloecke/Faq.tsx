import { Plus } from 'lucide-react';
import { absaetze, sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Häufige Fragen mit nativem <details>, funktioniert ohne JavaScript.
 * Bewusst ohne FAQPage Daten: Google zeigt FAQ Ergebnisse seit 2023 nur noch für Behörden und Gesundheitsseiten,
 * und mehrere FAQ-Blöcke auf einer Seite würden in der Search Console als Fehler gemeldet.
 */
export function Faq({ daten: d }: { daten: BlockDaten<'faq'> }) {
  return (
    <section className="abschnitt">
      <div className="container-seite grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <h2 className="titel-2">{sauberText(d.titel)}</h2>
        <div className="border-t border-linie">
          {d.eintraege.map((e, i) => (
            <details key={i} className="group border-b border-linie">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold lg:text-xl [&::-webkit-details-marker]:hidden">
                {sauberText(e.frage)}
                <Plus className="size-6 shrink-0 text-marke transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <div className="lesebreite space-y-4 pb-8 text-text-leise">
                {absaetze(e.antwort).map((a, j) => (
                  <p key={j}>{a}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
