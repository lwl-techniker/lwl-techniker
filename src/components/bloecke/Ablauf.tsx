import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Schritte auf einer Leitlinie wie im Entwurf: Punkt, "Schritt 01", Titel in Versalien, Text.
 * Handy: untereinander an einer senkrechten Linie. Tablet: zwei Spalten. Ab 1280 px: nebeneinander mit waagrechter Linie.
 */
export function Ablauf({ daten: d }: { daten: BlockDaten<'ablauf'> }) {
  const spalten = d.schritte.length >= 5 ? 'xl:grid-cols-5' : d.schritte.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3';

  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf ueberzeile={d.ueberzeile} titel={d.titel} text={d.text} />
        <ol className={`relative grid gap-10 md:grid-cols-2 md:gap-x-12 xl:gap-12 ${spalten}`}>
          {/* Leitlinie: senkrecht auf dem Handy, waagrecht ab 1280 px */}
          <span className="absolute top-0 bottom-0 left-[6px] w-px bg-gradient-to-b from-marke to-marke/10 md:hidden xl:top-[6px] xl:right-0 xl:bottom-auto xl:left-0 xl:block xl:h-px xl:w-auto xl:bg-gradient-to-r" aria-hidden />
          {d.schritte.map((s, i) => (
            <li key={i} data-einblenden style={{ '--einblenden-index': i } as React.CSSProperties} className="relative pl-10 md:pl-0 xl:pt-12">
              <span
                className="absolute top-0 left-0 size-[14px] rounded-full border-2 border-marke bg-grund md:static md:mb-5 md:block xl:absolute xl:mb-0"
                aria-hidden
              />
              <p className="text-xs font-medium tracking-[0.32em] text-marke uppercase">Schritt {String(i + 1).padStart(2, '0')}</p>
              <h3 className="titel-3 mt-2">{sauberText(s.titel)}</h3>
              <p className="text-kompakt mt-3 max-w-xl">{sauberText(s.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
