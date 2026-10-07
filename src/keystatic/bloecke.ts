import { fields } from '@keystatic/core';
import { alttext, bild, fliesstext, langtext, link, logosFeld, text } from './felder';

/**
 * SEITENBAUKASTEN
 *
 * Diese Blöcke stehen auf der Startseite und auf allen frei gestaltbaren Seiten zur Verfügung.
 * Neuer Block = 3 Schritte (siehe docs/02-keystatic.md, Abschnitt "Neuen Block anlegen"):
 * 1. Schema hier ergänzen
 * 2. Komponente in src/components/bloecke/ anlegen
 * 3. In src/components/bloecke/BlockRenderer.tsx eintragen
 */

const knopf = (label: string) =>
  fields.object(
    {
      text: text('Beschriftung', { max: 40, beschreibung: 'Beschreibt die Handlung, z. B. "Offerte anfragen". Nicht "Mehr".' }),
      link: link('Ziel'),
    },
    { label, description: 'Beide Felder ausfüllen, sonst wird der Knopf nicht angezeigt.' }
  );

const ueberzeile = () => text('Überzeile', { max: 60, beschreibung: 'Kleine Zeile über dem Titel, z. B. "Leistungen" oder "Über uns". Kann leer bleiben.' });

export function seitenBloecke(bildOrdner: string) {
  return fields.blocks(
    {
      hero: {
        label: 'Startbereich (Hero)',
        itemLabel: (p) => p.fields.titel.value || 'Startbereich',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: langtext('Titel', { pflicht: true, max: 90, beschreibung: 'Die wichtigste Aussage der Seite, als ganzer Satz und konkret. Steht der Startbereich zuoberst, ist das der Haupttitel für Google. Zeilenumbrüche werden übernommen.' }),
          text: langtext('Einleitung', { max: 280 }),
          bild: bild('Bild', bildOrdner),
          bildAlt: text('Bildbeschreibung (Alt-Text)', {
            max: 160,
            beschreibung: 'Sachlich beschreiben, was zu sehen ist. Bei einem reinen Stimmungsbild hinter dem Text leer lassen.',
          }),
          knopfPrimaer: knopf('Hauptknopf'),
          knopfSekundaer: knopf('Zweiter Knopf'),
          variante: fields.select({
            label: 'Darstellung',
            description: 'Vollbild wirkt am stärksten, braucht aber ein ruhiges Bild. Geteilt eignet sich für Unterseiten und Bilder mit viel Detail.',
            options: [
              { label: 'Bild über die ganze Breite, Text darauf', value: 'vollbild' },
              { label: 'Text links, Bild rechts', value: 'geteilt' },
            ],
            defaultValue: 'vollbild',
          }),
          hoehe: fields.select({
            label: 'Höhe',
            description: 'Gross für die Startseite, kompakt für Unterseiten.',
            options: [
              { label: 'Gross (Startseite)', value: 'gross' },
              { label: 'Kompakt (Unterseiten)', value: 'kompakt' },
            ],
            defaultValue: 'gross',
          }),
        }),
      },

      textMitBild: {
        label: 'Text mit Bild',
        itemLabel: (p) => p.fields.titel.value || 'Text mit Bild',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Text', { pflicht: true, beschreibung: 'Absätze mit einer Leerzeile trennen.' }),
          bild: bild('Bild', bildOrdner, { pflicht: true }),
          bildAlt: alttext(true),
          bildPosition: fields.select({
            label: 'Bildposition',
            options: [
              { label: 'Rechts', value: 'rechts' },
              { label: 'Links', value: 'links' },
            ],
            defaultValue: 'rechts',
          }),
          knopf: knopf('Knopf (optional)'),
        }),
      },

      fliesstext: {
        label: 'Fliesstext',
        schema: fields.object({
          titel: text('Titel', { max: 90, beschreibung: 'Steht der Fliesstext zuoberst auf der Seite (z. B. Impressum), wird dieser Titel zum Seitentitel.' }),
          inhalt: fliesstext('Inhalt', bildOrdner),
        }),
      },

      kennzahlen: {
        label: 'Kennzahlen',
        itemLabel: () => 'Kennzahlen',
        schema: fields.object({
          eintraege: fields.array(
            fields.object({
              wert: text('Wert', {
                pflicht: true,
                max: 26,
                beschreibung:
                  'z. B. 1 Mio.+, 1\'000+ oder 24 h. Nur belegbare Zahlen. Der Wert "automatisch:datenblaetter" wird beim Build durch die Anzahl der tatsächlich hinterlegten Datenblätter ersetzt.',
              }),
              bezeichnung: text('Bezeichnung', { pflicht: true, max: 50 }),
            }),
            {
              label: 'Kennzahlen (2 bis 4)',
              itemLabel: (p) => `${p.fields.wert.value} ${p.fields.bezeichnung.value}`,
              validation: { length: { min: 2, max: 4 } },
            }
          ),
          darstellung: fields.select({
            label: 'Darstellung',
            options: [
              { label: 'Dunkles Band, Zahlen in Bernstein', value: 'dunkel' },
              { label: 'Gelbes Band', value: 'gelb' },
            ],
            defaultValue: 'dunkel',
          }),
        }),
      },

      vorteile: {
        label: 'Vorteile / Arbeitsweise',
        itemLabel: (p) => p.fields.titel.value || 'Vorteile',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          eintraege: fields.array(
            fields.object({
              titel: text('Titel', { pflicht: true, max: 60 }),
              text: langtext('Text', { pflicht: true, max: 240 }),
            }),
            {
              label: 'Einträge (3 bis 6)',
              itemLabel: (p) => p.fields.titel.value || 'Eintrag',
              validation: { length: { min: 3, max: 6 } },
            }
          ),
        }),
      },

      leistungen: {
        label: 'Leistungen (automatisch alle)',
        itemLabel: (p) => p.fields.titel.value || 'Leistungen',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280, beschreibung: 'Die Leistungen selbst erscheinen automatisch, sortiert nach dem Feld Reihenfolge.' }),
          anzahl: fields.select({
            label: 'Anzahl',
            description: 'Es erscheinen die ersten Leistungen nach dem Feld Reihenfolge.',
            options: [
              { label: '3 Leistungen', value: '3' },
              { label: '4 Leistungen', value: '4' },
              { label: 'Alle Leistungen', value: 'alle' },
            ],
            defaultValue: 'alle',
          }),
          linkText: text('Text für Link zur Übersicht', { max: 40, standard: 'Alle Leistungen' }),
        }),
      },

      leistungsbereiche: {
        label: 'Leistungsbereiche (vier Karten mit Bild)',
        itemLabel: (p) => p.fields.titel.value.replace(/\n/g, ' ') || 'Leistungsbereiche',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: langtext('Titel', { pflicht: true, max: 90, beschreibung: 'Zeilenumbrüche werden übernommen. Das letzte Wort erscheint als Kontur.' }),
          text: langtext('Einleitung', { max: 280 }),
          bereiche: fields.array(
            fields.object({
              titel: text('Titel', { pflicht: true, max: 50, beschreibung: 'Einsatzbereich, z. B. "Netze und Gemeinden".' }),
              text: langtext('Text', { pflicht: true, max: 200 }),
              leistung: fields.relationship({
                label: 'Leistung',
                description: 'Die Karte verlinkt auf diese Leistung und zeigt deren Bild.',
                collection: 'leistungen',
                validation: { isRequired: true },
              }),
              bild: bild('Eigenes Bild (optional)', bildOrdner, { beschreibung: 'Leer lassen, dann wird das Bild der gewählten Leistung verwendet.' }),
              bildAlt: alttext(),
            }),
            {
              label: 'Bereiche (2 bis 4)',
              itemLabel: (p) => p.fields.titel.value || 'Bereich',
              validation: { length: { min: 2, max: 4 } },
            }
          ),
          linkText: text('Text für Link zur Übersicht', { max: 40, standard: 'Alle Leistungen' }),
        }),
      },

      referenzen: {
        label: 'Referenzen (automatisch die neusten)',
        itemLabel: (p) => p.fields.titel.value || 'Referenzen',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          anzahl: fields.select({
            label: 'Anzahl',
            description:
              'Es erscheinen automatisch die neusten Referenzen. Referenzen mit Häkchen "Auf Startseite zeigen" haben Vorrang. Sind genau so viele markiert wie hier eingestellt, erscheinen nur diese.',
            options: [
              { label: '3 Referenzen', value: '3' },
              { label: '4 Referenzen', value: '4' },
              { label: '6 Referenzen', value: '6' },
            ],
            defaultValue: '4',
          }),
          linkText: text('Text für Link zur Übersicht', { max: 40, standard: 'Alle Referenzen' }),
        }),
      },

      jobs: {
        label: 'Offene Stellen (automatisch)',
        itemLabel: (p) => p.fields.titel.value || 'Offene Stellen',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          anzahl: fields.select({
            label: 'Anzahl',
            description:
              'Zeigt automatisch die neusten aktiven Stellen. Stellen mit Häkchen "Auf Startseite zeigen" haben Vorrang. Gibt es keine aktive Stelle, wird ein Hinweis für Initiativbewerbungen gezeigt.',
            options: [
              { label: '3 Stellen', value: '3' },
              { label: '4 Stellen', value: '4' },
              { label: 'Alle aktiven Stellen', value: 'alle' },
            ],
            defaultValue: '3',
          }),
          keineStellenText: langtext('Text, wenn keine Stelle offen ist', {
            max: 240,
            standard: 'Zurzeit sind alle Stellen besetzt. Initiativbewerbungen lesen wir trotzdem gerne.',
          }),
        }),
      },

      ablauf: {
        label: 'Ablauf in Schritten',
        itemLabel: (p) => p.fields.titel.value || 'Ablauf',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          schritte: fields.array(
            fields.object({
              titel: text('Titel', { pflicht: true, max: 60, beschreibung: 'z. B. "Besichtigung vor Ort"' }),
              text: langtext('Text', { pflicht: true, max: 240, beschreibung: 'Was passiert in diesem Schritt und was hat die Kundschaft davon?' }),
            }),
            {
              label: 'Schritte (3 bis 6)',
              itemLabel: (p) => p.fields.titel.value || 'Schritt',
              validation: { length: { min: 3, max: 6 } },
            }
          ),
        }),
      },

      team: {
        label: 'Team',
        itemLabel: (p) => p.fields.titel.value || 'Team',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          personen: fields.array(
            fields.object({
              name: text('Vorname und Name', { pflicht: true, max: 60 }),
              funktion: text('Funktion', { pflicht: true, max: 80 }),
              foto: bild('Foto', bildOrdner, {
                hinweis: 'Hochformat 800 x 1000 px (4:5), JPG oder WebP, unter 120 KB. Gesicht im oberen Drittel, gleicher Hintergrund für alle.',
              }),
              email: fields.text({
                label: 'E-Mail (optional)',
                validation: { pattern: { regex: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Bitte eine gültige E-Mail-Adresse eingeben.' } },
              }),
              telefon: text('Telefon (optional)', { max: 30 }),
            }),
            { label: 'Personen', itemLabel: (p) => p.fields.name.value || 'Person' }
          ),
        }),
      },

      logos: {
        label: 'Partner und Referenzen (Logos)',
        itemLabel: (p) => p.fields.titel.value || 'Logos',
        schema: logosFeld(),
      },

      kundenstimmen: {
        label: 'Kundenstimmen',
        schema: fields.object({
          titel: text('Titel', { pflicht: true, max: 90 }),
          eintraege: fields.array(
            fields.object({
              zitat: langtext('Zitat', { pflicht: true, max: 400, beschreibung: 'Nur echte Aussagen mit Einverständnis der Person verwenden.' }),
              name: text('Name', { pflicht: true, max: 60 }),
              funktion: text('Funktion und Firma', { max: 80 }),
            }),
            {
              label: 'Stimmen (1 bis 6)',
              itemLabel: (p) => p.fields.name.value || 'Stimme',
              validation: { length: { min: 1, max: 6 } },
            }
          ),
        }),
      },

      faq: {
        label: 'Häufige Fragen',
        schema: fields.object({
          titel: text('Titel', { pflicht: true, max: 90 }),
          eintraege: fields.array(
            fields.object({
              frage: text('Frage', { pflicht: true, max: 140 }),
              antwort: langtext('Antwort', { pflicht: true, max: 800 }),
            }),
            { label: 'Fragen', itemLabel: (p) => p.fields.frage.value || 'Frage' }
          ),
        }),
      },

      kontaktaufruf: {
        label: 'Kontaktaufruf',
        itemLabel: (p) => p.fields.titel.value || 'Kontaktaufruf',
        schema: fields.object({
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Text', { max: 280 }),
          knopf: knopf('Knopf'),
          telefonZeigen: fields.checkbox({ label: 'Telefonnummer aus den Einstellungen zeigen', defaultValue: true }),
        }),
      },

      kontaktformular: {
        label: 'Kontaktformular',
        schema: fields.object({
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Text', { max: 400 }),
          betreffOptionen: fields.array(text('Option', { pflicht: true, max: 60 }), {
            label: 'Auswahl "Worum geht es?"',
            description: 'Leer lassen, dann wird das Feld nicht angezeigt.',
            itemLabel: (p) => p.value || 'Option',
          }),
          bestaetigung: langtext('Text nach dem Senden', {
            pflicht: true,
            max: 200,
            standard: 'Wir haben Ihre Anfrage erhalten und melden uns innert eines Arbeitstages.',
            beschreibung: 'Nur versprechen, was eingehalten werden kann.',
          }),
          kontaktdatenZeigen: fields.checkbox({ label: 'Adresse, Telefon und Öffnungszeiten daneben zeigen', defaultValue: true }),
          karteZeigen: fields.checkbox({
            label: 'Karte (Google Maps) unter dem Formular zeigen',
            description: 'Die Einbindung ist in der Datenschutzerklärung beschrieben. Der Standort stammt aus "Firma und Kontakt".',
            defaultValue: true,
          }),
        }),
      },

      logoslider: {
        label: 'Logoslider (zentrale Referenzlogos)',
        itemLabel: () => 'Logoslider',
        schema: fields.object({
          titel: text('Titel', { max: 90, standard: 'Eine Auswahl unserer Referenzen', beschreibung: 'Die Logos stammen aus "Übersichtsseiten > Seite /referenzen > Logos" und werden nur dort gepflegt.' }),
        }),
      },

      ctaBand: {
        label: 'Kontaktband (gelb)',
        itemLabel: (p) => p.fields.titel.value || 'Kontaktband',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: langtext('Titel', { pflicht: true, max: 90, beschreibung: 'Zeilenumbrüche werden übernommen.' }),
          text: langtext('Text', { max: 280 }),
          knopf: knopf('Knopf'),
          telefonZeigen: fields.checkbox({ label: 'Telefonnummer als zweiten Knopf zeigen', defaultValue: true }),
        }),
      },

      teamAuszug: {
        label: 'Team (aus der Sammlung Team)',
        itemLabel: (p) => p.fields.titel.value || 'Team',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          bereich: fields.select({
            label: 'Wer wird gezeigt?',
            options: [
              { label: 'Nur Geschäftsleitung', value: 'leitung' },
              { label: 'Nur Technik', value: 'technik' },
              { label: 'Alle', value: 'alle' },
            ],
            defaultValue: 'leitung',
          }),
          linkText: text('Text für Link zur Teamseite', { max: 40, standard: 'Das gesamte Team', beschreibung: 'Leer lassen, dann erscheint kein Link.' }),
        }),
      },

      datenblaetter: {
        label: 'Datenblätter (Auswahl)',
        itemLabel: (p) => p.fields.titel.value || 'Datenblätter',
        schema: fields.object({
          ueberzeile: ueberzeile(),
          titel: text('Titel', { pflicht: true, max: 90 }),
          text: langtext('Einleitung', { max: 280 }),
          produkte: fields.array(fields.relationship({ label: 'Produkt', collection: 'produkte' }), {
            label: 'Gezeigte Produkte (2 bis 4)',
            description: 'Produkte mit Datenblatt wählen. Vorschaubild und Text stammen automatisch aus dem PDF.',
            itemLabel: (p) => p.value || 'Produkt',
            validation: { length: { min: 2, max: 4 } },
          }),
          linkText: text('Text für Link zur Übersicht', { max: 40, standard: 'Alle Datenblätter' }),
        }),
      },
    },
    { label: 'Abschnitte', description: 'Jeder Abschnitt ist ein Bereich auf der Seite. Die Reihenfolge lässt sich durch Ziehen ändern.' }
  );
}
