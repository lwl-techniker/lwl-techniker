/**
 * AUSWAHL FÜR DIE STARTSEITE (Referenzen, Stellen)
 *
 * Regel, so wie sie auch im CMS beschrieben ist:
 * 1. Markierte Einträge ("Auf Startseite zeigen") haben Vorrang, neuste zuerst.
 * 2. Freie Plätze werden automatisch mit den neusten übrigen Einträgen aufgefüllt.
 * 3. Sind mehr Einträge markiert als Plätze vorhanden, gewinnen die neusten markierten.
 *
 * Ist nichts markiert, erscheinen also einfach die neusten Einträge.
 * Markiert die Kundschaft genau so viele wie Plätze, erscheinen nur diese.
 *
 * Diese Datei hat bewusst keine Imports, damit sie mit `npm test` direkt geprüft werden kann.
 */

export type Auswahlfaehig = {
  /** ISO Datum YYYY-MM-DD */
  datum: string | null;
  aufStartseite: boolean;
};

/** Sortiert neuste zuerst. Einträge ohne Datum landen am Ende. Bei gleichem Datum stabil. */
export function neusteZuerst<T extends { datum: string | null }>(eintraege: readonly T[]): T[] {
  return [...eintraege].sort((a, b) => {
    if (!a.datum && !b.datum) return 0;
    if (!a.datum) return 1;
    if (!b.datum) return -1;
    return b.datum.localeCompare(a.datum);
  });
}

export function waehleFuerStartseite<T extends Auswahlfaehig>(eintraege: readonly T[], anzahl: number): T[] {
  if (!Number.isFinite(anzahl) || anzahl <= 0) return [];
  const sortiert = neusteZuerst(eintraege);
  const markiert = sortiert.filter((e) => e.aufStartseite);
  const uebrige = sortiert.filter((e) => !e.aufStartseite);
  return [...markiert, ...uebrige].slice(0, anzahl);
}

/** Prüft, ob eine Stelle am Stichtag noch ausgeschrieben ist. */
export function istNochGueltig(gueltigBis: string | null | undefined, heute: string): boolean {
  if (!gueltigBis) return true;
  return gueltigBis >= heute;
}
