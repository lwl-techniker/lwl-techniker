import Image from 'next/image';
import { Mail, Phone, UserRound } from 'lucide-react';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function Team({ daten: d }: { daten: BlockDaten<'team'> }) {
  if (d.personen.length === 0) return null;

  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf ueberzeile={d.ueberzeile} titel={d.titel} text={d.text} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8 xl:grid-cols-4 2xl:grid-cols-5">
          {d.personen.map((p, i) => (
            <li key={`${p.name}-${i}`} data-einblenden style={{ '--einblenden-index': i % 5 } as React.CSSProperties}>
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
              <h3 className="mt-4 text-lg font-semibold">{sauberText(p.name)}</h3>
              <p className="text-text-leise">{sauberText(p.funktion)}</p>
              {p.email || p.telefon ? (
                <p className="mt-2 flex flex-col gap-1 text-sm">
                  {p.email ? (
                    <a href={`mailto:${p.email}`} className="inline-flex min-h-6 items-center gap-2 break-all hover:text-marke">
                      <Mail className="size-4 shrink-0" aria-hidden />
                      {p.email}
                    </a>
                  ) : null}
                  {p.telefon ? (
                    <a href={`tel:${p.telefon.replaceAll(' ', '')}`} className="inline-flex min-h-6 items-center gap-2 hover:text-marke">
                      <Phone className="size-4 shrink-0" aria-hidden />
                      {p.telefon}
                    </a>
                  ) : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
