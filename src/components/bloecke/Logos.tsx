import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';
import { LogosLaufschrift } from './LogosLaufschrift';

type LogoDaten = { titel: string; laufschrift: boolean; logos: readonly { name: string; logo: string; logoFarbig: string | null; link?: string }[] };

/**
 * Partner- und Referenzlogos als eigener Block (frei gestaltbare Seiten) oder direkt auf /referenzen.
 * Zwei Darstellungen per Häkchen im CMS:
 * - Laufschrift: endlos durchlaufend (LogosLaufschrift.tsx)
 * - Raster: alle Logos auf einen Blick, zentrierte Wolke wie in V2
 * Beide nutzen ReferenzLogo: Silhouette im dunklen, Originalfarben im hellen Modus. Das in V2 gewählte
 * Feld "Darstellung" (weiss/farbig) ist dadurch nicht mehr nötig, der Modus entscheidet.
 */
export function Logos({ daten: d }: { daten: BlockDaten<'logos'> | LogoDaten }) {
  if (d.laufschrift) return <LogosLaufschrift titel={d.titel} logos={d.logos} />;
  return <LogosRaster daten={d} />;
}

function LogosRaster({ daten: d }: { daten: LogoDaten }) {
  return (
    <section className="abschnitt-kompakt border-y border-linie">
      <div className="container-seite">
        {d.titel ? <h2 className="mb-10 text-center text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel)}</h2> : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-16">
          {d.logos.map((l, i) => {
            const bild = <ReferenzLogo name={l.name} logo={l.logo} logoFarbig={l.logoFarbig} className="h-10 lg:h-12" />;
            return (
              <li key={`${l.name}-${i}`} className="flex w-32 items-center justify-center lg:w-40">
                {l.link ? (
                  <a href={l.link} target={l.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block w-full">
                    {bild}
                  </a>
                ) : (
                  <span className="block w-full">{bild}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
