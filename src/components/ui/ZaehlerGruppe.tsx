'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * Startet alle Zähler eines Kennzahlenbands gleichzeitig, sobald das Band ins Bild kommt.
 * Jeder Zähler erhält dieselbe Startzeit und Dauer, deshalb erreichen alle Werte im selben Moment ihr Ende.
 */
const ZaehlerKontext = createContext<{ start: number | null; dauer: number } | null>(null);

export function useZaehlerGruppe() {
  return useContext(ZaehlerKontext);
}

export function ZaehlerGruppe({ children, dauer = 2600 }: { children: React.ReactNode; dauer?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0].isIntersecting) return;
        beobachter.disconnect();
        setStart(performance.now());
      },
      { threshold: 0.3 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <ZaehlerKontext.Provider value={{ start, dauer }}>{children}</ZaehlerKontext.Provider>
    </div>
  );
}
