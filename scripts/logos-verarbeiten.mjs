/**
 * FIRMENLOGOS AUFBEREITEN
 *
 * Erzeugt aus den Originalen der Kundschaft (Ordner logos-quellen, Dateiname = Kurzname der Firma)
 * zwei Varianten für das Logo-Band auf der Startseite:
 *
 *   weiss    public/bilder/statisch/logos/<kurzname>.png         reine weisse Silhouette, durchsichtiger Hintergrund
 *   farbig   public/bilder/statisch/logos-farbig/<kurzname>.webp  Originalfarben, zugeschnitten, durchsichtiger Hintergrund
 *
 * Hintergrund erkennen: Aus einem schmalen Rand rund um das Bild werden die häufigsten Farben bestimmt.
 * Farben, die nur an wenigen Stellen den Rand berühren (zum Beispiel ein Buchstabe am Bildrand),
 * zählen nicht zum Hintergrund. Bei hellem Hintergrund gelten nur helle Nebenfarben (Verläufe),
 * bei farbigem Hintergrund nur ähnliche Farben.
 *
 * Aufruf:
 *   node scripts/logos-verarbeiten.mjs weiss            alle Logos
 *   node scripts/logos-verarbeiten.mjs farbig ubs coop  nur diese Kurznamen
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUELLE = path.join(wurzel, 'logos-quellen');
const ZIEL_WEISS = path.join(wurzel, 'public', 'bilder', 'statisch', 'logos');
const ZIEL_FARBIG = path.join(wurzel, 'public', 'bilder', 'statisch', 'logos-farbig');
/** Rundes Mehrfarb-Badge ohne Rand, ergibt keine erkennbare weisse Silhouette. */
const AUSGESCHLOSSEN = new Set(['lidl']);

const modus = process.argv[2];
const gewuenscht = process.argv.slice(3);
if (modus !== 'weiss' && modus !== 'farbig') {
  console.error('Aufruf: node scripts/logos-verarbeiten.mjs weiss|farbig [kurzname ...]');
  process.exit(1);
}

const abstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hell = (f) => 0.299 * f[0] + 0.587 * f[1] + 0.114 * f[2];

/** Hintergrundfarben aus einem schmalen Randstreifen (Kübel von 16), höchstens drei, ohne Logo-Farben. */
function randFarben(daten, w, h) {
  const zaehler = new Map();
  const rand = Math.max(3, Math.round(Math.min(w, h) * 0.025));
  let gesamt = 0;
  const zaehlen = (x, y) => {
    const i = (y * w + x) * 3;
    const schluessel = [daten[i], daten[i + 1], daten[i + 2]].map((v) => Math.round(v / 16) * 16).join(',');
    zaehler.set(schluessel, (zaehler.get(schluessel) || 0) + 1);
    gesamt++;
  };
  for (let x = 0; x < w; x++) for (let y = 0; y < rand; y++) { zaehlen(x, y); zaehlen(x, h - 1 - y); }
  for (let y = 0; y < h; y++) for (let x = 0; x < rand; x++) { zaehlen(x, y); zaehlen(w - 1 - x, y); }
  const sortiert = [...zaehler.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ farbe: k.split(',').map(Number), n }));
  const erste = sortiert[0].farbe;
  const heller = hell(erste) > 200;
  const ergebnis = [erste];
  for (const { farbe, n } of sortiert.slice(1, 3)) {
    if (n < gesamt * 0.12) continue;
    if (heller ? hell(farbe) > 170 : abstand(farbe, erste) < 60) ergebnis.push(farbe);
  }
  return { farben: ergebnis, heller };
}

/**
 * Kleinster Abstand jedes Pixels zu den Hintergrundfarben.
 * Bei hellem Hintergrund zählen zusätzlich helle, farblose Grautöne als Hintergrund (Verläufe von Weiss nach Hellgrau).
 */
function abstandZumHintergrund(weich, w, h, farben, heller) {
  const nah = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const px = [weich[p * 3], weich[p * 3 + 1], weich[p * 3 + 2]];
    let best = Infinity;
    for (const f of farben) best = Math.min(best, abstand(px, f));
    if (heller && hell(px) > 165) best = Math.min(best, (Math.max(...px) - Math.min(...px)) * 2);
    nah[p] = best;
  }
  return nah;
}

async function weiss(name, pfad) {
  const { data, info } = await sharp(pfad).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let durchsichtig = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) durchsichtig++;
  const echteTransparenz = durchsichtig / (w * h) > 0.005;
  const aus = Buffer.alloc(w * h * 4, 255);

  if (echteTransparenz) {
    for (let p = 0; p < w * h; p++) aus[p * 4 + 3] = data[p * 4 + 3];
  } else {
    const weich = await sharp(pfad).flatten({ background: '#ffffff' }).removeAlpha().blur(0.7).raw().toBuffer();
    const { farben, heller } = randFarben(weich, w, h);
    const nah = abstandZumHintergrund(weich, w, h, farben, heller);
    const NIEDRIG = 26;
    const HOCH = 72;
    for (let p = 0; p < w * h; p++) {
      const t = Math.max(0, Math.min(1, (nah[p] - NIEDRIG) / (HOCH - NIEDRIG)));
      aus[p * 4 + 3] = Math.round(t * 255);
    }
  }

  mkdirSync(ZIEL_WEISS, { recursive: true });
  await sharp(aus, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 10 })
    .resize({ height: 112 })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(ZIEL_WEISS, `${name}.png`));
  console.log(`weiss: ${name} (${echteTransparenz ? 'mit Transparenz' : 'ohne Transparenz'})`);
}

