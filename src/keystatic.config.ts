import { collection, config, fields, singleton } from '@keystatic/core';
import { GITHUB_REPO, KEYSTATIC_MODUS, PROJEKT_NAME } from './site.config';
import { seitenBloecke } from './keystatic/bloecke';
import { alttext, bild, datei, fliesstext, langtext, link, logosFeld, seo, text, titelMitAdresse } from './keystatic/felder';

/**
 * Titel, Einleitung und SEO für die festen Übersichtsseiten /leistungen, /referenzen und /jobs.
 * `zusatz` ergänzt weitere Felder vor dem SEO-Feld, z. B. das Logo-Band auf /referenzen.
 */
function uebersicht<Zusatz extends object = Record<string, never>>(label: string, standardTitel: string, zusatz: Zusatz = {} as Zusatz) {
  return fields.object(
    {
      ueberzeile: text('Überzeile', { max: 60, beschreibung: 'Kleine Zeile über dem Titel. Kann leer bleiben.' }),
      titel: text('Titel', { pflicht: true, max: 90, standard: standardTitel }),
      einleitung: langtext('Einleitung', { max: 400 }),
      ...zusatz,
      seo: seo(),
    },
    { label }
  );
}

/**
 * SPEICHERMODUS
 * Wird in src/site.config.ts eingestellt (KEYSTATIC_MODUS).
 * 'automatisch': lokal beim Entwickeln, GitHub auf Netlify.
 */
const lokal =
  KEYSTATIC_MODUS === 'lokal' || (KEYSTATIC_MODUS === 'automatisch' && process.env.NODE_ENV === 'development');

