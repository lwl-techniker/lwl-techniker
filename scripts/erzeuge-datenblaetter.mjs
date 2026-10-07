/**
 * DATENBLATT-INDEX (PDF-geführte Produktpflege, Variante B)
 *
 * Die PDF-Datenblätter sind die einzige Quelle für technische Angaben. Dieses Skript liest alle Produkte aus
 * content/produkte und leitet aus dem hinterlegten PDF automatisch ab:
 *   - Prüfsumme (SHA-256), Seitenzahl, Dateigrösse
 *   - Volltext für die Suche, Textauszug, im Dokument erkannter Titel, Artikelnummern, Dokumentdatum
 *   - Vorschaubild der ersten Seite (public/dokumente/vorschau/<slug>.webp)
 *   - wenn zuverlässig erkennbar: die grösste Produktabbildung aus dem Datenblatt (<slug>-bild.webp),
 *     Briefkopf-Logos werden ausgeschlossen, weil sie in mehreren Dokumenten identisch vorkommen
 *
 * Es werden keine technischen Daten, Preise oder Beschreibungen erfunden oder interpretiert. Nicht lesbare
 * PDFs (z. B. reine Bild-PDFs) erhalten nur Vorschau und Prüfsumme; die Suche nutzt dann den Produktnamen.
 *
 * Ergebnis: src/generated/datenblaetter.json (wird committet, damit Typecheck und Tests ohne PDF-Verarbeitung laufen).
 * Unveränderte PDFs (gleiche Prüfsumme, Vorschau vorhanden) werden nicht neu verarbeitet.
 *
 * Grenzen: Dateien bis 15 MB, Text aus höchstens 6 Seiten, Bilder aus höchstens 2 Seiten, höchstens 300 Bildblöcke.
 * Läuft vor jedem Build (prebuild) und mit `npm run datenblaetter`. Benötigt nur mupdf (WASM) und sharp, keine
 * externen Dienste, keine Geheimnisse.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inhaltOrdner = path.join(wurzel, 'content', 'produkte');
const vorschauOrdner = path.join(wurzel, 'public', 'dokumente', 'vorschau');
const zielDatei = path.join(wurzel, 'src', 'generated', 'datenblaetter.json');

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_TEXT_SEITEN = 6;
const MAX_BILD_SEITEN = 2;
const MAX_BILDBLOECKE = 300;
const VORSCHAU_BREITE = 720;
const BILD_MAX = 900;

const relativ = (p) => path.relative(wurzel, p).replaceAll('\\', '/');

/** Zeilen, die zum Briefkopf oder zur Fusszeile gehören und nicht als Titel gelten */
const KOPF_FUSS = [
  /LWL-Techniker\s*\|/i,
  /^Telefon\s*:/i,
  /Technische Änderungen vorbehalten/i,
  /^\d{2}\.\d{2}\.\d{2,4}\s*\/\s*[A-Z]{2}\s*$/,
  /^DATASHEET\s*$/i,
  /^\d+\.\d+\s*$/,
  /Subject to change/i,
  /For more information visit/i,
  /^www\./i,
  /^(Seite|Page)\s+\d+/i,
];

function lesenAlt() {
  try {
    return JSON.parse(readFileSync(zielDatei, 'utf8'));
  } catch {
    return { version: 1, eintraege: {} };
  }
}

