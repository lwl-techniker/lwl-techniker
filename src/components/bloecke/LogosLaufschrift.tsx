import Link from 'next/link';
import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { sauberText } from '@/lib/text';

type Logo = { name: string; logo: string; logoFarbig: string | null };

/**
 * Scrollendes Logo-Band für den Block "Logos" mit eigener Liste. Die Startseite verwendet stattdessen den
 * Block "Logoslider", der die zentrale Referenzliste liest. Technik identisch: zwei Durchläufe, Verschiebung
 * um die halbe Breite, Pause beim Überfahren, Stillstand bei "Bewegung reduzieren".
 */
export function LogosLaufschrift({ titel, logos }: { titel: string; logos: readonly Logo[] }) {
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
    <section className="flaeche-ruhig overflow-hidden py-7 lg:py-9">
      {titel ? (
        <div className="container-seite">
          <h2 className="mb-6 text-center text-[0.7rem] font-medium tracking-[0.3em] text-text-leise uppercase">{sauberText(titel)}</h2>
        </div>
      ) : null}
      <Link href="/kunden" aria-label="Unsere Kunden ansehen" className="logos-laufschrift block [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div className="logos-laufschrift-spur flex w-max" style={{ animationDuration: `${dauer}s` }}>
          {reihe(false)}
          {reihe(true)}
        </div>
      </Link>
    </section>
  );
}
