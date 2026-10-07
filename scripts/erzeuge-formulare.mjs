/**
 * Erzeugt public/__forms.html aus src/formulare/formulare.json.
 *
 * Warum: Netlify erkennt Formulare nur in statischem HTML. Next.js-Seiten sind das nicht.
 * Deshalb braucht es diese versteckte Datei mit allen Formularen und Feldnamen.
 * Formulare im React-Code senden per fetch an /__forms.html (siehe docs/05-formulare.md).
 *
 * Läuft automatisch vor jedem Build (prebuild). Die Datei nie von Hand bearbeiten.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quelle = path.join(wurzel, 'src', 'formulare', 'formulare.json');
const ziel = path.join(wurzel, 'public', '__forms.html');

const HONIGTOPF_FELD = 'bot-field';
const escape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const formulare = JSON.parse(readFileSync(quelle, 'utf8'));
const fehler = [];
const bloecke = [];

for (const [name, formular] of Object.entries(formulare)) {
  if (!/^[a-z0-9-]+$/.test(name)) fehler.push(`Formularname "${name}" darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.`);
  const namen = new Set();
  const felder = [];
  for (const feld of formular.felder) {
    if (!/^[a-z0-9-]+$/.test(feld.name)) fehler.push(`${name}: Feldname "${feld.name}" ist ungültig.`);
    if (namen.has(feld.name)) fehler.push(`${name}: Feldname "${feld.name}" ist doppelt.`);
    if (['form-name', 'subject', HONIGTOPF_FELD].includes(feld.name)) fehler.push(`${name}: Feldname "${feld.name}" ist reserviert.`);
    namen.add(feld.name);
    if (feld.typ === 'auswahl') felder.push(`    <select name="${escape(feld.name)}"></select>`);
    else if (feld.typ === 'textbereich') felder.push(`    <textarea name="${escape(feld.name)}"></textarea>`);
    else if (feld.typ === 'zustimmung') felder.push(`    <input type="checkbox" name="${escape(feld.name)}" />`);
    else felder.push(`    <input type="${escape(feld.typ)}" name="${escape(feld.name)}" />`);
  }
  bloecke.push(
    [
      `  <form name="${escape(name)}" method="POST" data-netlify="true" netlify-honeypot="${HONIGTOPF_FELD}" hidden>`,
      `    <input type="hidden" name="form-name" value="${escape(name)}" />`,
      `    <input type="hidden" name="subject" value="${escape(formular.emailBetreff)}" />`,
      `    <input name="${HONIGTOPF_FELD}" />`,
      ...felder,
      `  </form>`,
    ].join('\n')
  );
}

if (fehler.length > 0) {
  console.error('\nFehler in src/formulare/formulare.json:\n- ' + fehler.join('\n- ') + '\n');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<!-- AUTOMATISCH ERZEUGT aus src/formulare/formulare.json. Nicht von Hand bearbeiten. -->
<html lang="de">
<head><meta charset="utf-8" /><meta name="robots" content="noindex" /><title>Formulare</title></head>
<body>
${bloecke.join('\n')}
</body>
</html>
`;

mkdirSync(path.dirname(ziel), { recursive: true });
writeFileSync(ziel, html, 'utf8');
console.log(`Formulare erzeugt: public/__forms.html (${Object.keys(formulare).join(', ')})`);
