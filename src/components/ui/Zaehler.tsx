'use client';

import { useEffect, useRef } from 'react';
import { useZaehlerGruppe } from './ZaehlerGruppe';

/**
 * Zählt eine Kennzahl hoch, sobald sie ins Bild kommt (Zählerfunktion aus V3, Darstellung V2).
 * Unterstützte Schreibweisen aus dem CMS:
 *   "1200"        ganze Zahl
 *   "1'000+"      Schweizer Tausendertrennzeichen, Zusatz "+"
 *   "1 Mio.+"     Zahl mit Einheit und Zusatz; kleine Zahlen mit Einheit zählen mit einer Dezimalstelle hoch (0.4 Mio.+)
 *   "24 h"        Zahl mit Einheit
 * Innerhalb einer ZaehlerGruppe starten alle Zähler gleichzeitig und enden im selben Moment (gemeinsame Dauer).
 * Screenreader bekommen immer den stabilen Endwert. Ohne JavaScript steht sofort der Endwert,
 * bei "Bewegung reduzieren" zählt die Zahl kürzer hoch (sanfter statt aus).
 */
export function Zaehler({ wert }: { wert: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const gruppe = useZaehlerGruppe();
  const treffer = wert.match(/^(\d[\d'’.]*)(.*)$/);
  const start = gruppe?.start ?? null;
  const dauerGruppe = gruppe?.dauer ?? 2600;
  const inGruppe = gruppe !== null;

  useEffect(() => {
    const el = ref.current;
    if (!el || !treffer) return;
    if (inGruppe && start === null) return;
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const zahlText = treffer[1].replace(/['’]/g, '');
    const ende = Number(zahlText);
    if (!Number.isFinite(ende)) return;
    const rest = treffer[2];
    // Kleine Zahlen mit Einheit (z. B. "1 Mio.") zählen mit einer Dezimalstelle, sonst springen sie sofort auf den Endwert
    const dezimal = zahlText.includes('.') ? zahlText.split('.')[1].length : ende < 10 && rest.trim() ? 1 : 0;
    const hatApostroph = /['’]/.test(treffer[1]);
    const formatieren = (n: number) => {
      const text = n.toLocaleString('de-CH', { minimumFractionDigits: dezimal, maximumFractionDigits: dezimal });
      // de-CH setzt ein typografisches Apostroph; den Wert aus dem CMS übernehmen wir buchstäblich
      return hatApostroph ? text.replace(/’/g, treffer[1].includes("'") ? "'" : '’') : text.replace(/’/g, '');
    };
    const dauer = ruhig ? Math.round(dauerGruppe * 0.5) : dauerGruppe;
    let anfrage = 0;
    let gestartet = false;

    const laufen = (startZeit: number) => {
      const schritt = (jetzt: number) => {
        const t = Math.min((jetzt - startZeit) / dauer, 1);
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = formatieren(Math.round(e * ende * Math.pow(10, dezimal)) / Math.pow(10, dezimal)) + rest;
        if (t < 1) anfrage = requestAnimationFrame(schritt);
        else el.textContent = wert;
      };
      anfrage = requestAnimationFrame(schritt);
    };

    if (inGruppe) {
      laufen(start as number);
      return () => cancelAnimationFrame(anfrage);
    }

    // Ohne Gruppe: eigener Beobachter wie bisher
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0].isIntersecting || gestartet) return;
        gestartet = true;
        beobachter.disconnect();
        laufen(performance.now());
      },
      { threshold: 0.3 }
    );
    beobachter.observe(el);
    return () => {
      beobachter.disconnect();
      cancelAnimationFrame(anfrage);
    };
  }, [treffer, wert, start, dauerGruppe, inGruppe]);

  return (
    <>
      <span className="sr-only">{wert}</span>
      <span ref={ref} aria-hidden>
        {wert}
      </span>
    </>
  );
}
