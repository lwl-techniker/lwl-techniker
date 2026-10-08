/**
 * KONFIGURATIONSPRÜFUNG
 *
 * Findet typische Fehler, bevor sie online auffallen:
 * Platzhalter in site.config.ts, falscher Keystatic-Modus, fehlende Umgebungsvariablen auf Netlify,
 * Netlify-Attribute im React-Code, reservierte Seitenadressen, fehlende Bilder in Inhalten.
 *
 * Aufruf:
 *   npm run pruefen:konfiguration    lokal, alle Prüfungen
 *   (automatisch vor jedem Build)    mit --build, auf Netlify strenger
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imBuild = process.argv.includes('--build');
const aufNetlify = process.env.NETLIFY === 'true';
const produktiv = process.env.CONTEXT === 'production';

const fehler = [];
const warnungen = [];
const ok = [];

function dateien(ordner, endungen) {
  const ergebnis = [];
  if (!existsSync(ordner)) return ergebnis;
  for (const eintrag of readdirSync(ordner)) {
    const voll = path.join(ordner, eintrag);
    if (statSync(voll).isDirectory()) ergebnis.push(...dateien(voll, endungen));
    else if (endungen.some((e) => eintrag.endsWith(e))) ergebnis.push(voll);
  }
  return ergebnis;
}
const relativ = (p) => path.relative(wurzel, p).replaceAll('\\', '/');

/** Wie existsSync, aber mit exakter Gross- und Kleinschreibung. Windows ignoriert sie, Netlify (Linux) nicht. */
function existsSteng(voll) {
  const teile = path.relative(wurzel, voll).split(/[\\/]/);
  let aktuell = wurzel;
  for (const teil of teile) {
    if (!existsSync(aktuell) || !readdirSync(aktuell).includes(teil)) return false;
    aktuell = path.join(aktuell, teil);
  }
  return true;
}

// 1. Node Version ----------------------------------------------------------------
const [nodeHaupt, nodeNeben] = process.versions.node.split('.').map(Number);
if (nodeHaupt < 22 || (nodeHaupt === 22 && nodeNeben < 18)) {
  fehler.push(`Node ${process.versions.node} ist zu alt. Benötigt wird Node 22.18 oder neuer (TypeScript-Dateien direkt ausführen).`);
  console.error(fehler[0]);
  process.exit(1);
}
else ok.push(`Node ${process.versions.node}`);

// 2. site.config.ts -------------------------------------------------------------
let site;
try {
  site = await import(pathToFileURL(path.join(wurzel, 'src', 'site.config.ts')).href);
} catch (e) {
  fehler.push(`src/site.config.ts konnte nicht gelesen werden: ${e.message}. Die Datei darf keine Imports und keine TypeScript-Syntax enthalten, die Node nicht entfernen kann (z. B. enum).`);
}

