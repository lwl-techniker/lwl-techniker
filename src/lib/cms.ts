import 'server-only';
import { cache } from 'react';
import { createReader } from '@keystatic/core/reader';
import config from '@/keystatic.config';
import datenblattIndex from '@/generated/datenblaetter.json';
import { heuteIso } from './datum';
import { istNochGueltig, neusteZuerst, waehleFuerStartseite } from './startseite-auswahl';

/**
 * EINZIGE STELLE, AN DER INHALTE GELESEN WERDEN
 *
 * Seiten und Komponenten greifen nie direkt auf den Reader zu, sondern nur auf die
 * Funktionen hier. Der Reader liest die Dateien aus /content. Das passiert beim Build,
 * die fertigen Seiten sind danach statisch. Speichert jemand im CMS, erzeugt Keystatic
 * einen Commit auf GitHub und Netlify baut die Seite neu.
 */

export const reader = createReader(process.cwd(), config);

// Einstellungen ---------------------------------------------------------------

export const holeEinstellungen = cache(async () => {
  const daten = await reader.singletons.einstellungen.read();
  if (!daten) {
    throw new Error('content/einstellungen/firma.json fehlt. Bitte im CMS unter "Firma und Kontakt" speichern.');
  }
  return daten;
});

export const holeNavigation = cache(async () => {
  const daten = await reader.singletons.navigation.read();
  return (
    daten ?? {
      hauptmenue: [],
      knopf: { text: '', link: '' },
      fusszeile: [],
      rechtliches: [],
    }
  );
});

export const holeUebersichten = cache(async () => {
  const daten = await reader.singletons.uebersichten.read();
  if (!daten) {
    throw new Error('content/einstellungen/uebersichten.json fehlt. Bitte im CMS unter "Übersichtsseiten" speichern.');
  }
  return daten;
});

export const holeStartseite = cache(async () => {
  const daten = await reader.singletons.startseite.read();
  if (!daten) {
    throw new Error('content/startseite/startseite.json fehlt. Bitte im CMS die Startseite speichern.');
  }
  return daten;
});

// Seiten ------------------------------------------------------------------------

export const holeSeite = cache(async (slug: string) => reader.collections.seiten.read(slug));

export const holeAlleSeiten = cache(async () => {
  const alle = await reader.collections.seiten.all();
  return alle.map(({ slug, entry }) => ({ slug, ...entry }));
});

// Leistungen --------------------------------------------------------------------

export const holeLeistungen = cache(async () => {
  const alle = await reader.collections.leistungen.all();
  return alle
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => a.reihenfolge - b.reihenfolge || a.titel.localeCompare(b.titel, 'de'));
});

export const holeLeistung = cache(async (slug: string) => {
  const eintrag = await reader.collections.leistungen.read(slug);
  return eintrag ? { slug, ...eintrag } : null;
});

// Referenzen --------------------------------------------------------------------

/** Alle veröffentlichten Referenzen, neuste zuerst. */
export const holeReferenzen = cache(async () => {
  const alle = await reader.collections.referenzen.all();
  const sichtbar = alle.map(({ slug, entry }) => ({ slug, ...entry })).filter((r) => r.veroeffentlicht);
  return neusteZuerst(sichtbar);
});

export const holeReferenz = cache(async (slug: string) => {
  const eintrag = await reader.collections.referenzen.read(slug);
  if (!eintrag || !eintrag.veroeffentlicht) return null;
  return { slug, ...eintrag };
});

/** Referenzen für die Startseite: markierte zuerst, Rest automatisch mit den neusten aufgefüllt. */
export async function holeReferenzenFuerStartseite(anzahl: number) {
  return waehleFuerStartseite(await holeReferenzen(), anzahl);
}

// Stellen -----------------------------------------------------------------------

/** Alle offenen und noch gültigen Stellen, neuste zuerst. */
export const holeJobs = cache(async () => {
  const heute = heuteIso();
  const alle = await reader.collections.jobs.all();
  const offen = alle
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((j) => j.aktiv && istNochGueltig(j.gueltigBis, heute));
  return neusteZuerst(offen);
});

