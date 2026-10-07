import 'server-only';
import { holeAlleSeiten, holeDatenblaetter, holeEinstellungen, holeJobs, holeLeistungen, holeProduktKategorien, holeReferenzen, holeTeam, holeUebersichten } from './cms';
import { markdocAlsText } from './markdoc';
import { sauberText } from './text';
import { DOMAIN } from '@/site.config';

/**
 * Zusammenfassung der Website für Sprachmodelle und KI-Suchsysteme (llms.txt, https://llmstxt.org).
 * /llms.txt: kompakte Übersicht mit Links. /llms-full.txt: zusätzlich die vollständigen Texte der Leistungen,
 * Referenzen und Stellen. Beides wird beim Build aus den CMS-Inhalten erzeugt, nichts wird von Hand gepflegt.
 */

const url = (pfad: string) => new URL(pfad, DOMAIN).toString();
const zeile = (text: string) => sauberText(text).replace(/\s*\n\s*/g, ' ').trim();

async function kopf() {
  const e = await holeEinstellungen();
  return [
    `# ${e.firmenname}`,
    '',
    `> ${zeile(e.seoBeschreibung)}`,
    '',
    zeile(e.kurzbeschreibung),
    '',
    `Sitz: ${e.strasse}, ${e.plz} ${e.ort}, Schweiz. Telefon ${e.telefon}, E-Mail ${e.email}. Einsatzgebiet: ganze Schweiz. Sprache der Website: Deutsch (Schweiz).`,
    'Preise stehen nicht auf der Website; Offerten gibt es auf Anfrage über das Kontaktformular.',
    '',
  ];
}

export async function llmsKurz(): Promise<string> {
  const [e, { leistungen: ul, referenzen: ur, produkte: up }, leistungen, referenzen, produkte, kategorien, team, jobs, seiten] = await Promise.all([
    holeEinstellungen(),
    holeUebersichten(),
    holeLeistungen(),
    holeReferenzen(),
    holeDatenblaetter(),
    holeProduktKategorien(),
    holeTeam(),
    holeJobs(),
    holeAlleSeiten(),
  ]);
  const mitPdf = produkte.filter((p) => p.dokument);
  const zeilen = [
    ...(await kopf()),
    `## ${zeile(ul.titel)}`,
    '',
    ...leistungen.map((l) => `- [${zeile(l.titel)}](${url(`/leistungen/${l.slug}`)}): ${zeile(l.kurzbeschreibung)}`),
    '',
    `## ${zeile(up.titel)}`,
    '',
    `${mitPdf.length} Datenblätter als PDF in ${kategorien.length} Kategorien (${kategorien.map(zeile).join(', ')}). Katalog mit Suche: ${url('/produkte')}, Liste aller PDFs: ${url('/downloads')}.`,
    '',
    `## ${zeile(ur.titel)}`,
    '',
    ...referenzen.map((r) => `- [${zeile(r.titel)}](${url(`/referenzen/${r.slug}`)})${r.ort ? ` (${zeile(r.ort)})` : ''}: ${zeile(r.kurzbeschreibung)}`),
    '',
    '## Team',
    '',
    ...team.map((p) => `- ${p.name}, ${zeile(p.funktion)} (${p.bereich === 'leitung' ? 'Geschäftsleitung' : 'Technik'})`),
    '',
    '## Offene Stellen',
    '',
    ...(jobs.length > 0 ? jobs.map((j) => `- [${zeile(j.titel)}](${url(`/jobs/${j.slug}`)}): ${zeile(j.kurzbeschreibung)}`) : ['Zurzeit keine offenen Stellen. Initiativbewerbungen sind willkommen.']),
    '',
    '## Weitere Seiten',
    '',
    `- [Startseite](${url('/')})`,
    `- [Kontakt](${url('/kontakt')}): Formular, Adresse, Karte`,
    `- [Team](${url('/team')})`,
    ...seiten.filter((s) => s.inSitemap && !['kontakt'].includes(s.slug)).map((s) => `- [${zeile(s.titel)}](${url(`/${s.slug}`)})`),
    `- [Vollständige Texte für Sprachmodelle](${url('/llms-full.txt')})`,
    `- [Sitemap](${url('/sitemap.xml')})`,
    '',
    `Betreiberin: ${e.firmenname}. Stand: ${new Date().toISOString().slice(0, 10)}.`,
    '',
  ];
  return zeilen.join('\n');
}

export async function llmsVoll(): Promise<string> {
  const [leistungen, referenzen, jobs, { leistungen: ul, referenzen: ur }] = await Promise.all([holeLeistungen(), holeReferenzen(), holeJobs(), holeUebersichten()]);
  const abschnitte: string[] = [...(await kopf())];

  abschnitte.push(`## ${zeile(ul.titel)}`, '');
  if (ul.einleitung) abschnitte.push(zeile(ul.einleitung), '');
  for (const l of leistungen) {
    abschnitte.push(`### ${zeile(l.titel)}`, '', `Adresse: ${url(`/leistungen/${l.slug}`)}`, '', zeile(l.kurzbeschreibung), '', await markdocAlsText(l.inhalt), '');
  }

  abschnitte.push(`## ${zeile(ur.titel)}`, '');
  for (const r of referenzen) {
    const fakten = [r.kunde ? `Bauherrschaft: ${zeile(r.kunde)}` : '', r.ort ? `Ort: ${zeile(r.ort)}` : '', r.kategorie ? `Kategorie: ${zeile(r.kategorie)}` : '', r.datum && r.datumZeigen ? `Abschluss: ${r.datum}` : ''].filter(Boolean);
    abschnitte.push(`### ${zeile(r.titel)}`, '', `Adresse: ${url(`/referenzen/${r.slug}`)}`, ...(fakten.length ? ['', fakten.join('. ') + '.'] : []), '', zeile(r.kurzbeschreibung), '', await markdocAlsText(r.inhalt), '');
  }

  if (jobs.length > 0) {
    abschnitte.push('## Offene Stellen', '');
    for (const j of jobs) {
      abschnitte.push(`### ${zeile(j.titel)}`, '', `Adresse: ${url(`/jobs/${j.slug}`)}. Pensum: ${zeile(j.pensum)}. Arbeitsort: ${zeile(j.arbeitsort)}.`, '', zeile(j.kurzbeschreibung), '', await markdocAlsText(j.inhalt), '');
    }
  }

  return abschnitte.join('\n').replace(/\n{3,}/g, '\n\n');
}
