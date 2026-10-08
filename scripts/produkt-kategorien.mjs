// Sammelt die vorhandenen Produktkategorien aus content/produkte/*.json und schreibt sie nach
// src/keystatic/produkt-kategorien.json. Daraus baut Keystatic die Auswahlliste "Kategorie auswählen".
//
// Läuft vor "npm run dev" und "npm run build" (package.json). Eine neue Kategorie wird im CMS zuerst
// als Text eingetragen; nach dem nächsten Veröffentlichen steht sie in der Auswahlliste.
// Reihenfolge wie im Katalog: nach "Reihenfolge", dann Name, erstes Vorkommen je Kategorie.
import fs from 'node:fs';
import path from 'node:path';

const QUELLE = 'content/produkte';
const ZIEL = 'src/keystatic/produkt-kategorien.json';

const produkte = fs.existsSync(QUELLE)
  ? fs
      .readdirSync(QUELLE)
      .filter((d) => d.endsWith('.json'))
      .map((d) => JSON.parse(fs.readFileSync(path.join(QUELLE, d), 'utf8')))
  : [];

produkte.sort((a, b) => (a.reihenfolge ?? 100) - (b.reihenfolge ?? 100) || String(a.titel).localeCompare(String(b.titel), 'de'));

const kategorien = [];
for (const p of produkte) {
  const k = String(p.kategorieAuswahl || p.kategorie || '').trim();
  if (k && !kategorien.includes(k)) kategorien.push(k);
}

const inhalt = JSON.stringify(kategorien, null, 2) + '\n';
if (!fs.existsSync(ZIEL) || fs.readFileSync(ZIEL, 'utf8') !== inhalt) {
  fs.writeFileSync(ZIEL, inhalt);
  console.log(`Produktkategorien für Keystatic: ${kategorien.length}`);
}
