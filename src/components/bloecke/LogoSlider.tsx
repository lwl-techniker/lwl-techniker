import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { holeUebersichten } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Logoslider (V3-Funktion, V2-Darstellung als ruhiges Band nach den Projekten): endlos laufende Referenzlogos aus der zentralen Liste unter "Übersichtsseiten > Referenzen".
 * Die Liste wird nur einmal gepflegt und gilt für Startseite, /referenzen und /referenzen/allgemein.
 *
 * - zwei Durchläufe, die zweite Schleife ist für Screenreader unsichtbar
 * - feste Rahmen pro Logo, Silhouette im dunklen, Originalfarben im hellen Modus (ReferenzLogo)
 * - Pause beim Überfahren und bei Tastaturfokus, läuft bei "Bewegung reduzieren" mit halbem Tempo (globals.css)
 * - verlinkt auf die Übersichtsseite mit allen Logos
 */
export async function LogoSlider({ daten: d }: { daten: BlockDaten<'logoslider'> }) {
  const { referenzen } = await holeUebersichten();
  const logos = referenzen.logos.logos;
  if (logos.length === 0) return null;
  const dauer = Math.round(logos.length * 2.4);

  const reihe = (versteckt: boolean) => (
    <ul className="flex shrink-0 items-center gap-12 pr-12 lg:gap-16 lg:pr-16" aria-hidden={versteckt || undefined}>
      {logos.map((l, i) => (
        <li key={`${l.name}-${i}`} className="flex h-14 w-36 shrink-0 items-center justify-center lg:h-16 lg:w-44">
          <ReferenzLogo name={l.name} logo={l.logo} logoFarbig={l.logoFarbig} versteckt={versteckt} />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="abschnitt-kompakt overflow-hidden border-y border-linie" aria-label="Referenzlogos">
      <div className="container-seite mb-10 flex flex-col items-center gap-3 text-center">
        <h2 className="text-sm font-semibold tracking-[0.14em] text-text-leise uppercase">{sauberText(d.titel) || 'Eine Auswahl unserer Referenzen'}</h2>
        <Link href="/referenzen/allgemein" className="group inline-flex min-h-10 items-center gap-2 text-sm text-marke hover:text-marke-hell">
          Alle Referenzlogos ansehen
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </Link>
      </div>
      <Link href="/referenzen/allgemein" aria-label="Alle Referenzlogos ansehen" tabIndex={-1} className="logos-laufschrift block [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="logos-laufschrift-spur flex w-max" style={{ '--laufschrift-dauer': `${dauer}s` } as React.CSSProperties}>
          {reihe(false)}
          {reihe(true)}
        </div>
      </Link>
    </section>
  );
}
