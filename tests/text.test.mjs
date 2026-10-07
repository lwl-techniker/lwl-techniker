import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absaetze, sauberText } from '../src/lib/text.ts';

const S = String.fromCodePoint(0xdf);
const HALB = String.fromCodePoint(0x2013);
const GANZ = String.fromCodePoint(0x2014);

test('scharfes S wird zu ss', () => {
  assert.equal(sauberText(`Stra${S}e und gro${S}`), 'Strasse und gross');
});

test('Bereiche werden zu "bis"', () => {
  assert.equal(sauberText(`07:30 ${HALB} 17:00`), '07:30 bis 17:00');
  assert.equal(sauberText(`07:30${HALB}17:00`), '07:30 bis 17:00');
  assert.equal(sauberText(`5${HALB}10 Tage`), '5 bis 10 Tage');
  assert.equal(sauberText('80 - 100 %'), '80 bis 100 %');
  assert.equal(sauberText('Nr. 5 - 7'), 'Nr. 5 bis 7');
  assert.equal(sauberText(`Mo${HALB}Fr 07:30${HALB}17:00`), 'Mo bis Fr 07:30 bis 17:00');
  assert.equal(sauberText('Mo - Fr'), 'Mo bis Fr');
  assert.equal(sauberText(`Zürich${HALB}Bern`), 'Zürich bis Bern');
});

test('Frankenbeträge mit Strich', () => {
  assert.equal(sauberText(`CHF 50.${HALB} pro Stunde`), 'CHF 50.00 pro Stunde');
  assert.equal(sauberText(`CHF 80.${HALB}/h`), 'CHF 80.00/h');
});

test('Sonderfälle aus der Praxis', () => {
  assert.equal(sauberText(`1.${HALB}3. Mai`), '1. bis 3. Mai');
  assert.equal(sauberText(`Mo.${HALB}Fr.`), 'Mo. bis Fr.');
  assert.equal(sauberText(`Nord${HALB}Süd-Achse`), 'Nord-Süd-Achse');
  assert.equal(sauberText('Tel. 071 - 000 00 00'), 'Tel. 071 - 000 00 00');
  assert.equal(sauberText(`Seite 3${HALB}5`), 'Seite 3 bis 5');
  assert.equal(sauberText('E-Bike und COVID-19'), 'E-Bike und COVID-19');
});

test('Gedankenstrich als Einschub wird zum Komma', () => {
  assert.equal(sauberText(`Planung ${GANZ} und Ausführung`), 'Planung, und Ausführung');
  assert.equal(sauberText('Planung - Ausführung'), 'Planung, Ausführung');
});

test('normale Bindestriche, Minus, Telefon und Adressen bleiben erhalten', () => {
  assert.equal(sauberText('E-Mail-Adresse, Vor- und Nachname, 8590-Romanshorn'), 'E-Mail-Adresse, Vor- und Nachname, 8590-Romanshorn');
  assert.equal(sauberText('-5 Grad bis - 3 Grad'), '-5 Grad bis - 3 Grad');
  assert.equal(sauberText('071 000 00 00'), '071 000 00 00');
  assert.equal(sauberText('https://beispiel-firma.ch/a - b'), 'https://beispiel-firma.ch/a - b');
  assert.equal(sauberText('info@beispiel-firma.ch'), 'info@beispiel-firma.ch');
});

test('Zeilenumbrüche bleiben erhalten', () => {
  assert.deepEqual(absaetze(`Erster Absatz\n\n${HALB} zweiter`), ['Erster Absatz', ', zweiter']);
  assert.equal(sauberText('Zeile eins\n- Punkt'), 'Zeile eins\n- Punkt');
});

test('Absätze werden an Leerzeilen getrennt', () => {
  assert.deepEqual(absaetze('Eins.\n\nZwei.\n  \nDrei.'), ['Eins.', 'Zwei.', 'Drei.']);
  assert.deepEqual(absaetze(''), []);
});
