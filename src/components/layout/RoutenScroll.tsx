'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Setzt die Bildlaufposition bei jedem Routenwechsel sofort auf den Seitenanfang (Verhalten aus V3).
 *
 * Hintergrund: In V2 stand `scroll-behavior: smooth` auf <html>. Beim Wechsel auf eine andere Seite erschien die
 * neue Seite deshalb zuerst an der alten Position und scrollte sichtbar nach oben. V4 verzichtet auf globales
 * Smooth-Scrolling; Sprungmarken innerhalb einer Seite werden in src/components/ui/Sprungmarke.tsx weich gescrollt.
 *
 * Unterschieden werden:
 * - normale Navigation (hier: sofort nach oben)
 * - bewusste Sprungmarken (#anker in der Adresse: Position nicht anfassen, der Browser springt zum Anker)
 * - Zurück/Vorwärts im Browser (Next.js stellt die alte Position selbst wieder her; wir greifen nur bei einem
 *   "normalen" Wechsel ein, den wir am geänderten Pfad erkennen, der Browser-Verlauf ruft kein popstate hier auf)
 * - Filteränderungen über Suchparameter lösen keinen Pfadwechsel aus und bleiben unberührt.
 */
export function RoutenScroll() {
  const pfad = usePathname();
  const vorher = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (vorher.current === null) {
      // Erstes Laden: Browser-Wiederherstellung (z. B. F5) nicht zurücksetzen
      vorher.current = pfad;
      return;
    }
    if (vorher.current === pfad) return;
    vorher.current = pfad;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pfad]);

  return null;
}
