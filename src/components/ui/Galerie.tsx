'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { BildOhneBeschnitt } from './BildOhneBeschnitt';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

export type Folie =
  | { art: 'bild'; bild: string; alt: string }
  | { art: 'video'; src: string; poster: string | null; text: string };

/**
 * Karussell für Bilder und ein Video: eine Folie pro Ansicht, Pfeile und Punkte zum Wechseln, auf dem Handy
 * auch mit dem Finger wischbar (CSS scroll-snap). Ein Video steht als erste Folie, zeigt vorher nur sein Standbild
 * mit Abspielsymbol und lädt erst beim Klick (preload="none"); beim Weiterblättern wird es angehalten.
 * Bewegung reduzieren macht das Springen zwischen Folien sofort statt weich (globale Regel in globals.css).
 */
export function Galerie({ folien, bilder }: { folien?: readonly Folie[]; bilder?: readonly { bild: string; alt: string }[] }) {
  const eintraege: readonly Folie[] = folien ?? (bilder ?? []).map((b) => ({ art: 'bild', ...b }));
  const spur = useRef<HTMLDivElement>(null);
  const folienRefs = useRef<(HTMLDivElement | null)[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  const [aktiv, setAktiv] = useState(0);
  const [videoGestartet, setVideoGestartet] = useState(false);

  useEffect(() => {
    const spurEl = spur.current;
    if (!spurEl || eintraege.length < 2) return;
    const beobachter = new IntersectionObserver(
      (liste) => {
        const sichtbarste = liste.reduce((max, e) => (e.intersectionRatio > (max?.intersectionRatio ?? 0) ? e : max), liste[0]);
        if (!sichtbarste?.isIntersecting) return;
        const index = folienRefs.current.findIndex((f) => f === sichtbarste.target);
        if (index >= 0) setAktiv(index);
      },
      { root: spurEl, threshold: 0.6 }
    );
    folienRefs.current.forEach((f) => f && beobachter.observe(f));
    return () => beobachter.disconnect();
  }, [eintraege.length]);

  // Beim Verlassen der Videofolie anhalten
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const videoIndex = eintraege.findIndex((f) => f.art === 'video');
    if (aktiv !== videoIndex && !v.paused) v.pause();
  }, [aktiv, eintraege]);

  if (eintraege.length === 0) return null;

  const zu = (index: number) => spur.current?.scrollTo({ left: folienRefs.current[index]?.offsetLeft ?? 0 });
  const bezeichnung = (f: Folie, i: number) => `${f.art === 'video' ? 'Video' : 'Bild'} ${i + 1} von ${eintraege.length}`;

  return (
    <div className="relative" role="region" aria-roledescription="Karussell" aria-label="Bilder und Video">
      <div ref={spur} tabIndex={0} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {eintraege.map((f, i) => (
          <div
            key={i}
            ref={(el) => {
              folienRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="Folie"
            aria-label={bezeichnung(f, i)}
            className="relative aspect-[16/9] w-full shrink-0 snap-center lg:aspect-[21/9] overflow-hidden rounded-[var(--radius-karte)] bg-flaeche"
          >
            {f.art === 'bild' ? (
              <BildOhneBeschnitt src={f.bild} alt={f.alt} sizes="(min-width: 2400px) 2304px, 100vw" prioritaet={i === 0} />
            ) : (
              <>
                {/* Unscharfes Standbild füllt den Rand, das Hochformat-Video steht vollständig in der Mitte */}
                {f.poster ? <Image src={f.poster} alt="" aria-hidden fill sizes="100vw" className="scale-110 object-cover opacity-50 blur-2xl" /> : null}
                <video
                  ref={video}
                  controls={videoGestartet}
                  preload="none"
                  playsInline
                  poster={f.poster ?? undefined}
                  onPlay={() => setVideoGestartet(true)}
                  className="absolute inset-0 h-full w-full object-contain"
                  aria-label={sauberText(f.text) || 'Video zur Referenz'}
                >
                  <source src={f.src} type="video/mp4" />
                  Ihr Browser kann dieses Video nicht abspielen. <a href={f.src}>Video herunterladen</a>
                </video>
                {!videoGestartet ? (
                  <button
                    type="button"
                    onClick={() => {
                      setVideoGestartet(true);
                      void video.current?.play();
                    }}
                    className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
                    aria-label={`Video abspielen${f.text ? `: ${sauberText(f.text)}` : ''}`}
                  >
                    <span className="flex size-16 items-center justify-center rounded-full bg-marke text-text-dunkel shadow-[0_10px_30px_rgba(8,17,46,0.45)] transition-transform group-hover:scale-105 lg:size-20" aria-hidden>
                      <Play className="ml-1 size-7 lg:size-8" fill="currentColor" strokeWidth={0} />
                    </span>
                    {f.text ? (
                      <span className="max-w-md rounded-full bg-flaeche-dunkel/80 px-4 py-1.5 text-sm text-text-hell backdrop-blur-md" aria-hidden>
                        {sauberText(f.text)}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>

      {eintraege.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => zu(Math.max(0, aktiv - 1))}
            disabled={aktiv === 0}
            className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-marke/30 bg-flaeche-dunkel/80 text-marke backdrop-blur-md transition-opacity hover:border-marke disabled:pointer-events-none disabled:opacity-0 lg:left-5"
            aria-label="Vorherige Folie"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => zu(Math.min(eintraege.length - 1, aktiv + 1))}
            disabled={aktiv === eintraege.length - 1}
            className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-marke/30 bg-flaeche-dunkel/80 text-marke backdrop-blur-md transition-opacity hover:border-marke disabled:pointer-events-none disabled:opacity-0 lg:right-5"
            aria-label="Nächste Folie"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>

          <div className="mt-2 flex justify-center" role="tablist" aria-label="Folie wählen">
            {eintraege.map((f, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === aktiv}
                aria-label={bezeichnung(f, i)}
                onClick={() => zu(i)}
                className="group inline-flex size-11 items-center justify-center"
              >
                {f.art === 'video' ? (
                  <Play className={cn('size-3 transition-colors', i === aktiv ? 'text-marke' : 'text-linie group-hover:text-marke/50')} fill="currentColor" strokeWidth={0} aria-hidden />
                ) : (
                  <span className={cn('block size-2.5 rounded-full transition-colors', i === aktiv ? 'bg-marke' : 'bg-linie group-hover:bg-marke/50')} aria-hidden />
                )}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
