import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Datum der letzten Änderung je Inhaltsdatei, erzeugt von scripts/aktualisiert.mjs aus der Git-Historie.
 * Wird für "lastmod" in der Sitemap und "dateModified" in den strukturierten Daten verwendet.
 */
let daten: Record<string, string> | null = null;

function lade() {
  if (!daten) {
    try {
      daten = JSON.parse(readFileSync(path.join(process.cwd(), 'content/aktualisiert.json'), 'utf8')) as Record<string, string>;
    } catch {
      daten = {};
    }
  }
  return daten;
}

/**
 * Jüngstes Änderungsdatum der angegebenen Pfade (ISO-Zeitpunkt). Ein Pfad ohne Endung erfasst die Datei
 * und den gleichnamigen Ordner, z. B. "content/seiten/impressum" für impressum.json und impressum/bloecke/.
 */
export function aktualisiertVon(...pfade: string[]): string | undefined {
  const d = lade();
  let max: string | undefined;
  for (const p of pfade) {
    for (const [datei, datum] of Object.entries(d)) {
      if (datei === p || datei.startsWith(`${p}/`) || datei.startsWith(`${p}.`)) {
        if (!max || datum > max) max = datum;
      }
    }
  }
  return max;
}