async function farbig(name, pfad) {
  const { data, info } = await sharp(pfad).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let durchsichtig = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) durchsichtig++;
  const echteTransparenz = durchsichtig / (w * h) > 0.005;

  const aus = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    aus[p * 4] = data[p * 4];
    aus[p * 4 + 1] = data[p * 4 + 1];
    aus[p * 4 + 2] = data[p * 4 + 2];
  }

  let nah;
  if (echteTransparenz) {
    for (let p = 0; p < w * h; p++) aus[p * 4 + 3] = data[p * 4 + 3];
    nah = new Float32Array(w * h);
    for (let p = 0; p < w * h; p++) nah[p] = data[p * 4 + 3] > 10 ? 100 : 0;
  } else {
    const weich = await sharp(pfad).flatten({ background: '#ffffff' }).removeAlpha().blur(0.7).raw().toBuffer();
    const { farben, heller } = randFarben(weich, w, h);
    nah = abstandZumHintergrund(weich, w, h, farben, heller);
    const NIEDRIG = 22;
    const HOCH = 60;
    for (let p = 0; p < w * h; p++) {
      const t = Math.max(0, Math.min(1, (nah[p] - NIEDRIG) / (HOCH - NIEDRIG)));
      aus[p * 4 + 3] = Math.round(t * 255);
    }
    // Farbe an halbdurchsichtigen Rändern vom Hintergrund befreien (sonst schimmert er als heller Rand durch),
    // klassische Entmischung: beobachtete Farbe ist eine Mischung aus Logo und Hintergrund.
    for (let p = 0; p < w * h; p++) {
      const a = aus[p * 4 + 3] / 255;
      if (a <= 0.03 || a >= 0.97) continue;
      const bg = farben[0];
      for (let k = 0; k < 3; k++) {
        const beobachtet = data[p * 4 + k];
        aus[p * 4 + k] = Math.max(0, Math.min(255, Math.round(bg[k] + (beobachtet - bg[k]) / a)));
      }
    }
  }

  // Umriss des Logos aus deutlichen Abweichungen vom Hintergrund
  const zeilen = new Uint32Array(h);
  const spalten = new Uint32Array(w);
  for (let p = 0; p < w * h; p++) {
    if (nah[p] > 40) { zeilen[Math.floor(p / w)]++; spalten[p % w]++; }
  }
  const minZ = Math.max(2, Math.round(w * 0.002));
  const minS = Math.max(2, Math.round(h * 0.002));
  let y0 = 0, y1 = h - 1, x0 = 0, x1 = w - 1;
  while (y0 < h - 1 && zeilen[y0] < minZ) y0++;
  while (y1 > y0 && zeilen[y1] < minZ) y1--;
  while (x0 < w - 1 && spalten[x0] < minS) x0++;
  while (x1 > x0 && spalten[x1] < minS) x1--;

  const bh = y1 - y0 + 1;
  const padY = Math.round(bh * 0.06);
  const padX = Math.round(bh * 0.1);
  const links = Math.max(0, x0 - padX);
  const oben = Math.max(0, y0 - padY);
  const rechts = Math.min(w, x1 + 1 + padX);
  const unten = Math.min(h, y1 + 1 + padY);

  mkdirSync(ZIEL_FARBIG, { recursive: true });
  // Zuschneiden und Rand ergänzen in einem eigenen Schritt, weil sharp beim Verkleinern zuerst skaliert und danach ergänzt
  const zugeschnitten = await sharp(aus, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: links, top: oben, width: rechts - links, height: unten - oben })
    .extend({
      top: Math.max(0, padY - (y0 - oben)),
      bottom: Math.max(0, padY - (unten - (y1 + 1))),
      left: Math.max(0, padX - (x0 - links)),
      right: Math.max(0, padX - (rechts - (x1 + 1))),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 1 })
    .toBuffer();
  await sharp(zugeschnitten)
    .resize({ height: 160 })
    .webp({ quality: 92 })
    .toFile(path.join(ZIEL_FARBIG, `${name}.webp`));
  console.log(`farbig: ${name} (${echteTransparenz ? 'mit Transparenz' : 'ohne Transparenz'})`);
}

if (!existsSync(QUELLE)) {
  console.error('Ordner logos-quellen fehlt.');
  process.exit(1);
}
const dateien = readdirSync(QUELLE).filter((f) => {
  const name = path.parse(f).name;
  if (!/\.(png|jpe?g|webp)$/i.test(f) || AUSGESCHLOSSEN.has(name)) return false;
  return gewuenscht.length === 0 || gewuenscht.includes(name);
});
for (const datei of dateien) {
  const name = path.parse(datei).name;
  const pfad = path.join(QUELLE, datei);
  await (modus === 'weiss' ? weiss(name, pfad) : farbig(name, pfad));
}
console.log(`${dateien.length} Logos verarbeitet (${modus}).`);
