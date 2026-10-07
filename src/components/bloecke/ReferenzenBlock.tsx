import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { BildOhneBeschnitt } from '@/components/ui/BildOhneBeschnitt';
import { holeReferenzenFuerStartseite } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Neuste Referenzen, automatisch, als Zellenraster mit grosser Nummer wie im Entwurf.
 * Auswahlregel: src/lib/startseite-auswahl.ts (markierte zuerst, Rest mit den neusten auffüllen).
 */
export async function ReferenzenBlock({ daten: d }: { daten: BlockDaten<'referenzen'> }) {
  const anzahl = Number(d.anzahl);
  const referenzen = await holeReferenzenFuerStartseite(anzahl);
  if (referenzen.length === 0) return null;

  return (
    <section className="flaeche-betont abschnitt">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={d.linkText ? { text: d.linkText, href: '/referenzen' } : undefined}
        />
        <ul className={cn('grid gap-px border border-linie bg-linie sm:grid-cols-2', anzahl === 3 ? 'lg:grid-cols-3' : anzahl === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
          {referenzen.map((r, i) => (
            <li key={r.slug} data-einblenden className="group relative flex flex-col overflow-hidden bg-flaeche transition-colors hover:bg-blau/20">
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-marke to-marke-hell transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
              <div className="relative aspect-[4/3] overflow-hidden bg-flaeche-dunkel">
                {r.titelbild ? (
                  <BildOhneBeschnitt src={r.titelbild} alt={r.titelbildAlt} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" zoomBeiHover />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-linie" aria-hidden>
                    <ImageOff className="size-1/6" strokeWidth={1} />
                  </span>
                )}
                <span
                  className="absolute top-4 left-4 font-titel text-3xl font-bold text-text-hell drop-shadow-[0_1px_8px_rgba(8,17,46,0.85)] transition-colors group-hover:text-marke"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7 lg:p-8">
                <h3 className="text-sm font-semibold tracking-[0.12em] uppercase">
                  <Link href={`/referenzen/${r.slug}`} className="after:absolute after:inset-0">
                    {sauberText(r.titel)}
                  </Link>
                </h3>
                {r.kategorie || r.ort ? <p className="mt-1 text-xs text-text-leise">{[r.kategorie, r.ort].filter(Boolean).join(', ')}</p> : null}
                <p className="text-kompakt mt-4 line-clamp-3 hyphens-auto break-words">{sauberText(r.kurzbeschreibung)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
