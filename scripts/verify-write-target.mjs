/**
 * SCHREIBZIEL-PRÜFUNG (V4)
 *
 * Stellt sicher, dass dieses Projekt nur in sein eigenes Repository schreibt und die Quellen V2 und V3 nie als
 * Schreibziel erscheinen: weder in src/site.config.ts noch als Git-Remote "origin".
 * Aufruf: npm run verify:repository
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = await import(pathToFileURL(path.join(wurzel, 'src', 'site.config.ts')).href);
const fehler = [];

if (site.GITHUB_REPO !== 'lwl-techniker/lwl-techniker') fehler.push(`GITHUB_REPO ist "${site.GITHUB_REPO}", erwartet wird lwl-techniker/lwl-techniker.`);
for (const geschuetzt of site.GESCHUETZTE_REPOS ?? []) {
  if (site.GITHUB_REPO.toLowerCase() === geschuetzt.toLowerCase()) fehler.push(`GITHUB_REPO zeigt auf die geschützte Quelle ${geschuetzt}.`);
}

let remote = '';
try {
  remote = execSync('git remote get-url origin', { cwd: wurzel, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch {
  console.log('Kein Git-Remote "origin" gesetzt. Vor dem ersten Push: git remote add origin https://github.com/lwl-techniker/lwl-techniker.git');
}
if (remote) {
  for (const geschuetzt of site.GESCHUETZTE_REPOS ?? []) {
    if (remote.toLowerCase().includes(geschuetzt.toLowerCase())) fehler.push(`Git-Remote "${remote}" zeigt auf die geschützte Quelle ${geschuetzt}.`);
  }
  if (!remote.toLowerCase().includes(site.GITHUB_REPO.toLowerCase())) fehler.push(`Git-Remote "${remote}" passt nicht zu GITHUB_REPO ${site.GITHUB_REPO}.`);
  else console.log(`Git-Remote passt: ${remote}`);
}

if (fehler.length > 0) {
  for (const f of fehler) console.error(`FEHLER ${f}`);
  process.exit(1);
}
console.log(`Schreibziel in Ordnung: ${site.GITHUB_REPO}. Geschützt: ${(site.GESCHUETZTE_REPOS ?? []).join(', ')}.`);
