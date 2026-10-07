import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { absaetze, sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function TextMitBild({ daten: d }: { daten: BlockDaten<'textMitBild'> }) {
  const bildLinks = d.bildPosition === 'links';

  return (
    <section className="abschnitt">
      <div className="container-seite grid items-center gap-10 lg:grid-cols-2 lg:gap-20 2xl:gap-28">
        <div className={cn('relative aspect-[4/3] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche', bildLinks ? 'lg:order-1' : 'lg:order-2')}>
          <Image src={d.bild} alt={d.bildAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className={cn('max-w-3xl', bildLinks ? 'lg:order-2' : 'lg:order-1')}>
          {d.ueberzeile ? <p className="ueberzeile">{sauberText(d.ueberzeile)}</p> : null}
          <h2 className="titel-2">{sauberText(d.titel)}</h2>
          <div className="mt-6 space-y-5 text-text-leise">
            {absaetze(d.text).map((absatz, i) => (
              <p key={i}>{absatz}</p>
            ))}
          </div>
          {d.knopf.text && d.knopf.link ? (
            <Link href={d.knopf.link} className="knopf-primaer mt-8">
              {d.knopf.text}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
