'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

/**
 * Video einer Referenz: wird erst beim Abspielen geladen (preload="none"), vorher nur das Standbild mit
 * Abspielsymbol. Bremst die Seite deshalb nicht. Hochformat-Videos (Handy) bleiben in einer schmalen Spalte,
 * Querformat füllt die Breite. Nach dem Start übernehmen die Bedienelemente des Browsers (Tastatur, Screenreader).
 */
export function Video({ src, poster, beschreibung, hochformat }: { src: string; poster: string | null; beschreibung: string; hochformat?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [gestartet, setGestartet] = useState(false);
  const text = sauberText(beschreibung);

  return (
    <figure className={hochformat ? 'w-full max-w-sm' : 'w-full'}>
      <div className={cn('relative overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche-dunkel', hochformat ? 'aspect-[9/16]' : 'aspect-video')}>
        <video
          ref={ref}
          controls={gestartet}
          preload="none"
          playsInline
          poster={poster ?? undefined}
          onPlay={() => setGestartet(true)}
          className="absolute inset-0 h-full w-full object-contain"
          aria-label={text || 'Video zur Referenz'}
        >
          <source src={src} type="video/mp4" />
          Ihr Browser kann dieses Video nicht abspielen. <a href={src}>Video herunterladen</a>
        </video>
        {!gestartet ? (
          <button
            type="button"
            onClick={() => {
              setGestartet(true);
              void ref.current?.play();
            }}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`Video abspielen${text ? `: ${text}` : ''}`}
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-marke text-text-dunkel shadow-[0_10px_30px_rgba(8,17,46,0.45)] transition-transform group-hover:scale-105 lg:size-20" aria-hidden>
              <Play className="ml-1 size-7 lg:size-8" fill="currentColor" strokeWidth={0} />
            </span>
          </button>
        ) : null}
      </div>
      {text ? <figcaption className="mt-3 text-sm text-text-leise">{text}</figcaption> : null}
    </figure>
  );
}
