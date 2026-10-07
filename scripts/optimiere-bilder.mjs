/**
 * BILDER OPTIMIEREN
 *
 * Verkleinert alle JPG, PNG und WebP in public/ auf maximal 2560 px und komprimiert sie neu,
 * wenn sie grösser als 500 KB oder 2560 px sind. Dateiname und Endung bleiben gleich,
 * damit alle Verweise im CMS weiter funktionieren.
 *
 * Vorher committen, damit die Originale in Git erhalten bleiben.
 * Aufruf: npm run bilder:optimieren
 */
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(import.meta.url)('sharp');
const MAX_PX = 2560;
const GRENZE_KB = 500;

function dateien(ordner) {
  const ergebnis = [];
  if (!existsSync(ordner)) return ergebnis;
  for (const eintrag of readdirSync(ordner)) {
    const voll = path.join(ordner, eintrag);
    if (statSync(voll).isDirectory()) ergebnis.push(...dateien(voll));
    else if (/\.(jpe?g|png|webp)$/i.test(eintrag)) ergebnis.push(voll);
  }
  return ergebnis;
}

let gespart = 0;
let bearbeitet = 0;

for (const datei of dateien(path.join(wurzel, 'public'))) {
  const vorher = statSync(datei).size;
  const bild = sharp(datei, { failOn: 'none' }).rotate();
  const { width = 0, height = 0 } = await bild.metadata();
  if (vorher / 1024 < GRENZE_KB && Math.max(width, height) <= MAX_PX) continue;

  let pipeline = bild.resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true });
  const endung = path.extname(datei).toLowerCase();
  if (endung === '.png') pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 85 });
  else if (endung === '.webp') pipeline = pipeline.webp({ quality: 80 });
  else pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });

  const puffer = await pipeline.toBuffer();
  if (puffer.length < vorher) {
    writeFileSync(datei, puffer);
    gespart += vorher - puffer.length;
    bearbeitet++;
    console.log(`  ${path.relative(wurzel, datei)}  ${Math.round(vorher / 1024)} KB auf ${Math.round(puffer.length / 1024)} KB`);
  }
}

console.log(`\n${bearbeitet} Bilder optimiert, ${(gespart / 1024 / 1024).toFixed(1)} MB gespart.\n`);