function zeilen(text) {
  return text
    .split('\n')
    .map((z) => z.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function erkenneTitel(seite1Text) {
  for (const z of zeilen(seite1Text)) {
    if (z.length < 4 || z.length > 90) continue;
    if (KOPF_FUSS.some((m) => m.test(z))) continue;
    return z;
  }
  return '';
}

function erkenneArtikelnummern(text) {
  const treffer = new Set();
  for (const t of text.matchAll(/\b([A-Z]{2,}-[A-Z0-9]{2,}(?:-[A-Z0-9]{1,8}){1,4})\b/g)) {
    treffer.add(t[1]);
    if (treffer.size >= 40) break;
  }
  return [...treffer].sort();
}

function erkenneDatum(text) {
  const t = text.match(/(\d{2})\.(\d{2})\.(\d{2,4})\s*\/\s*[A-Z]{2}\b/);
  return t ? `${t[1]}.${t[2]}.${t[3]}` : '';
}

async function verarbeite(slug, pdfPfad, bekannteBilder) {
  const buffer = readFileSync(pdfPfad);
  const pruefsumme = createHash('sha256').update(buffer).digest('hex');
  const doc = mupdf.Document.openDocument(buffer, 'application/pdf');
  const seiten = doc.countPages();
  const texte = [];
  for (let i = 0; i < Math.min(seiten, MAX_TEXT_SEITEN); i++) {
    const page = doc.loadPage(i);
    texte.push(page.toStructuredText('preserve-whitespace').asText());
  }
  const volltext = texte.join('\n');
  const text = volltext.replace(/\s+/g, ' ').trim();

  // Vorschau der ersten Seite
  const seite1 = doc.loadPage(0);
  const box = seite1.getBounds();
  const massstab = VORSCHAU_BREITE / Math.max(1, box[2] - box[0]);
  const pixmap = seite1.toPixmap(mupdf.Matrix.scale(massstab, massstab), mupdf.ColorSpace.DeviceRGB, false, true);
  mkdirSync(vorschauOrdner, { recursive: true });
  const vorschauDatei = path.join(vorschauOrdner, `${slug}.webp`);
  await sharp(Buffer.from(pixmap.asPNG())).webp({ quality: 78 }).toFile(vorschauDatei);
  const vorschauMeta = await sharp(vorschauDatei).metadata();

  // Grösste Produktabbildung (Seite 1 bevorzugt), Briefkopf-Bilder ausgeschlossen
  const kandidaten = [];
  let bloecke = 0;
  for (let i = 0; i < Math.min(seiten, MAX_BILD_SEITEN) && bloecke < MAX_BILDBLOECKE; i++) {
    const page = doc.loadPage(i);
    page.toStructuredText('preserve-images').walk({
      onImageBlock(bbox, _transform, image) {
        bloecke++;
        if (bloecke > MAX_BILDBLOECKE) return;
        try {
          const pix = image.toPixmap();
          const breite = pix.getWidth();
          const hoehe = pix.getHeight();
          if (breite < 120 || hoehe < 80) return;
          // Seitenähnliche Bilder (Scans ganzer Seiten) sind keine Produktabbildungen
          if (hoehe / breite > 1.3 && hoehe > 600) return;
          const png = Buffer.from(pix.asPNG());
          const hash = createHash('sha1').update(png).digest('hex');
          kandidaten.push({ hash, seite: i, flaeche: (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]), breite, hoehe, png });
        } catch {
          /* defekte oder unbekannte Bildformate überspringen */
        }
      },
    });
  }
  const eigene = kandidaten.filter((k) => !bekannteBilder.has(k.hash));
  const seite1Kandidaten = eigene.filter((k) => k.seite === 0);
  const auswahl = (seite1Kandidaten.length > 0 ? seite1Kandidaten : eigene).sort((a, b) => b.flaeche - a.flaeche)[0];
  let bild = null;
  if (auswahl) {
    const bildDatei = path.join(vorschauOrdner, `${slug}-bild.webp`);
    await sharp(auswahl.png).resize({ width: BILD_MAX, height: BILD_MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(bildDatei);
    const meta = await sharp(bildDatei).metadata();
    bild = { pfad: `/dokumente/vorschau/${slug}-bild.webp`, breite: meta.width, hoehe: meta.height };
  }

  // Lesbar nur, wenn ausser Briefkopf und Fusszeile Text vorhanden ist (reine Bild-PDFs haben nur den Briefkopf)
  const inhaltszeilen = zeilen(volltext).filter((z) => !KOPF_FUSS.some((m) => m.test(z)));
  const lesbar = inhaltszeilen.join(' ').length >= 60;
  return {
    pruefsumme,
    seiten,
    bytes: buffer.length,
    lesbar,
    titelImDokument: lesbar ? erkenneTitel(texte[0] ?? '') : '',
    textauszug: lesbar ? text.slice(0, 280) : '',
    suchtext: lesbar ? text.toLowerCase().slice(0, 6000) : '',
    artikelnummern: lesbar ? erkenneArtikelnummern(volltext) : [],
    dokumentdatum: lesbar ? erkenneDatum(volltext) : '',
    vorschau: { pfad: `/dokumente/vorschau/${slug}.webp`, breite: vorschauMeta.width, hoehe: vorschauMeta.height },
    bild,
    kandidatenBilder: kandidaten.map((k) => k.hash),
  };
}

/** Bilder, die in mindestens drei Dokumenten identisch vorkommen, sind Briefkopf oder Logo */
function sammleBekannteBilder(alt, aktuelleHashes) {
  const zaehler = new Map();
  const quellen = [...Object.values(alt.eintraege ?? {}).map((e) => e.kandidatenBilder ?? []), ...aktuelleHashes];
  for (const liste of quellen) for (const h of new Set(liste)) zaehler.set(h, (zaehler.get(h) ?? 0) + 1);
  return new Set([...zaehler.entries()].filter(([, n]) => n >= 3).map(([h]) => h));
}

async function main() {
  const alt = lesenAlt();
  const neu = { version: 1, eintraege: {}, hinweise: [] };
  const dateien = existsSync(inhaltOrdner) ? readdirSync(inhaltOrdner).filter((f) => f.endsWith('.json')).sort() : [];
  const produkte = dateien.map((f) => ({ slug: path.basename(f, '.json'), ...JSON.parse(readFileSync(path.join(inhaltOrdner, f), 'utf8')) }));

  // Erster Durchlauf: Briefkopf-Bilder über alle Dokumente bestimmen (nur neue oder geänderte PDFs lesen)
  const vorab = [];
  for (const p of produkte) {
    if (!p.dokument) continue;
    const pdfPfad = path.join(wurzel, 'public', p.dokument);
    if (!existsSync(pdfPfad)) continue;
    const pruefsumme = createHash('sha256').update(readFileSync(pdfPfad)).digest('hex');
    const vorher = alt.eintraege?.[p.slug];
    if (vorher?.pruefsumme === pruefsumme && vorher.kandidatenBilder) continue;
    try {
      const doc = mupdf.Document.openDocument(readFileSync(pdfPfad), 'application/pdf');
      const hashes = [];
      let bloecke = 0;
      for (let i = 0; i < Math.min(doc.countPages(), MAX_BILD_SEITEN) && bloecke < MAX_BILDBLOECKE; i++) {
        doc.loadPage(i).toStructuredText('preserve-images').walk({
          onImageBlock(_b, _t, image) {
            bloecke++;
            if (bloecke > MAX_BILDBLOECKE) return;
            try {
              hashes.push(createHash('sha1').update(Buffer.from(image.toPixmap().asPNG())).digest('hex'));
            } catch {
              /* ignorieren */
            }
          },
        });
      }
      vorab.push(hashes);
    } catch {
      /* Fehler wird im zweiten Durchlauf gemeldet */
    }
  }
  const bekannteBilder = sammleBekannteBilder(alt, vorab);

  const pruefsummen = new Map();
  let unveraendert = 0;
  let verarbeitet = 0;
  for (const p of produkte) {
    if (!p.dokument) {
      neu.hinweise.push(`${p.slug}: kein Datenblatt hinterlegt (Produkt auf Anfrage).`);
      continue;
    }
    const pdfPfad = path.join(wurzel, 'public', p.dokument);
    if (!existsSync(pdfPfad)) {
      neu.hinweise.push(`FEHLER ${p.slug}: Datei ${p.dokument} fehlt.`);
      if (alt.eintraege?.[p.slug]) neu.eintraege[p.slug] = { ...alt.eintraege[p.slug], fehler: 'Datei fehlt, letzte gültige Fassung behalten' };
      continue;
    }
    const groesse = statSync(pdfPfad).size;
    if (groesse > MAX_BYTES) {
      neu.hinweise.push(`FEHLER ${p.slug}: ${p.dokument} ist grösser als 15 MB und wird nicht verarbeitet.`);
      if (alt.eintraege?.[p.slug]) neu.eintraege[p.slug] = { ...alt.eintraege[p.slug], fehler: 'Datei zu gross, letzte gültige Fassung behalten' };
      continue;
    }
    const pruefsumme = createHash('sha256').update(readFileSync(pdfPfad)).digest('hex');
    const vorher = alt.eintraege?.[p.slug];
    const vorschauVorhanden = existsSync(path.join(vorschauOrdner, `${p.slug}.webp`)) && (!vorher?.bild || existsSync(path.join(wurzel, 'public', vorher.bild.pfad)));
    if (vorher && vorher.pruefsumme === pruefsumme && !vorher.fehler && vorschauVorhanden && vorher.dokument === p.dokument) {
      neu.eintraege[p.slug] = vorher;
      unveraendert++;
    } else {
      try {
        const ergebnis = await verarbeite(p.slug, pdfPfad, bekannteBilder);
        neu.eintraege[p.slug] = { dokument: p.dokument, ...ergebnis };
        verarbeitet++;
        if (!ergebnis.lesbar) neu.hinweise.push(`${p.slug}: PDF enthält keinen auslesbaren Text (Bild-PDF). Suche nur über Produktname und Kategorie.`);
      } catch (e) {
        neu.hinweise.push(`FEHLER ${p.slug}: PDF konnte nicht verarbeitet werden (${e.message}).`);
        if (vorher) neu.eintraege[p.slug] = { ...vorher, fehler: 'Verarbeitung fehlgeschlagen, letzte gültige Fassung behalten' };
      }
    }
    const eintrag = neu.eintraege[p.slug];
    if (eintrag) {
      const andere = pruefsummen.get(eintrag.pruefsumme);
      if (andere) neu.hinweise.push(`${p.slug}: identisches PDF wie ${andere} (gleiche Prüfsumme). In der Kennzahl zählt es nur einmal.`);
      else pruefsummen.set(eintrag.pruefsumme, p.slug);
    }
  }

  neu.eindeutigeDokumente = pruefsummen.size;
  // kandidatenBilder sind nur für die Briefkopf-Erkennung nötig und bleiben gespeichert, aber kompakt
  const sortiert = Object.fromEntries(Object.keys(neu.eintraege).sort().map((k) => [k, neu.eintraege[k]]));
  neu.eintraege = sortiert;
  mkdirSync(path.dirname(zielDatei), { recursive: true });
  writeFileSync(zielDatei, `${JSON.stringify(neu, null, 2)}\n`);

  console.log(`\nDatenblatt-Index: ${Object.keys(neu.eintraege).length} Einträge, ${neu.eindeutigeDokumente} eindeutige PDFs, ${verarbeitet} neu verarbeitet, ${unveraendert} unverändert`);
  for (const h of neu.hinweise) console.log(`  ${h.startsWith('FEHLER') ? 'FEHLER  ' : 'HINWEIS '}${h.replace(/^FEHLER /, '')}`);
  console.log(`  Ergebnis: ${relativ(zielDatei)}\n`);
  const fehler = neu.hinweise.filter((h) => h.startsWith('FEHLER'));
  if (fehler.length > 0 && process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production') {
    console.error('Produktive Veröffentlichung mit fehlerhaften Datenblättern abgebrochen.');
    process.exit(1);
  }
}

await main();
