'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BildOhneBeschnitt } from './BildOhneBeschnitt';
import { cn } from '@/lib/cn';

type Bild = { bild: string; alt: string };

/**
 * Karussell für mehrere Bilder: ein Bild pro Ansicht, Pfeile und Punkte zum Wechseln, auf dem Handy
 * auch mit dem Finger wischbar (CSS scroll-snap). Bewegung reduzieren macht das Springen zwischen
 * Bildern sofort statt weich (globale Regel in globals.css).
 */
export function Galerie({ bilder }: { bilder: readonly Bild[] }) {
  const spur = useRef<HTMLDivElement>(null);
  const folien = useRef<(HTMLDivElement | null)[]>([]);
  const [aktiv, setAktiv] = useState(0);

  useEffect(() => {
    const spurEl = spur.current;
    if (!spurEl || bilder.length < 2) return;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        const sichtbarste = eintraege.reduce((max, e) => (e.intersectionRatio > (max?.intersectionRatio ?? 0) ? e : max), eintraege[0]);
        if (!sichtbarste?.isIntersecting) return;
        const index = folien.current.findIndex((f) => f === sichtbarste.target);
        if (index >= 0) setAktiv(index);
      },
      { root: spurEl, threshold: 0.6 }
    );
    folien.current.forEach((f) => f && beobachter.observe(f));
    return () => beobachter.disconnect();
  }, [bilder.length]);

  if (bilder.length === 0) return null;

  const zu = (index: number) => spur.current?.scrollTo({ left: folien.current[index]?.offsetLeft ?? 0 });

  return (
    <div className="relative" role="region" aria-roledescription="Karussell" aria-label="Bildergalerie">
      <div ref={spur} tabIndex={0} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {bilder.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              folien.current[i] = el;
            }}
            role="group"
            aria-roledescription="Folie"
            aria-label={`Bild ${i + 1} von ${bilder.length}`}
            className="relative aspect-[16/9] w-full shrink-0 snap-center lg:aspect-[21/9] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche"
          >
            <BildOhneBeschnitt src={b.bild} alt={b.alt} sizes="(min-width: 2400px) 2304px, 100vw" prioritaet={i === 0} />
          </div>
        ))}
      </div>

      {bilder.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => zu(Math.max(0, aktiv - 1))}
            disabled={aktiv === 0}
            className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-marke/30 bg-flaeche-dunkel/80 text-marke backdrop-blur-md transition-opacity hover:border-marke disabled:pointer-events-none disabled:opacity-0 lg:left-5"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => zu(Math.min(bilder.length - 1, aktiv + 1))}
            disabled={aktiv === bilder.length - 1}
            className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-marke/30 bg-flaeche-dunkel/80 text-marke backdrop-blur-md transition-opacity hover:border-marke disabled:pointer-events-none disabled:opacity-0 lg:right-5"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>

          <div className="mt-2 flex justify-center" role="tablist" aria-label="Bild wählen">
            {bilder.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === aktiv}
                aria-label={`Bild ${i + 1} von ${bilder.length}`}
                onClick={() => zu(i)}
                className="group inline-flex size-11 items-center justify-center"
              >
                <span className={cn('block size-2.5 rounded-full transition-colors', i === aktiv ? 'bg-marke' : 'bg-linie group-hover:bg-marke/50')} aria-hidden />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