export default config({
  storage: lokal ? { kind: 'local' } : { kind: 'github', repo: GITHUB_REPO as `${string}/${string}` },

  ui: {
    brand: { name: PROJEKT_NAME },
    navigation: {
      Seiten: ['startseite', 'seiten'],
      Inhalte: ['leistungen', 'referenzen', 'produkte', 'team', 'jobs'],
      Einstellungen: ['einstellungen', 'navigation', 'uebersichten'],
    },
  },

  singletons: {
    einstellungen: singleton({
      label: 'Firma und Kontakt',
      path: 'content/einstellungen/firma',
      format: { data: 'json' },
      schema: {
        firmenname: text('Firmenname', { pflicht: true, max: 80, beschreibung: 'Vollständig mit Rechtsform, z. B. Muster AG.' }),
        kurzbeschreibung: langtext('Kurzbeschreibung', {
          pflicht: true,
          max: 200,
          beschreibung: 'Ein bis zwei Sätze für die Fusszeile und strukturierte Daten (Google).',
        }),
        logo: bild('Logo für hellen Hintergrund', 'firma', { hinweis: 'SVG, sonst PNG mit transparentem Hintergrund, unter 30 KB.' }),
        logohell: bild('Logo für dunklen Hintergrund', 'firma', { hinweis: 'Helle Version für die Fusszeile. SVG, sonst PNG mit transparentem Hintergrund.' }),
        telefon: text('Telefon', { pflicht: true, max: 30, beschreibung: 'Internationales Format, z. B. +41 71 000 00 00' }),
        whatsapp: text('WhatsApp-Nummer (optional)', {
          max: 30,
          beschreibung: 'Internationales Format, z. B. +41 71 000 00 00. Leer lassen, dann erscheint kein WhatsApp-Knopf.',
        }),
        email: fields.text({
          label: 'E-Mail',
          validation: {
            isRequired: true,
            pattern: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Bitte eine gültige E-Mail-Adresse eingeben.' },
          },
        }),
        strasse: text('Strasse und Nummer', { pflicht: true, max: 80 }),
        plz: text('PLZ', { pflicht: true, max: 10 }),
        ort: text('Ort', { pflicht: true, max: 60 }),
        kanton: text('Kanton (Kürzel)', { max: 2, beschreibung: 'z. B. TG, SG, ZH. Wird für Google Jobs und die Firmenangaben verwendet.' }),
        land: fields.select({
          label: 'Land',
          options: [
            { label: 'Schweiz', value: 'CH' },
            { label: 'Liechtenstein', value: 'LI' },
            { label: 'Deutschland', value: 'DE' },
            { label: 'Österreich', value: 'AT' },
          ],
          defaultValue: 'CH',
        }),
        oeffnungszeiten: fields.array(
          fields.object({
            tage: text('Tage', { pflicht: true, max: 40, beschreibung: 'z. B. "Montag bis Donnerstag"' }),
            zeiten: text('Zeiten', { pflicht: true, max: 60, beschreibung: 'z. B. "07:30 bis 12:00, 13:00 bis 17:00"' }),
          }),
          { label: 'Öffnungszeiten', itemLabel: (p) => `${p.fields.tage.value}: ${p.fields.zeiten.value}` }
        ),
        socialMedia: fields.array(
          fields.object({
            plattform: fields.select({
              label: 'Plattform',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
              ],
              defaultValue: 'linkedin',
            }),
            url: fields.url({ label: 'Link zur Profilseite', validation: { isRequired: true } }),
          }),
          { label: 'Social Media', itemLabel: (p) => p.fields.plattform.value }
        ),
        seoTitel: text('Standard-SEO-Titel', { pflicht: true, max: 60, beschreibung: 'Titel der Startseite in Google.' }),
        seoBeschreibung: langtext('Standard-SEO-Beschreibung', { pflicht: true, max: 160 }),
        ogbild: bild('Vorschaubild für Social Media', 'firma', { hinweis: 'Erscheint, wenn die Website auf LinkedIn, WhatsApp usw. geteilt wird. JPG, genau 1200 x 630 px, unter 200 KB.' }),
      },
    }),

    navigation: singleton({
      label: 'Navigation',
      path: 'content/einstellungen/navigation',
      format: { data: 'json' },
      schema: {
        hauptmenue: fields.array(
          fields.object({
            text: text('Text', { pflicht: true, max: 30 }),
            link: link('Ziel', { pflicht: true }),
            unterpunkte: fields.array(
              fields.object({
                text: text('Text', { pflicht: true, max: 40 }),
                link: link('Ziel', { pflicht: true }),
                beschreibung: text('Kurzbeschreibung', { max: 90, beschreibung: 'Erscheint im Menü unter dem Text. Ein kurzer Satz. Kann leer bleiben.' }),
                hervorgehoben: fields.checkbox({ label: 'Hervorheben (z. B. "Alle Leistungen")', defaultValue: false }),
              }),
              {
                label: 'Untermenü',
                description:
                  'Ab fünf Unterpunkten erscheint ein zweispaltiges Menü. Beim Menüpunkt Produkte werden die Kategorien der Datenblätter automatisch ergänzt.',
                itemLabel: (p) => p.fields.text.value || 'Unterpunkt',
              }
            ),
          }),
          { label: 'Hauptmenü', itemLabel: (p) => p.fields.text.value || 'Menüpunkt' }
        ),
        knopf: fields.object(
          {
            text: text('Beschriftung', { max: 30 }),
            link: link('Ziel'),
          },
          { label: 'Knopf rechts im Menü', description: 'Beide Felder ausfüllen, sonst erscheint kein Knopf.' }
        ),
        fusszeile: fields.array(
          fields.object({
            text: text('Text', { pflicht: true, max: 40 }),
            link: link('Ziel', { pflicht: true }),
          }),
          { label: 'Links in der Fusszeile', itemLabel: (p) => p.fields.text.value || 'Link' }
        ),
        rechtliches: fields.array(
          fields.object({
            text: text('Text', { pflicht: true, max: 40 }),
            link: link('Ziel', { pflicht: true }),
          }),
          { label: 'Rechtliche Links (Impressum, Datenschutz)', itemLabel: (p) => p.fields.text.value || 'Link' }
        ),
      },
    }),

    uebersichten: singleton({
      label: 'Übersichtsseiten',
      path: 'content/einstellungen/uebersichten',
      format: { data: 'json' },
      schema: {
        leistungen: uebersicht('Seite /leistungen', 'Unsere Leistungen'),
        referenzen: uebersicht('Seite /referenzen', 'Referenzen', {
          logos: logosFeld({ label: 'Referenzlogos (zentrale Liste für Logoslider und /referenzen)' }),
          allgemeinTitel: text('Abschnitt Logos auf /referenzen: Titel', { max: 90, standard: 'Verbindungen, die Vertrauen schaffen' }),
          allgemeinEinleitung: langtext('Abschnitt Logos auf /referenzen: Einleitung', { max: 500 }),
          allgemeinHinweis: langtext('Abschnitt Logos auf /referenzen: Text unter den Logos (Die Arbeit hinter den Logos)', {
            max: 500,
            beschreibung: 'z. B. Einordnung, dass Logos das Referenzumfeld zeigen und keine Aussage über eine aktuelle Partnerschaft sind.',
          }),
        }),
        jobs: uebersicht('Seite /jobs', 'Offene Stellen'),
        produkte: uebersicht('Seite /produkte', 'Produkte und Datenblätter', {
          anfrageHinweis: langtext('Hinweis zu Anfragen', {
            max: 300,
            beschreibung: 'Erscheint über dem Katalog, z. B. "Preise und Verfügbarkeit auf Anfrage".',
          }),
          archivHinweis: langtext('Hinweis zu den Datenblättern', {
            max: 300,
            beschreibung: 'Erscheint unter dem Katalog, z. B. dass ältere Datenblätter frühere Kontaktangaben enthalten können.',
          }),
        }),
        team: uebersicht('Seite /team', 'Geschäftsleitung und Technik', {
          leitungTitel: text('Titel Abschnitt Geschäftsleitung', { max: 90, standard: 'Geschäftsleitung' }),
          technikTitel: text('Titel Abschnitt Technik', { max: 90, standard: 'Technik' }),
        }),
      },
    }),

    startseite: singleton({
      label: 'Startseite',
      path: 'content/startseite/startseite',
      format: { data: 'json' },
      schema: {
        seo: seo(),
        bloecke: seitenBloecke('startseite'),
      },
    }),

    team: singleton({
      label: 'Team',
      path: 'content/team',
      format: { data: 'json' },
      schema: {
        personen: fields.array(
          fields.object({
            name: text('Vorname und Name', { pflicht: true, max: 60 }),
            bereich: fields.select({
              label: 'Bereich',
              description: 'Geschäftsleitung erscheint auf der Startseite und auf Über uns, Technik nur auf der Teamseite.',
              options: [
                { label: 'Geschäftsleitung', value: 'leitung' },
                { label: 'Technik', value: 'technik' },
              ],
              defaultValue: 'technik',
            }),
            funktion: text('Funktion', { pflicht: true, max: 80, beschreibung: 'z. B. Geschäftsleiter, LWL-Techniker, Allrounderin' }),
            foto: bild('Porträt', 'team', {
              hinweis: 'Hochformat 4:5 (z. B. 800 x 1000 px), JPG, PNG oder WebP, möglichst heller, ruhiger Hintergrund. Grosse Dateien werden beim Veröffentlichen automatisch verkleinert. Ohne Foto erscheint ein neutraler Platzhalter.',
            }),
            email: fields.text({
              label: 'E-Mail (optional)',
              validation: { pattern: { regex: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Bitte eine gültige E-Mail-Adresse eingeben.' } },
            }),
            telefon: text('Telefon (optional)', { max: 30, beschreibung: 'Internationales Format, z. B. +41 76 000 00 00' }),
          }),
          {
            label: 'Personen',
            description: 'Reihenfolge per Ziehen am Griff links ändern. Neue Person mit Hinzufügen unten anlegen.',
            itemLabel: (p) => [p.fields.name.value || 'Person', p.fields.funktion.value].filter(Boolean).join(', '),
          }
        ),
      },
    }),
  },

  collections: {
    seiten: collection({
      label: 'Seiten',
      slugField: 'titel',
      path: 'content/seiten/*',
      format: { data: 'json' },
      columns: ['titel'],
      schema: {
        // Gesperrte Adressen: gleiche Liste wie RESERVIERT in scripts/pruefe-konfiguration.mjs
        titel: titelMitAdresse('Seitentitel', { gesperrt: ['leistungen', 'referenzen', 'jobs', 'produkte', 'team', 'downloads', 'keystatic', 'api', 'bilder', 'dokumente'] }),
        inSitemap: fields.checkbox({
          label: 'Für Google freigeben',
          description: 'Für Impressum und Datenschutz ausschalten.',
          defaultValue: true,
        }),
        seo: seo(),
        bloecke: seitenBloecke('seiten'),
      },
    }),

    leistungen: collection({
      label: 'Leistungen',
      slugField: 'titel',
      path: 'content/leistungen/*',
      format: { contentField: 'inhalt' },
      entryLayout: 'content',
      columns: ['titel', 'reihenfolge'],
      schema: {
        titel: titelMitAdresse('Titel'),
        reihenfolge: fields.integer({
          label: 'Reihenfolge',
          description: 'Kleinere Zahl erscheint zuerst.',
          defaultValue: 10,
          validation: { isRequired: true, min: 0, max: 999 },
        }),
        kurzbeschreibung: langtext('Kurzbeschreibung', { pflicht: true, max: 220, beschreibung: 'Erscheint auf der Kachel in Übersichten.' }),
        bild: bild('Bild', 'leistungen', { pflicht: true }),
        bildAlt: alttext(true),
        merkmale: fields.array(
          fields.object({
            symbol: fields.select({
              label: 'Symbol',
              options: [
                { label: 'Spleissen (Kabel)', value: 'spleiss' },
                { label: 'Messung (Kurve)', value: 'messung' },
                { label: 'Protokoll (Dokument mit Haken)', value: 'protokoll' },
                { label: 'Standort (Pin)', value: 'standort' },
                { label: 'Rack (Server)', value: 'rack' },
                { label: 'Team (Personen)', value: 'team' },
                { label: 'Zeit (Uhr)', value: 'zeit' },
                { label: 'Werkzeug (Schraubenschlüssel)', value: 'werkzeug' },
                { label: 'Gebäude', value: 'gebaeude' },
                { label: 'Lieferung (Paket)', value: 'lieferung' },
                { label: 'Schulung (Hut)', value: 'schulung' },
                { label: 'Telefon', value: 'telefon' },
                { label: 'Suche (Lupe)', value: 'suche' },
                { label: 'Haken (Schild)', value: 'haken' },
              ],
              defaultValue: 'haken',
            }),
            text: text('Merkmal', { pflicht: true, max: 90, beschreibung: 'Ein Satzteil, z. B. "Spleissen in Muffen, Spleissboxen und Kabelendverschlüssen".' }),
          }),
          {
            label: 'Auf einen Blick (3 bis 6 Merkmale)',
            description: 'Erscheint auf der Detailseite neben dem Bild und läuft beim Scrollen mit. Nur Aussagen, die auch im Text stehen.',
            itemLabel: (p) => p.fields.text.value || 'Merkmal',
            validation: { length: { max: 6 } },
          }
        ),
        seo: seo(),
        inhalt: fliesstext('Inhalt', 'leistungen'),
      },
    }),

    referenzen: collection({
      label: 'Referenzen',
      slugField: 'titel',
      path: 'content/referenzen/*',
      format: { contentField: 'inhalt' },
      entryLayout: 'content',
      columns: ['titel', 'datum', 'aufStartseite', 'veroeffentlicht'],
      schema: {
        titel: titelMitAdresse('Projektname'),
        datum: fields.date({
          label: 'Abschlussdatum',
          description: 'Bestimmt die Reihenfolge. Die neusten Referenzen erscheinen automatisch zuerst.',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        datumZeigen: fields.checkbox({
          label: 'Abschlussdatum anzeigen',
          description: 'Ausschalten bei laufenden Projekten oder Projektgruppen ohne festes Abschlussdatum. Das Datum bestimmt dann nur die Reihenfolge.',
          defaultValue: true,
        }),
        veroeffentlicht: fields.checkbox({
          label: 'Veröffentlicht',
          description: 'Ausschalten, um die Referenz zu verstecken, ohne sie zu löschen.',
          defaultValue: true,
        }),
        aufStartseite: fields.checkbox({
          label: 'Auf Startseite zeigen',
          description:
            'Häkchen setzen, damit diese Referenz sicher auf der Startseite erscheint. Ohne Häkchen erscheinen dort automatisch die neusten Referenzen. Freie Plätze werden immer mit den neusten aufgefüllt.',
          defaultValue: false,
        }),
        kunde: text('Bauherrschaft', { max: 80, beschreibung: 'Nur mit Einverständnis nennen. Bei Privatpersonen z. B. "Privat".' }),
        ort: text('Ort', { max: 60 }),
        kategorie: text('Kategorie', { max: 40, beschreibung: 'z. B. Neubau, Umbau, Service' }),
        kurzbeschreibung: langtext('Kurzbeschreibung', { pflicht: true, max: 220 }),
        titelbild: bild('Titelbild', 'referenzen', {
          hinweis: 'JPG oder WebP, idealerweise 2400 px breit und unter 500 KB. Ohne Bild zeigt die Seite einen Platzhalter.',
        }),
        titelbildAlt: alttext(),
        galerie: fields.array(
          fields.object({
            bild: bild('Bild', 'referenzen', { pflicht: true }),
            alt: alttext(true),
          }),
          { label: 'Weitere Bilder', itemLabel: (p) => p.fields.alt.value || 'Bild' }
        ),
        video: fields.file({
          label: 'Video (optional)',
          description: 'MP4 (H.264), Hochformat oder Querformat, unter 5 MB. Wird erst beim Klick auf das Standbild geladen und bremst die Seite nicht. Grosse Dateien vorher komprimieren.',
          directory: 'public/videos/referenzen',
          publicPath: '/videos/referenzen/',
        }),
        videoposter: bild('Standbild für das Video', 'referenzen', {
          hinweis: 'JPG, erscheint vor dem Abspielen mit einem Abspielsymbol. Ohne Standbild wird das Titelbild verwendet.',
        }),
        videotext: text('Beschreibung des Videos', { max: 160, beschreibung: 'Ein Satz, was im Video zu sehen ist (für Suchmaschinen und Screenreader).' }),
        seo: seo(),
        inhalt: fliesstext('Projektbeschrieb', 'referenzen'),
      },
    }),

    jobs: collection({
      label: 'Stellen',
      slugField: 'titel',
      path: 'content/jobs/*',
      format: { contentField: 'inhalt' },
      entryLayout: 'content',
      columns: ['titel', 'aktiv', 'datum', 'aufStartseite'],
      schema: {
        titel: titelMitAdresse('Stellenbezeichnung', { beschreibung: 'Mit beiden Formen oder neutral, z. B. "Elektroinstallateur/in EFZ".' }),
        aktiv: fields.checkbox({
          label: 'Stelle ist offen',
          description: 'Ausschalten, sobald die Stelle besetzt ist. Die Seite verschwindet dann automatisch.',
          defaultValue: true,
        }),
        aufStartseite: fields.checkbox({
          label: 'Auf Startseite zeigen',
          description: 'Markierte Stellen haben Vorrang. Ohne Markierung erscheinen automatisch die neusten.',
          defaultValue: false,
        }),
        datum: fields.date({
          label: 'Ausgeschrieben am',
          description: 'Bestimmt die Reihenfolge. Die neusten Stellen erscheinen zuerst.',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        gueltigBis: fields.date({
          label: 'Ausschreibung gültig bis (optional)',
          description: 'Nach diesem Datum verschwindet die Stelle bei der nächsten Aktualisierung der Website automatisch (spätestens am Folgetag).',
        }),
        pensum: text('Pensum', { pflicht: true, max: 30, beschreibung: 'z. B. "80 bis 100 %"' }),
        anstellungsart: fields.select({
          label: 'Anstellungsart',
          options: [
            { label: 'Festanstellung Vollzeit', value: 'FULL_TIME' },
            { label: 'Festanstellung Teilzeit', value: 'PART_TIME' },
            { label: 'Befristet', value: 'TEMPORARY' },
            { label: 'Lehrstelle', value: 'INTERN' },
          ],
          defaultValue: 'FULL_TIME',
        }),
        arbeitsort: text('Arbeitsort', { pflicht: true, max: 60 }),
        eintritt: text('Eintritt', { max: 40, beschreibung: 'z. B. "Nach Vereinbarung" oder "1. März 2027"' }),
        kurzbeschreibung: langtext('Kurzbeschreibung', { pflicht: true, max: 220 }),
        kontaktperson: text('Kontaktperson', { max: 80 }),
        bewerbungEmail: fields.text({
          label: 'Bewerbungen an (E-Mail-Adresse)',
          validation: {
            isRequired: true,
            pattern: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Bitte eine gültige E-Mail-Adresse eingeben.' },
          },
        }),
        seo: seo(),
        inhalt: fliesstext('Stellenbeschrieb', 'jobs'),
      },
    }),

    produkte: collection({
      label: 'Produkte und Datenblätter',
      slugField: 'titel',
      path: 'content/produkte/*',
      format: { data: 'json' },
      columns: ['titel', 'kategorie', 'reihenfolge'],
      schema: {
        titel: titelMitAdresse('Produktname', {
          beschreibung:
            'Neues Produkt in zwei Schritten: Produktname eintippen und unten das PDF-Datenblatt hochladen, dann speichern. Vorschaubild, Produktbild, Suchtext, Artikelnummern und Datum liest die Website automatisch aus dem PDF. Technische Angaben werden hier nicht gepflegt.',
        }),
        kategorie: text('Kategorie', {
          max: 60,
          beschreibung: 'Gruppiert die Produkte im Katalog und im Menü, z. B. "Patchkabel LWL". Gleicher Wortlaut wie bei anderen Produkten derselben Gruppe. Leer lassen, dann erscheint das Produkt unter "Weitere Produkte".',
        }),
        reihenfolge: fields.integer({
          label: 'Reihenfolge',
          description: 'Kleinere Zahl erscheint zuerst (innerhalb der Kategorie und für die Reihenfolge der Kategorien). Kann leer bleiben.',
          defaultValue: 100,
          validation: { isRequired: true, min: 0, max: 999 },
        }),
        beschreibung: langtext('Hinweis (optional)', {
          max: 220,
          beschreibung: 'Nur für Produkte ohne Datenblatt, z. B. "Auf Anfrage". Keine technischen Daten hier eintragen, die gehören ins PDF.',
        }),
        dokument: datei('Datenblatt', 'produkte', {
          beschreibung:
            'Das PDF ist die einzige Quelle für Bild, Text und Suche. Zum Aktualisieren das neue PDF hochladen und speichern; die Website erzeugt Vorschau, Suchtext und die Kennzahl beim nächsten Veröffentlichen automatisch neu.',
        }),
      },
    }),
  },
});
