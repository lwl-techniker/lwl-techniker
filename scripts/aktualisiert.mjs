// Ermittelt für jede Inhaltsdatei unter content/ das Datum der letzten Änderung aus Git und schreibt
// content/aktualisiert.json. Daraus entstehen "lastmod" in der Sitemap und "dateModified" in den
// strukturierten Daten (WebPage), ohne dass die Kundschaft ein Datum pflegen muss.
//
// Läuft vor "npm run dev" und "npm run build" (package.json). Drei Fälle:
// 1. Vollständige Git-Historie (lokal): Datum des letzten Commits je Datei; lokal geänderte, noch nicht
//    committete Dateien erhalten den aktuellen Zeitpunkt.
// 2. Flacher Klon (Netlify klont mit geringer Tiefe): Dateien aus dem letzten Commit erhalten dessen Datum,
//    alle anderen behalten den Wert aus der committeten Datei.
// 3. Kein Git: bestehende Werte bleiben, neue Dateien erhalten den aktuellen Zeitpunkt.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ZIEL = 'content/aktualisiert.json';
const wurzel = process.cwd();

function git(befehl) {
  try {
    return execSync(`git ${befehl}`, { cwd: wurzel, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function dateien(ordner) {
  const liste = [];
  for (const eintrag of fs.readdirSync(ordner, { withFileTypes: true })) {
    const voll = path.join(ordner, eintrag.name);
    if (eintrag.isDirectory()) liste.push(...dateien(voll));
    else liste.push(voll.split(path.sep).join('/'));
  }
  return liste;
}

const alt = fs.existsSync(ZIEL) ? JSON.parse(fs.readFileSync(ZIEL, 'utf8')) : {};
const alle = dateien('content').filter((d) => d !== ZIEL);
const jetzt = new Date().toISOString();
const inGit = git('rev-parse --is-inside-work-tree') === 'true';
const flach = inGit && git('rev-parse --is-shallow-repository') === 'true';
const neu = {};

if (inGit && !flach) {
  // Zeilenformat "XY pfad" (z. B. " M content/x.json"); das führende Leerzeichen der ersten Zeile ist durch trim() weg
  const geaendert = new Set(
    git('status --porcelain -- content')
      .split('\n')
      .map((z) => z.trim().replace(/^\S{1,2}\s+/, '').replace(/^"|"$/g, ''))
      .filter(Boolean)
  );
  for (const d of alle) {
    neu[d] = geaendert.has(d) ? jetzt : git(`log -1 --format=%cI -- "${d}"`) || alt[d] || jetzt;
  }
} else if (inGit && flach) {
  const kopfDatum = git('log -1 --format=%cI') || jetzt;
  const imKopf = new Set(git('show --name-only --format= HEAD').split('\n').map((z) => z.trim()).filter(Boolean));
  for (const d of alle) neu[d] = imKopf.has(d) ? kopfDatum : alt[d] || kopfDatum;
} else {
  for (const d of alle) neu[d] = alt[d] || jetzt;
}

const sortiert = Object.fromEntries(Object.keys(neu).sort().map((k) => [k, neu[k]]));
const inhalt = JSON.stringify(sortiert, null, 2) + '\n';
if (!fs.existsSync(ZIEL) || fs.readFileSync(ZIEL, 'utf8') !== inhalt) {
  fs.writeFileSync(ZIEL, inhalt);
  console.log(`Aktualisierungsdaten: ${alle.length} Dateien (${inGit ? (flach ? 'flacher Klon' : 'Git') : 'ohne Git'})`);
}
