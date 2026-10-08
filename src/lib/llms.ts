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
    `Sitz: ${e.strasse}, ${e.plz} ${e.ort}, Schweiz. Telefon ${e.telefon}, E-Mail ${e.email}. Einsatzgebiet: ${e.einsatzgebiet || 'Schweiz'}. Sprache der Website: Deutsch (Schweiz).`,
    ...(e.oeffnungszeiten.length ? [`Erreichbarkeit: ${e.oeffnungszeiten.map((z) => `${z.tage} ${z.zeiten} Uhr`).join('; ')}.`] : []),
    ...(e.uid ? [`UID: ${e.uid}.`] : []),
    'Preise stehen nicht auf der Website; Offerten gibt es auf Anfrage über das Kontaktformular.',
    '',
  ];
}

/**
 * Text einer frei gestalteten Seite (Blöcke aus dem CMS): Titel, Texte und Einträge der Blöcke sowie Fliesstext.
 * Die Blocktypen werden nicht einzeln behandelt, sondern über ihre üblichen Feldnamen gelesen.
 */
async function bloeckeAlsText(bloecke: { discriminant: string; value: unknown }[]): Promise<string[]> {
  const zeilen: string[] = [];
  for (const b of bloecke) {
    const v = (b.value ?? {}) as Record<string, unknown>;
    const s = (k: string) => (typeof v[k] === 'string' && v[k] ? zeile(v[k] as string) : '');
    if (['ctaBand', 'logoslider', 'kontaktformular', 'datenblaetter', 'referenzen', 'leistungen', 'leistungsbereiche', 'teamAuszug', 'jobs'].includes(b.discriminant)) continue;
    const titel = s('titel');
    if (titel) zeilen.push(`### ${titel}`, '');
    for (const k of ['text', 'einleitung']) if (s(k)) zeilen.push(s(k), '');
    if (Array.isArray(v.eintraege)) {
      for (const e of v.eintraege as Record<string, unknown>[]) {
        const t = typeof e.titel === 'string' ? zeile(e.titel) : '';
        const x = typeof e.text === 'string' ? zeile(e.text) : typeof e.bezeichnung === 'string' ? zeile(e.bezeichnung) : '';
        const w = typeof e.wert === 'string' ? zeile(e.wert) : '';
        if (t || x) zeilen.push(`- ${[w, t, x].filter(Boolean).join(': ').replace(': ', w ? ' ' : ': ')}`);
      }
      zeilen.push('');
    }
    if (typeof v.inhalt === 'function') {
      const text = await markdocAlsText(v.inhalt as Parameters<typeof markdocAlsText>[0]);
      if (text.trim()) zeilen.push(text.trim(), '');
    }
  }
  return zeilen;
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
    `- [Unsere Kunden (Referenzlogos)](${url('/kunden')})`,
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
  const [leistungen, referenzen, jobs, { leistungen: ul, referenzen: ur, produkte: up }, produkte, kategorien, team, seiten] = await Promise.all([
    holeLeistungen(),
    holeReferenzen(),
    holeJobs(),
    holeUebersichten(),
    holeDatenblaetter(),
    holeProduktKategorien(),
    holeTeam(),
    holeAlleSeiten(),
  ]);
  const abschnitte: string[] = [...(await kopf())];

  // Über uns zuerst: Werte, Arbeitsweise und Ausrüstung als Kontext für alles Weitere
  const ueberUns = seiten.find((s) => s.slug === 'ueber-uns');
  if (ueberUns) {
    abschnitte.push(`## ${zeile(ueberUns.titel)}`, '', `Adresse: ${url('/ueber-uns')}`, '', ...(await bloeckeAlsText(ueberUns.bloecke as { discriminant: string; value: unknown }[])));
  }

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

  // Kundenlogos: nur Namen, keine Aussage über Auftragsumfang (Hinweistext aus dem CMS)
  const logos = ur.logos.logos;
  if (logos.length > 0) {
    abschnitte.push('## Unsere Kunden (Referenzlogos)', '', `Adresse: ${url('/kunden')}`, '');
    if (ur.allgemeinHinweis) abschnitte.push(zeile(ur.allgemeinHinweis), '');
    abschnitte.push(logos.map((l) => zeile(l.name)).join(', ') + '.', '');
  }

  // Produkte: Kategorien mit Datenblättern (PDF), ohne Preise
  abschnitte.push(`## ${zeile(up.titel)}`, '', `Katalog mit Suche: ${url('/produkte')}. Alle PDFs: ${url('/downloads')}. Preise auf Anfrage.`, '');
  for (const k of kategorien) {
    const inKategorie = produkte.filter((p) => p.kategorie === k);
    abschnitte.push(`### ${zeile(k)}`, '', ...inKategorie.map((p) => `- ${zeile(p.titel)}${p.dokument ? ` (Datenblatt: ${url(p.dokument)})` : ' (auf Anfrage)'}`), '');
  }

  abschnitte.push('## Team', '', ...team.map((p) => `- ${p.name}, ${zeile(p.funktion)} (${p.bereich === 'leitung' ? 'Geschäftsleitung' : 'Technik'})`), '');

  abschnitte.push('## Offene Stellen', '');
  if (jobs.length > 0) {
    for (const j of jobs) {
      abschnitte.push(`### ${zeile(j.titel)}`, '', `Adresse: ${url(`/jobs/${j.slug}`)}. Pensum: ${zeile(j.pensum)}. Arbeitsort: ${zeile(j.arbeitsort)}.`, '', zeile(j.kurzbeschreibung), '', await markdocAlsText(j.inhalt), '');
    }
  } else {
    abschnitte.push(`Zurzeit keine offenen Stellen. Initiativbewerbungen sind willkommen: ${url('/jobs')}.`, '');
  }

  return abschnitte.join('\n').replace(/\n{3,}/g, '\n\n');
}
