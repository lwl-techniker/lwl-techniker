/**
 * INHALTSPRÜFUNG (ohne Browser)
 * - alle neun V2-Referenzen vollständig vorhanden, Bilder und Galerien dazu
 * - Team: Leitung Lulzim Selimi und Arsel Thuma, Technik vier Personen, Lindi Selimi entfernt
 * - PDF-Datenblätter unverändert (SHA-256 gegen die Prüfsummen im generierten Index), Index passt zu den Produkten
 * - zentrale Logoliste: jede Datei vorhanden, Rasterformate korrekt deklariert
 * - Startseite: kein Heroimage, keine entfernten V3-Hero-Zeilen
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(path.join(wurzel, p), 'utf8');
const json = (p) => JSON.parse(lies(p));
const frontmatter = (p) => {
  const text = lies(p);
  const t = text.match(/^---\n([\s\S]*?)\n---/);
  return Object.fromEntries(
    (t?.[1] ?? '')
      .split('\n')
      .filter((z) => /^[a-zA-Z]+:/.test(z))
      .map((z) => [z.slice(0, z.indexOf(':')), z.slice(z.indexOf(':') + 1).trim()])
  );
};

const V2_REFERENZEN = [
  'ftth-netz-ramsen',
  'ftth-projekte-ostschweiz',
  'glasfasernetz-thurgauer-gemeinden',
  'inhouse-installationen-fuer-unternehmen',
  'kamera-tracking-stadion-fc-st-gallen',
  'notfalleinsatz-kabelschaden-bagger',
  'sicherheitssystem-tunnel-kerenzerberg',
  'verkehrstechnik-nationalstrassen-und-tunnel',
  'weissenstein-tunnel-solothurn',
];

test('alle neun V2-Referenzen sind vorhanden und veröffentlicht, Bilder existieren', () => {
  for (const slug of V2_REFERENZEN) {
    const datei = `content/referenzen/${slug}.mdoc`;
    assert.ok(existsSync(path.join(wurzel, datei)), `${datei} fehlt`);
    const fm = frontmatter(datei);
    assert.equal(fm.veroeffentlicht, 'true', `${slug} ist nicht veröffentlicht`);
    const text = lies(datei);
    for (const bild of text.matchAll(/(\/bilder\/referenzen\/[^\s"']+)/g)) {
      assert.ok(existsSync(path.join(wurzel, 'public', bild[1])), `${slug}: Bild ${bild[1]} fehlt`);
    }
  }
  const alle = readdirSync(path.join(wurzel, 'content/referenzen')).filter((f) => f.endsWith('.mdoc'));
  assert.ok(alle.length >= V2_REFERENZEN.length, 'mindestens neun Referenzen');
});

test('Team: Leitung und Technik wie in V3 bestätigt, Lindi Selimi entfernt', () => {
  const personen = readdirSync(path.join(wurzel, 'content/team')).map((f) => json(`content/team/${f}`));
  const leitung = personen.filter((p) => p.bereich === 'leitung').map((p) => p.name).sort();
  const technik = personen.filter((p) => p.bereich === 'technik').map((p) => p.name).sort();
  assert.deepEqual(leitung, ['Arsel Thuma', 'Lulzim Selimi']);
  assert.deepEqual(technik, ['Christian Colaci', 'David Thuma', 'Edwin Stefanov', 'Zelije Selimi']);
  assert.ok(!personen.some((p) => p.name === 'Lindi Selimi'));
  for (const p of personen) if (p.foto) assert.ok(existsSync(path.join(wurzel, 'public', p.foto)), `${p.name}: Foto fehlt`);
  const gesamt = JSON.stringify(personen) + lies('content/seiten/ueber-uns.json');
  assert.ok(!gesamt.includes('Lindi'), 'Lindi Selimi darf nirgends mehr vorkommen');
});

test('Datenblatt-Index passt zu den Produkten und die PDFs sind unverändert (SHA-256)', () => {
  const index = json('src/generated/datenblaetter.json');
  const produkte = readdirSync(path.join(wurzel, 'content/produkte')).map((f) => ({ slug: path.basename(f, '.json'), ...json(`content/produkte/${f}`) }));
  const mitPdf = produkte.filter((p) => p.dokument);
  assert.equal(mitPdf.length, 40, 'vierzig Produkte mit Datenblatt');
  for (const p of mitPdf) {
    const e = index.eintraege[p.slug];
    assert.ok(e, `${p.slug} fehlt im Index`);
    assert.equal(e.dokument, p.dokument, `${p.slug}: Index zeigt auf eine andere Datei`);
    const pfad = path.join(wurzel, 'public', p.dokument);
    assert.ok(existsSync(pfad), `${p.dokument} fehlt`);
    const sha = createHash('sha256').update(readFileSync(pfad)).digest('hex');
    assert.equal(sha, e.pruefsumme, `${p.slug}: PDF weicht vom Index ab, "npm run datenblaetter" ausführen`);
    assert.ok(existsSync(path.join(wurzel, 'public', e.vorschau.pfad)), `${p.slug}: Vorschau fehlt`);
    if (e.bild) assert.ok(existsSync(path.join(wurzel, 'public', e.bild.pfad)), `${p.slug}: Bild fehlt`);
    assert.ok(!('fehler' in e), `${p.slug}: Index meldet Fehler ${e.fehler}`);
  }
  assert.equal(index.eindeutigeDokumente, 40, 'vierzig eindeutige PDFs');
});

test('PDFs sind mit den Originalen aus V2 identisch (Prüfsummen aus V2-Produktliste)', () => {
  // Die Prüfsummen wurden einmalig aus dem V2-Stand f2127e0 berechnet (docs/03-pdf-machbarkeit.md).
  const erwartet = json('tests/pdf-pruefsummen.json');
  for (const [datei, sha] of Object.entries(erwartet)) {
    const pfad = path.join(wurzel, 'public/dokumente/produkte', datei);
    assert.ok(existsSync(pfad), `${datei} fehlt`);
    assert.equal(createHash('sha256').update(readFileSync(pfad)).digest('hex'), sha, `${datei} wurde verändert`);
  }
});

test('zentrale Logoliste: Dateien vorhanden, Formate korrekt (PNG-Silhouette, WebP-Farbe)', () => {
  const u = json('content/einstellungen/uebersichten.json');
  const logos = u.referenzen.logos.logos;
  assert.ok(logos.length >= 44, 'mindestens 44 Logos');
  for (const l of logos) {
    assert.ok(existsSync(path.join(wurzel, 'public', l.logo)), `${l.name}: Silhouette fehlt`);
    assert.ok(l.logo.endsWith('.png'), `${l.name}: Silhouette ist kein PNG`);
    if (l.logoFarbig) {
      assert.ok(existsSync(path.join(wurzel, 'public', l.logoFarbig)), `${l.name}: Farblogo fehlt`);
      assert.ok(l.logoFarbig.endsWith('.webp'), `${l.name}: Farblogo ist kein WebP`);
    }
  }
});

test('Startseite: Hero ohne Bild, ohne entfernte V3-Zeilen, Slogan vorhanden', () => {
  const s = json('content/startseite/startseite.json');
  const hero = s.bloecke[0];
  assert.equal(hero.discriminant, 'hero');
  assert.ok(!hero.value.bild, 'kein Heroimage');
  assert.equal(hero.value.titel.replace(/\n/g, ' '), 'Wir bringen Licht ans Ziel.');
  const text = lies('content/startseite/startseite.json');
  assert.ok(!text.includes('Unser Zeichen. Ihre Verbindung.'));
  assert.ok(!text.includes('Licht in Bewegung'));
  const typen = s.bloecke.map((b) => b.discriminant);
  for (const t of ['logoslider', 'kennzahlen', 'leistungsbereiche', 'referenzen', 'datenblaetter', 'teamAuszug', 'ctaBand']) assert.ok(typen.includes(t), `Block ${t} fehlt`);
});

test('Startseite: vier Leistungsbereiche mit vorhandenen Leistungen', () => {
  const s = json('content/startseite/startseite.json');
  const block = s.bloecke.find((b) => b.discriminant === 'leistungsbereiche');
  assert.ok(block, 'Block leistungsbereiche fehlt');
  assert.equal(block.value.bereiche.length, 4, 'vier Bereiche');
  const slugs = block.value.bereiche.map((b) => b.leistung);
  assert.equal(new Set(slugs).size, 4, 'vier verschiedene Leistungen');
  for (const b of block.value.bereiche) {
    assert.ok(existsSync(path.join(wurzel, 'content', 'leistungen', `${b.leistung}.mdoc`)), `Leistung ${b.leistung} fehlt`);
    assert.ok(!b.titel.includes('&') && !b.text.includes('&'), `${b.titel}: "und" statt "&"`);
  }
  assert.equal(block.value.titel.replace(/\n/g, ' '), 'Glasfaser verbindet. Wir machen sie nutzbar.');
});

test('Schreibziel: V4-Repository, V2 und V3 geschützt', () => {
  const site = lies('src/site.config.ts');
  assert.ok(site.includes("GITHUB_REPO = 'lwl-techniker/lwl-techniker'"));
  assert.ok(!/GITHUB_REPO = 'infraoneit\/lwl-techniker-v[23]'/.test(site));
});
