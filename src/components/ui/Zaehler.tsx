'use client';

import { useEffect, useRef } from 'react';

/**
 * Zählt eine Kennzahl hoch, sobald sie ins Bild kommt (Zählerfunktion aus V3, Darstellung V2).
 * Unterstützte Schreibweisen aus dem CMS:
 *   "1200"        ganze Zahl
 *   "1'000+"      Schweizer Tausendertrennzeichen, Zusatz "+"
 *   "1 Mio.+"     Dezimalzahl mit Einheit und Zusatz (die Zahl vor der Einheit wird animiert)
 *   "24 h"        Zahl mit Einheit
 * Screenreader bekommen immer den stabilen Endwert. Ohne JavaScript oder bei "Bewegung reduzieren" steht sofort der Endwert.
 */
export function Zaehler({ wert }: { wert: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const treffer = wert.match(/^(\d[\d'’.]*)(.*)$/);

  useEffect(() => {
    const el = ref.current;
    if (!el || !treffer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const zahlText = treffer[1].replace(/['’]/g, '');
    const ende = Number(zahlText);
    if (!Number.isFinite(ende)) return;
    const dezimal = zahlText.includes('.') ? zahlText.split('.')[1].length : 0;
    const rest = treffer[2];
    const hatApostroph = /['’]/.test(treffer[1]);
    const formatieren = (n: number) => {
      const text = n.toLocaleString('de-CH', { minimumFractionDigits: dezimal, maximumFractionDigits: dezimal });
      // de-CH setzt ein typografisches Apostroph; den Wert aus dem CMS übernehmen wir buchstäblich
      return hatApostroph ? text.replace(/’/g, treffer[1].includes("'") ? "'" : '’') : text.replace(/’/g, '');
    };
    let gestartet = false;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0].isIntersecting || gestartet) return;
        gestartet = true;
        beobachter.disconnect();
        const dauer = 1700;
        const start = performance.now();
        const schritt = (jetzt: number) => {
          const t = Math.min((jetzt - start) / dauer, 1);
          const e = 1 - Math.pow(1 - t, 3);
          el.textContent = formatieren(Math.round(e * ende * Math.pow(10, dezimal)) / Math.pow(10, dezimal)) + rest;
          if (t < 1) requestAnimationFrame(schritt);
          else el.textContent = wert;
        };
        requestAnimationFrame(schritt);
      },
      { threshold: 0.3 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [treffer, wert]);

  return (
    <>
      <span className="sr-only">{wert}</span>
      <span ref={ref} aria-hidden>
        {wert}
      </span>
    </>
  );
}
