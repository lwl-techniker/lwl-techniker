import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Phone, UserRound } from 'lucide-react';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { holeTeam, type Person } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Team aus der Sammlung "Team" (Struktur und Daten aus V3): Geschäftsleitung und Technik getrennt pflegbar.
 * Darstellung in V2-Kacheln. Personen ohne Porträt erhalten einen neutralen Platzhalter, es werden keine
 * Porträts erfunden.
 */
export async function TeamAuszug({ daten: d }: { daten: BlockDaten<'teamAuszug'> }) {
  const alle = await holeTeam();
  const personen = d.bereich === 'alle' ? alle : alle.filter((p) => p.bereich === d.bereich);
  if (personen.length === 0) return null;

  return (
    <section className="flaeche-ruhig abschnitt">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={d.linkText ? { text: d.linkText, href: '/team' } : undefined}
        />
        <Personen personen={personen} />
      </div>
    </section>
  );
}

/**
 * Personenraster, auch auf /team verwendet. Jede Karte ist höchstens 18 rem breit, damit Geschäftsleitung (zwei Personen)
 * und Technik (vier Personen) gleich grosse Porträts erhalten (Wunsch Kundschaft, 8. Oktober 2026).
 */
export function Personen({ personen, kompakt = false }: { personen: readonly Person[]; kompakt?: boolean }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(13rem,18rem))] lg:gap-x-8', kompakt && 'sm:justify-start')}>
      {personen.map((p, i) => (
        <li key={p.slug} data-einblenden style={{ '--einblenden-index': i % 5 } as React.CSSProperties}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche">
            {p.foto ? (
              <Image
                src={p.foto}
                alt={`${p.name}, ${p.funktion}`}
                fill
                sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover object-top"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-linie" aria-hidden>
                <UserRound className="size-1/3" strokeWidth={1} />
              </span>
            )}
          </div>
          <p className="mt-3 text-[0.68rem] font-medium tracking-[0.26em] text-marke uppercase">{p.bereich === 'leitung' ? 'Geschäftsleitung' : 'Technik'}</p>
          <h3 className="mt-1 text-base font-semibold lg:text-lg">{sauberText(p.name)}</h3>
          <p className="text-sm text-text-leise">{sauberText(p.funktion)}</p>
          {p.email || p.telefon ? (
            <p className="mt-2 flex flex-col gap-1 text-sm">
              {p.telefon ? (
                <a href={`tel:${p.telefon.replaceAll(' ', '')}`} className="inline-flex min-h-6 items-center gap-2 hover:text-marke">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {p.telefon}
                </a>
              ) : null}
              {p.email ? (
                <a href={`mailto:${p.email}`} className="inline-flex min-h-6 items-center gap-2 break-all hover:text-marke">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {p.email}
                </a>
              ) : null}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function TeamLink({ text = 'Das gesamte Team kennenlernen' }: { text?: string }) {
  return (
    <Link href="/team" className="group inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
      {text}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
