/**
 * BILDPRÜFUNG
 *
 * Regeln (Details in docs/06-bilder.md):
 *   Dateinamen: keine Umlaute, Leerzeichen oder Sonderzeichen (Fehler), keine Grossbuchstaben (Warnung).
 *   Formate: .webp, .jpg, .png, .svg, .avif. HEIC, TIFF, BMP und PSD sind Fehler.
 *   Grösse: Warnung ab 500 KB, Fehler ab 1.5 MB.
 *   Abmessung: Warnung ab 2560 px an der längeren Seite.
 *
 * Aufruf: npm run pruefen:bilder
 * Zu grosse Bilder verkleinern: npm run bilder:optimieren
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const oeffentlich = path.join(wurzel, 'public');
const sharp = createRequire(import.meta.url)('sharp');

const ERLAUBT = ['.webp', '.jpg', '.jpeg', '.png', '.svg', '.avif', '.ico', '.gif'];
const VERBOTEN = ['.heic', '.heif', '.tif', '.tiff', '.bmp', '.psd'];
const WARN_KB = 500;
const FEHLER_KB = 1500;
const MAX_PX = 2560;

function dateien(ordner) {
  const ergebnis = [];
  if (!existsSync(ordner)) return ergebnis;
  for (const eintrag of readdirSync(ordner)) {
    const voll = path.join(ordner, eintrag);
    if (statSync(voll).isDirectory()) ergebnis.push(...dateien(voll));
    else ergebnis.push(voll);
  }
  return ergebnis;
}

const fehler = [];
const warnungen = [];
let anzahl = 0;
let gesamtKb = 0;

for (const datei of dateien(oeffentlich)) {
  const rel = path.relative(oeffentlich, datei).replaceAll('\\', '/');
  const endung = path.extname(datei);
  if (VERBOTEN.includes(endung.toLowerCase())) {
    fehler.push(`${rel}  Format ${endung} wird von Browsern nicht zuverlässig angezeigt. Als JPG oder WebP exportieren und neu hochladen`);
    continue;
  }
  if (!ERLAUBT.includes(endung.toLowerCase())) continue;
  anzahl++;

  const ohneEndung = rel.slice(0, rel.length - endung.length);
  if (!/^[a-zA-Z0-9/_.-]+$/.test(ohneEndung)) {
    fehler.push(`${rel}  Dateiname oder Ordner enthält Leerzeichen, Umlaute oder Sonderzeichen`);
  } else if (/[A-Z]/.test(ohneEndung)) {
    // Funktioniert, solange der Verweis exakt gleich geschrieben ist (prüft pruefe-konfiguration.mjs)
    warnungen.push(`${rel}  Grossbuchstaben im Dateinamen, besser klein schreiben`);
  }
  if (endung !== endung.toLowerCase()) warnungen.push(`${rel}  Endung in Grossbuchstaben. Funktioniert, besser das Bild mit kleiner Endung neu hochladen`);
  if (endung.toLowerCase() === '.gif') warnungen.push(`${rel}  GIF ist veraltet, WebP oder ein Video verwenden`);

  const kb = Math.round(statSync(datei).size / 1024);
  gesamtKb += kb;
  if (kb >= FEHLER_KB) fehler.push(`${rel}  ${kb} KB, viel zu gross (npm run bilder:optimieren)`);
  else if (kb >= WARN_KB) warnungen.push(`${rel}  ${kb} KB, grösser als ${WARN_KB} KB (npm run bilder:optimieren)`);

  if (!['.svg', '.ico'].includes(endung.toLowerCase())) {
    try {
      const { width = 0, height = 0 } = await sharp(datei).metadata();
      if (Math.max(width, height) > MAX_PX) warnungen.push(`${rel}  ${width} x ${height} px, grösser als ${MAX_PX} px (npm run bilder:optimieren)`);
    } catch {
      fehler.push(`${rel}  Datei ist beschädigt oder kein gültiges Bild`);
    }
  }
}

console.log(`\nBildprüfung: ${anzahl} Bilder, zusammen ${(gesamtKb / 1024).toFixed(1)} MB`);
for (const w of warnungen) console.log(`  WARNUNG  ${w}`);
for (const f of fehler) console.log(`  FEHLER   ${f}`);
if (fehler.length === 0 && warnungen.length === 0) console.log('  OK       alle Bilder in Ordnung');
console.log('');

if (fehler.length > 0) {
  console.error(`${fehler.length} Bildfehler gefunden.\n`);
  process.exit(1);
}