export const holeJob = cache(async (slug: string) => {
  const job = (await holeJobs()).find((j) => j.slug === slug);
  return job ?? null;
});

export async function holeJobsFuerStartseite(anzahl: number | 'alle') {
  const jobs = await holeJobs();
  return anzahl === 'alle' ? jobs : waehleFuerStartseite(jobs, anzahl);
}

// Produkte und Datenblätter -----------------------------------------------------

type DatenblattIndex = typeof datenblattIndex;
type IndexEintrag = DatenblattIndex['eintraege'][keyof DatenblattIndex['eintraege']];

/** Produkte ohne eingetragene Kategorie landen hier (ein PDF plus Name genügt zum Anlegen). */
export const KATEGORIE_OHNE = 'Weitere Produkte';

/** Alle Produkte, sortiert nach Reihenfolge. Bestimmt zugleich die Reihenfolge der Kategorien (erstes Vorkommen). */
export const holeProdukte = cache(async () => {
  const alle = await reader.collections.produkte.all();
  return alle
    .map(({ slug, entry }) => ({ slug, ...entry, kategorie: entry.kategorie.trim() || KATEGORIE_OHNE }))
    .sort((a, b) => a.reihenfolge - b.reihenfolge || a.titel.localeCompare(b.titel, 'de'));
});

/**
 * Produkte mit den automatisch aus dem PDF abgeleiteten Angaben (scripts/erzeuge-datenblaetter.mjs):
 * Vorschau, Bild aus dem Datenblatt, Suchtext, erkannter Titel, Artikelnummern, Prüfsumme.
 * Nur Produkte mit hinterlegtem Datenblatt erhalten einen Index-Eintrag; die anderen bleiben "auf Anfrage".
 */
export const holeDatenblaetter = cache(async () => {
  const produkte = await holeProdukte();
  const eintraege = datenblattIndex.eintraege as Record<string, IndexEintrag | undefined>;
  return produkte.map((p) => {
    const index = p.dokument ? eintraege[p.slug] : undefined;
    const passt = index && index.dokument === p.dokument ? index : undefined;
    return {
      ...p,
      pruefsumme: passt?.pruefsumme ?? null,
      seiten: passt?.seiten ?? 0,
      bytes: passt?.bytes ?? 0,
      lesbar: passt?.lesbar ?? false,
      titelImDokument: passt?.titelImDokument ?? '',
      textauszug: passt?.textauszug ?? '',
      suchtext: passt?.suchtext ?? '',
      artikelnummern: passt?.artikelnummern ?? [],
      dokumentdatum: passt?.dokumentdatum ?? '',
      vorschau: passt?.vorschau ?? null,
      bild: passt?.bild ?? null,
      indexFehler: passt && 'fehler' in passt ? (passt.fehler as string) : null,
    };
  });
});

/** Kategorien in der Reihenfolge des ersten Vorkommens (für Menü und Filter). */
export async function holeProduktKategorien() {
  const produkte = await holeProdukte();
  return [...new Set(produkte.map((p) => p.kategorie))];
}

// Team ------------------------------------------------------------------------

/** Team aus dem Singleton "Team": die Reihenfolge im CMS (per Ziehen) ist die Reihenfolge auf der Website. */
export const holeTeam = cache(async () => {
  const daten = await reader.singletons.team.read();
  return (daten?.personen ?? []).map((p, i) => ({ ...p, reihenfolge: i }));
});

export type Referenz = Awaited<ReturnType<typeof holeReferenzen>>[number];
export type Produkt = Awaited<ReturnType<typeof holeProdukte>>[number];
export type Datenblatt = Awaited<ReturnType<typeof holeDatenblaetter>>[number];
export type Person = Awaited<ReturnType<typeof holeTeam>>[number];
export type Job = Awaited<ReturnType<typeof holeJobs>>[number];
export type Leistung = Awaited<ReturnType<typeof holeLeistungen>>[number];
export type Einstellungen = Awaited<ReturnType<typeof holeEinstellungen>>;
export type Navigation = Awaited<ReturnType<typeof holeNavigation>>;
export type Startseite = Awaited<ReturnType<typeof holeStartseite>>;
export type Block = Startseite['bloecke'][number];
