/**
 * ZENTRALE PROJEKT-EINSTELLUNGEN (V4)
 *
 * Einzige Stelle, die pro Projekt angepasst wird, bevor Keystatic, GitHub und Netlify verbunden werden.
 * `npm run pruefen:konfiguration` kontrolliert die Werte.
 *
 * Wichtig: Diese Datei darf keine Imports enthalten. Sie wird auch direkt von den Prüfskripten gelesen.
 */

/** Anzeigename des Projekts (Kopfzeile in Keystatic, Ersatz für den SEO-Titel). */
export const PROJEKT_NAME = 'LWL-Techniker Schweiz GmbH';

/**
 * Kanonische Adresse ohne Schrägstrich am Ende.
 * Vorschau: Netlify-Adresse von V4. Produktiv: SITE_URL=https://www.lwl-techniker.ch als Umgebungsvariable setzen,
 * sobald die Domain auf V4 zeigt. V2 bleibt davon unberührt.
 */
export const DOMAIN = process.env.SITE_URL || 'https://lwl-techniker-v4.netlify.app';

/** GitHub-Repository im Format besitzer/repo-name. Einziges Schreibziel des CMS. Niemals V2 oder V3 eintragen. */
export const GITHUB_REPO = 'lwl-techniker/lwl-techniker';

/** Repositories, in die das CMS nie schreiben darf (Prüfung in scripts/verify-write-target.mjs). */
export const GESCHUETZTE_REPOS = ['infraoneit/lwl-techniker-v2', 'infraoneit/lwl-techniker-v3'];

/**
 * SPEICHERMODUS VON KEYSTATIC
 * 'automatisch'  Empfohlen. Lokal (npm run dev) in Dateien, auf Netlify über GitHub.
 * 'lokal'        Erzwingt lokales Speichern, auch im Build. Auf Netlify verboten.
 * 'github'       Erzwingt GitHub auch lokal (nur zum Einrichten der GitHub-App).
 */
export const KEYSTATIC_MODUS: 'automatisch' | 'lokal' | 'github' = 'automatisch';

/**
 * Indexierung: nur freigeben, wenn SITE_INDEXABLE=true gesetzt ist UND der Build im Netlify-Production-Kontext läuft.
 * Vorschauen von V4 bleiben so auf noindex, bis die Umstellung auf die Firmendomain entschieden ist.
 */
export const INDEXIERBAR = process.env.SITE_INDEXABLE === 'true' && process.env.CONTEXT === 'production';

/** Sprache für <html lang> und Open Graph. */
export const SPRACHE = 'de-CH';
export const OG_LOCALE = 'de_CH';