if (site) {
  const { DOMAIN, GITHUB_REPO, KEYSTATIC_MODUS, PROJEKT_NAME } = site;
  const platzhalter = [];
  if (!DOMAIN || DOMAIN.includes('example.ch')) platzhalter.push('DOMAIN');
  if (!GITHUB_REPO || GITHUB_REPO.endsWith('/vorlage-website')) platzhalter.push('GITHUB_REPO');
  if (!PROJEKT_NAME || PROJEKT_NAME === 'Muster AG') platzhalter.push('PROJEKT_NAME');

  if (platzhalter.length > 0) {
    const text = `src/site.config.ts enthält noch Platzhalter: ${platzhalter.join(', ')}.`;
    if (aufNetlify && produktiv) fehler.push(`${text} Vor der Veröffentlichung anpassen.`);
    else warnungen.push(`${text} Vor dem Verbinden mit GitHub und Netlify anpassen.`);
  } else ok.push('site.config.ts ohne Platzhalter');

  if (DOMAIN && (!/^https:\/\/[^/]+$/.test(DOMAIN))) fehler.push(`DOMAIN "${DOMAIN}" muss mit https:// beginnen und darf keinen Schrägstrich am Ende haben.`);
  if (GITHUB_REPO && !/^[\w.-]+\/[\w.-]+$/.test(GITHUB_REPO)) fehler.push(`GITHUB_REPO "${GITHUB_REPO}" muss das Format besitzer/repo haben.`);

  if (!['automatisch', 'lokal', 'github'].includes(KEYSTATIC_MODUS)) {
    fehler.push(`KEYSTATIC_MODUS "${KEYSTATIC_MODUS}" ist ungültig. Erlaubt: automatisch, lokal, github.`);
  } else if (KEYSTATIC_MODUS === 'lokal' && aufNetlify) {
    fehler.push(
      'KEYSTATIC_MODUS ist "lokal". Auf Netlify können Inhalte so nicht gespeichert werden. In src/site.config.ts wieder auf "automatisch" stellen.'
    );
  } else if (KEYSTATIC_MODUS !== 'automatisch') {
    warnungen.push(`KEYSTATIC_MODUS ist "${KEYSTATIC_MODUS}". Vor dem Commit wieder auf "automatisch" stellen.`);
  } else ok.push('Keystatic-Modus automatisch');

  // 3. Git-Remote passt zu GITHUB_REPO (nur lokal)
  if (!aufNetlify && GITHUB_REPO) {
    try {
      const remote = execSync('git remote get-url origin', { cwd: wurzel, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      const treffer = remote.match(/github\.com[:/](.+?)(\.git)?$/);
      if (treffer && treffer[1].toLowerCase() !== GITHUB_REPO.toLowerCase()) {
        fehler.push(`GITHUB_REPO "${GITHUB_REPO}" passt nicht zum Git-Remote "${treffer[1]}". Keystatic würde ins falsche Repository speichern.`);
      } else if (treffer) ok.push('GITHUB_REPO passt zum Git-Remote');
    } catch {
      warnungen.push('Kein Git-Remote "origin" gefunden. GITHUB_REPO kann erst nach dem Verbinden mit GitHub geprüft werden.');
    }
  }
}

// 4. Umgebungsvariablen auf Netlify ------------------------------------------------
const KEYSTATIC_VARIABLEN = ['KEYSTATIC_GITHUB_CLIENT_ID', 'KEYSTATIC_GITHUB_CLIENT_SECRET', 'KEYSTATIC_SECRET', 'NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG'];
if (aufNetlify) {
  const fehlend = KEYSTATIC_VARIABLEN.filter((v) => !process.env[v]);
  if (fehlend.length > 0) {
    const text = `Auf Netlify fehlen Umgebungsvariablen: ${fehlend.join(', ')}. Ohne sie funktioniert /keystatic online nicht (docs/04-netlify.md).`;
    if (produktiv) fehler.push(text);
    else warnungen.push(text);
  } else {
    const ungueltig = [];
    if (process.env.KEYSTATIC_SECRET.length < 32) ungueltig.push('KEYSTATIC_SECRET ist kürzer als 32 Zeichen');
    for (const v of KEYSTATIC_VARIABLEN) {
      if (/[\s#]/.test(process.env[v])) ungueltig.push(`${v} enthält Leerzeichen oder #. Nur den Wert vor dem Kommentar aus .env kopieren`);
    }
    if (ungueltig.length > 0) (produktiv ? fehler : warnungen).push(...ungueltig);
    else ok.push('Keystatic-Umgebungsvariablen auf Netlify vorhanden und plausibel');
  }
}

// 5. Geheimnisse nicht im Repository ----------------------------------------------------
const gitignore = existsSync(path.join(wurzel, '.gitignore')) ? readFileSync(path.join(wurzel, '.gitignore'), 'utf8') : '';
if (!/^\.env$/m.test(gitignore)) fehler.push('.gitignore muss die Zeile ".env" enthalten. Keystatic schreibt dort die GitHub-Zugangsdaten hinein.');
if (!aufNetlify) {
  try {
    const verfolgt = execSync('git ls-files .env .env.local', { cwd: wurzel, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (verfolgt) fehler.push(`Geheimnisse sind im Git-Repository: ${verfolgt}. Sofort mit "git rm --cached" entfernen und die Zugangsdaten der GitHub-App neu erzeugen.`);
  } catch {
    /* kein Git-Repository */
  }
}

// 6. Netlify-Attribute im React-Code (OpenNext bricht den Build sonst ab) -------------------
for (const datei of dateien(path.join(wurzel, 'src'), ['.tsx', '.jsx'])) {
  const inhalt = readFileSync(datei, 'utf8');
  if (/\sdata-netlify(=|\s|>)|\snetlify(=|\s|>)|netlify-honeypot=/.test(inhalt)) {
    fehler.push(`${relativ(datei)} enthält Netlify-Formularattribute. Diese gehören nur in public/__forms.html (docs/05-formulare.md).`);
  }
  if (/fetch\(\s*['"`]\/['"`]/.test(inhalt) || /fetch\(\s*['"`]\/\.netlify\/forms/.test(inhalt)) {
    fehler.push(`${relativ(datei)} sendet ein Formular an "/" oder "/.netlify/forms". Richtig ist "/__forms.html".`);
  }
}

// 7. Formulardatei vorhanden -------------------------------------------------------------
const formsHtml = path.join(wurzel, 'public', '__forms.html');
if (!existsSync(formsHtml)) fehler.push('public/__forms.html fehlt. "npm run formulare" ausführen.');
else ok.push('public/__forms.html vorhanden');

// 8. Reservierte Seitenadressen ----------------------------------------------------------
const RESERVIERT = ['leistungen', 'referenzen', 'kunden', 'jobs', 'produkte', 'team', 'downloads', 'keystatic', 'veroeffentlichen', 'api', 'sitemap.xml', 'robots.txt', 'bilder', 'dokumente', '_next'];
for (const datei of dateien(path.join(wurzel, 'content', 'seiten'), ['.json'])) {
  const slug = path.basename(datei, '.json');
  if (RESERVIERT.includes(slug)) fehler.push(`Die Seite "${slug}" (content/seiten) kollidiert mit einer festen Route. Bitte eine andere Adresse wählen.`);
}

// 9. Bildpfade in Inhalten existieren -----------------------------------------------------
let bildPfade = 0;
for (const datei of dateien(path.join(wurzel, 'content'), ['.json', '.mdoc', '.yaml'])) {
  const inhalt = readFileSync(datei, 'utf8');
  for (const treffer of inhalt.matchAll(/["'(\s:](\/bilder\/[^"')\s]+)/g)) {
    bildPfade++;
    const pfad = decodeURI(treffer[1]);
    if (!existsSteng(path.join(wurzel, 'public', pfad))) {
      fehler.push(
        `${relativ(datei)} verweist auf ein fehlendes Bild: ${pfad} (Gross- und Kleinschreibung beachten, Netlify unterscheidet sie im Gegensatz zu Windows)`
      );
    }
  }
}
ok.push(`${bildPfade} Bildverweise in Inhalten geprüft`);

// 10. Platzhalter der Vorlage in Inhalten ---------------------------------------------------
const PLATZHALTER = ['Muster AG', 'example.ch', 'Beispielname', 'Vorname Nachname', 'Hinweis für die Vorlage', 'CHE-000.000.000', '+41 71 000 00 00'];
const gefunden = new Set();
for (const datei of dateien(path.join(wurzel, 'content'), ['.json', '.mdoc', '.yaml'])) {
  const inhalt = readFileSync(datei, 'utf8');
  for (const p of PLATZHALTER) if (inhalt.includes(p)) gefunden.add(`${relativ(datei)} ("${p}")`);
}
if (gefunden.size > 0) {
  const text = `Inhalte enthalten noch Platzhalter der Vorlage: ${[...gefunden].slice(0, 8).join(', ')}${gefunden.size > 8 ? ' ...' : ''}`;
  if (aufNetlify && produktiv) fehler.push(text);
  else warnungen.push(`${gefunden.size} Dateien mit Platzhaltern der Vorlage (Muster AG, example.ch, Beispielname). Vor der Veröffentlichung ersetzen.`);
} else ok.push('keine Platzhalter der Vorlage in Inhalten');

// 11. Netlify Konfiguration --------------------------------------------------------------------
const toml = existsSync(path.join(wurzel, 'netlify.toml')) ? readFileSync(path.join(wurzel, 'netlify.toml'), 'utf8') : '';
if (!/publish\s*=\s*"\.next"/.test(toml)) fehler.push('netlify.toml: publish = ".next" fehlt.');
if (/@netlify\/plugin-nextjs/.test(toml)) warnungen.push('netlify.toml fixiert @netlify/plugin-nextjs. Netlify empfiehlt, den Adapter nicht zu fixieren.');

// Ausgabe ---------------------------------------------------------------------------------------
console.log(`\nKonfigurationsprüfung${imBuild ? ' (Build)' : ''}${aufNetlify ? ` auf Netlify, Kontext ${process.env.CONTEXT}` : ''}`);
for (const o of ok) console.log(`  OK       ${o}`);
for (const w of warnungen) console.log(`  WARNUNG  ${w}`);
for (const f of fehler) console.log(`  FEHLER   ${f}`);
console.log('');

if (fehler.length > 0) {
  console.error(`${fehler.length} Fehler gefunden. Build abgebrochen, damit keine fehlerhafte Seite online geht.\n`);
  process.exit(1);
}
