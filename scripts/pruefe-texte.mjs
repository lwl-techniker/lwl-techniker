/**
 * TEXTPRÜFUNG
 *
 * Texte sollen Vertrauen aufbauen und nicht nach KI oder Werbung klingen.
 * Diese Prüfung findet, was sich automatisch finden lässt. Sie ersetzt das Gegenlesen nicht.
 *
 * FEHLER (müssen behoben werden):
 *   scharfes S, Gedankenstriche (Halbgeviert, Geviert, " - " als Einschub), mehrfache Ausrufezeichen
 * WARNUNGEN (einzeln beurteilen):
 *   Floskeln aus der Liste unten, Ausrufezeichen in Inhalten, Superlative
 *
 * Aufruf: npm run pruefen:texte
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Diese Datei liegt in scripts/ und wird selbst nicht geprüft
const SCHARFES_S = /[ßẞ]/;
const GEDANKENSTRICH = /[–—]/;
const STRICH_ALS_EINSCHUB = /[^\s|]\s-\s[^\s-]/;

/**
 * Floskeln, die austauschbar, übertrieben oder typisch für generierte Texte sind.
 * Liste bei Bedarf ergänzen. Kleinschreibung, Teilwörter werden gefunden.
 */
const FLOSKELN = [
  'in der heutigen',
  'heutzutage',
  'in einer welt',
  'revolutionär',
  'bahnbrechend',
  'nahtlos',
  'massgeschneidert',
  'ganzheitlich',
  'innovative lösung',
  'innovativen lösung',
  'lösungen aus einer hand',
  'alles aus einer hand',
  'ihr zuverlässiger partner',
  'ihr kompetenter partner',
  'ihr partner für',
  'wir bieten ihnen',
  'mehrwert',
  'synergie',
  'state of the art',
  'erstklassig',
  'unschlagbar',
  'top qualität',
  'höchste qualität',
  'höchster qualität',
  'rundum sorglos',
  'leidenschaft',
  'mit herzblut',
  'auf ein neues level',
  'nächste level',
  'entdecken sie',
  'tauchen sie ein',
  'lassen sie sich inspirieren',
  'optimal',
  'perfekt',
  'einzigartig',
  'modernste',
  'zukunftsweisend',
  'kundenorientiert',
  'kundenzufriedenheit steht',
  'zögern sie nicht',
  'wir freuen uns darauf, von ihnen zu hören',
];

const PRUEFORTE = [
  { ordner: 'content', endungen: ['.json', '.mdoc', '.md', '.yaml'], inhalt: true },
  { ordner: 'src', endungen: ['.ts', '.tsx', '.json'], inhalt: false },
  { ordner: 'docs', endungen: ['.md'], inhalt: false },
  // AGENTS.md fehlt bewusst: Next.js schreibt dort bei "next dev" einen eigenen englischen Block hinein.
  { ordner: '.', endungen: ['README.md', 'CLAUDE.md'], inhalt: false, flach: true },
];

function dateien(ordner, endungen, flach = false) {
  const ergebnis = [];
  if (!existsSync(ordner)) return ergebnis;
  for (const eintrag of readdirSync(ordner)) {
    const voll = path.join(ordner, eintrag);
    if (statSync(voll).isDirectory()) {
      if (!flach && !['node_modules', '.next', '.git', 'generated', '.reference', '.qa'].includes(eintrag)) ergebnis.push(...dateien(voll, endungen));
    } else if (endungen.some((e) => eintrag.endsWith(e))) ergebnis.push(voll);
  }
  return ergebnis;
}

/**
 * Im Build (--build) sind Verstösse in Inhalten nur Warnungen: Die Website korrigiert scharfes S und
 * Gedankenstriche beim Ausgeben automatisch (src/lib/text.ts), und eine Kundin soll wegen eines
 * Gedankenstrichs nicht ihre ganze Änderung blockieren. Verstösse im Code und in der Doku bleiben Fehler.
 */
const imBuild = process.argv.includes('--build');

const fehler = [];
const warnungen = [];
let anzahl = 0;

/** Entfernt Inline Code (`...`), URLs und Aufzählungszeichen, damit nur Fliesstext geprüft wird. */
function nurText(zeile) {
  return zeile
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s*([-*+]|\d+\.)\s+/, '')
    .replace(/^\s*\|/, '')
    .replaceAll('|', ' . ');
}

for (const ort of PRUEFORTE) {
  for (const datei of dateien(path.join(wurzel, ort.ordner), ort.endungen, ort.flach)) {
    anzahl++;
    const rel = path.relative(wurzel, datei).replaceAll('\\', '/');
    const zeilen = readFileSync(datei, 'utf8').split('\n');
    let imCodeblock = false;

    // Inhalte sind im Build nur Warnungen (siehe oben), sonst Fehler
    const meldung = ort.inhalt && imBuild ? warnungen : fehler;

    zeilen.forEach((zeile, i) => {
      const stelle = `${rel}:${i + 1}`;
      if (/^\s*(```|~~~)/.test(zeile)) {
        imCodeblock = !imCodeblock;
        return;
      }

      if (SCHARFES_S.test(zeile)) meldung.push(`${stelle}  scharfes S, bitte "ss" schreiben`);
      if (GEDANKENSTRICH.test(zeile)) meldung.push(`${stelle}  Gedankenstrich, Satz umformulieren (Komma, Punkt oder "bis")`);

      // " - " und Bereiche nur in Texten prüfen, nicht in Code (dort ist es ein Minus)
      const istText = ort.inhalt || rel.endsWith('.md');
      if (istText && !imCodeblock && !/^\s*---\s*$/.test(zeile)) {
        const text = nurText(zeile);
        if (STRICH_ALS_EINSCHUB.test(text)) meldung.push(`${stelle}  " - " als Gedankenstrich oder Bereich, umformulieren oder "bis" schreiben`);
        if (/\b\d{1,2}(:\d{2})?-\d{1,2}(:\d{2})?\s*(uhr|h\b)/i.test(text) || /\b\d{1,2}:\d{2}-\d{1,2}:\d{2}\b/.test(text)) {
          warnungen.push(`${stelle}  Zeitbereich mit Bindestrich, besser "07:30 bis 17:00"`);
        }
      }

      if (ort.inhalt) {
        if (/!!/.test(zeile)) meldung.push(`${stelle}  mehrfaches Ausrufezeichen`);
        else if (/[a-zäöü]!(\s|"|$)/i.test(zeile)) warnungen.push(`${stelle}  Ausrufezeichen, wirkt schnell aufdringlich`);
        const klein = zeile.toLowerCase();
        for (const floskel of FLOSKELN) {
          if (klein.includes(floskel)) warnungen.push(`${stelle}  Floskel "${floskel}", konkreter formulieren`);
        }
      }
    });
  }
}

console.log(`\nTextprüfung: ${anzahl} Dateien`);
for (const w of warnungen) console.log(`  WARNUNG  ${w}`);
for (const f of fehler) console.log(`  FEHLER   ${f}`);
if (fehler.length === 0 && warnungen.length === 0) console.log('  OK       keine Auffälligkeiten');
console.log('');

if (fehler.length > 0) {
  console.error(`${fehler.length} Textfehler gefunden.\n`);
  process.exit(1);
}
