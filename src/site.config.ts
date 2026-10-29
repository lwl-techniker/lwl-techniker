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
 * Kanonische Adresse ohne Schrägstrich am Ende (Canonical, Sitemap, llms.txt, strukturierte Daten).
 * Reihenfolge: SITE_URL (falls gesetzt), sonst im produktiven Netlify-Build die Primary Domain aus der
 * Netlify-Variable URL (nur wenn es eine eigene Domain ist, nicht *.netlify.app), sonst die Netlify-Adresse.
 * Seit 29. Oktober 2026 braucht es damit keine SITE_URL mehr, sobald in Netlify eine Primary Domain gesetzt ist.
 */
const netlifyProduktiv = process.env.CONTEXT === 'production';
const netlifyAdresse = (process.env.URL || '').replace(/\/$/, '');
const eigeneDomain = netlifyProduktiv && /^https:\/\/[^/]+$/.test(netlifyAdresse) && !netlifyAdresse.endsWith('.netlify.app') ? netlifyAdresse : '';
export const DOMAIN = process.env.SITE_URL || eigeneDomain || 'https://lwl-techniker.netlify.app';

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
 * Indexierung (robots.txt, Sitemap-Verweis): frei im produktiven Netlify-Build, sobald eine eigene Domain die
 * Primary Domain ist oder SITE_INDEXABLE=true gesetzt wurde. SITE_INDEXABLE=false sperrt ausdrücklich.
 * Vorschauen, Branch-Deploys und die reine Netlify-Adresse bleiben gesperrt.
 */
export const INDEXIERBAR = netlifyProduktiv && process.env.SITE_INDEXABLE !== 'false' && (process.env.SITE_INDEXABLE === 'true' || eigeneDomain !== '');

/** Sprache für <html lang> und Open Graph. */
export const SPRACHE = 'de-CH';
export const OG_LOCALE = 'de_CH';
