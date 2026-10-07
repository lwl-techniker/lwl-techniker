import { test } from 'node:test';
import assert from 'node:assert/strict';
import { istNochGueltig, neusteZuerst, waehleFuerStartseite } from '../src/lib/startseite-auswahl.ts';

const r = (slug, datum, aufStartseite = false) => ({ slug, datum, aufStartseite });

const referenzen = [
  r('a', '2024-01-10'),
  r('b', '2026-05-01'),
  r('c', '2025-03-20'),
  r('d', '2026-01-15'),
  r('e', '2023-07-01'),
  r('f', '2025-11-30'),
];

const slugs = (liste) => liste.map((e) => e.slug);

test('ohne Markierung: die 4 neusten', () => {
  assert.deepEqual(slugs(waehleFuerStartseite(referenzen, 4)), ['b', 'd', 'f', 'c']);
});

test('eine alte Referenz markiert: sie steht zuerst, Rest wird mit den neusten aufgefüllt', () => {
  const liste = referenzen.map((e) => (e.slug === 'e' ? { ...e, aufStartseite: true } : e));
  assert.deepEqual(slugs(waehleFuerStartseite(liste, 4)), ['e', 'b', 'd', 'f']);
});

test('genau 4 markiert: nur diese, neuste zuerst', () => {
  const markiert = ['a', 'c', 'e', 'f'];
  const liste = referenzen.map((e) => ({ ...e, aufStartseite: markiert.includes(e.slug) }));
  assert.deepEqual(slugs(waehleFuerStartseite(liste, 4)), ['f', 'c', 'a', 'e']);
});

test('mehr markiert als Plätze: die neusten markierten gewinnen', () => {
  const liste = referenzen.map((e) => ({ ...e, aufStartseite: true }));
  assert.deepEqual(slugs(waehleFuerStartseite(liste, 4)), ['b', 'd', 'f', 'c']);
});

test('weniger Einträge als Plätze: alle, ohne Fehler', () => {
  assert.equal(waehleFuerStartseite(referenzen.slice(0, 2), 4).length, 2);
  assert.deepEqual(waehleFuerStartseite([], 4), []);
});

test('ungültige Anzahl ergibt leere Liste', () => {
  assert.deepEqual(waehleFuerStartseite(referenzen, 0), []);
  assert.deepEqual(waehleFuerStartseite(referenzen, Number('abc')), []);
});

test('Einträge ohne Datum landen am Ende', () => {
  assert.deepEqual(slugs(neusteZuerst([r('x', null), r('y', '2020-01-01')])), ['y', 'x']);
});

test('Originalliste wird nicht verändert', () => {
  const kopie = structuredClone(referenzen);
  waehleFuerStartseite(referenzen, 4);
  assert.deepEqual(referenzen, kopie);
});

test('Gültigkeit von Stellen', () => {
  assert.equal(istNochGueltig(null, '2026-09-16'), true);
  assert.equal(istNochGueltig('2026-09-16', '2026-09-16'), true);
  assert.equal(istNochGueltig('2026-09-15', '2026-09-16'), false);
});
