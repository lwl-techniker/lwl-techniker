import { fields } from '@keystatic/core';

/**
 * Wiederverwendbare Felder mit eingebauten Qualitätsregeln.
 *
 * Alle Textfelder im CMS laufen über `text()` oder `langtext()`.
 * Dadurch kann niemand ein scharfes S oder einen Gedankenstrich speichern.
 * Die Zeichen werden hier per Codepunkt erzeugt, damit die Textprüfung
 * (scripts/pruefe-texte.mjs) diese Datei nicht selbst bemängelt.
 */

const SCHARFES_S = String.fromCodePoint(0xdf);
const HALBGEVIERTSTRICH = String.fromCodePoint(0x2013);
const GEVIERTSTRICH = String.fromCodePoint(0x2014);

/** Verbietet scharfes S, Gedankenstriche und " - " als Gedankenstrich. */
export const TEXTREGEL = {
  regex: new RegExp(`^(?![\\s\\S]*\\s-\\s)[^${SCHARFES_S}${HALBGEVIERTSTRICH}${GEVIERTSTRICH}]*$`),
  message:
    'Bitte kein scharfes S (ss schreiben) und keine Gedankenstriche verwenden. Statt "Mo - Fr" bitte "Mo bis Fr" schreiben, statt eines Einschubs mit Strich ein Komma oder einen neuen Satz. Aufzählungen mit Bindestrich sind in diesem Feld nicht möglich.',
};

type TextOptionen = {
  beschreibung?: string;
  pflicht?: boolean;
  min?: number;
  max?: number;
  standard?: string;
};

/** Einzeiliges Textfeld mit Textregel. */
export function text(label: string, o: TextOptionen = {}) {
  return fields.text({
    label,
    description: o.beschreibung,
    defaultValue: o.standard,
    validation: {
      isRequired: o.pflicht,
      length: { min: o.pflicht ? Math.max(1, o.min ?? 1) : o.min, max: o.max },
      pattern: TEXTREGEL,
    },
  });
}

/** Mehrzeiliges Textfeld mit Textregel. Absätze durch Leerzeile trennen. */
export function langtext(label: string, o: TextOptionen = {}) {
  return fields.text({
    label,
    description: o.beschreibung,
    defaultValue: o.standard,
    multiline: true,
    validation: {
      isRequired: o.pflicht,
      length: { min: o.pflicht ? Math.max(1, o.min ?? 1) : o.min, max: o.max },
      pattern: TEXTREGEL,
    },
  });
}

/**
 * Link-Feld. Erlaubt interne Pfade (/kontakt), Anker (#formular),
 * vollständige URLs sowie mailto: und tel:.
 */
export function link(label: string, o: { pflicht?: boolean; beschreibung?: string } = {}) {
  return fields.text({
    label,
    description: o.beschreibung ?? 'Interne Seite mit Schrägstrich beginnen, z. B. /kontakt. Externe Adressen vollständig, z. B. https://beispiel.ch',
    validation: {
      isRequired: o.pflicht,
      length: { min: o.pflicht ? 1 : undefined },
      pattern: {
        regex: /^$|^(\/[^\s]*|#[^\s]+|https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9 ]+)$/,
        message: 'Ungültiger Link. Beispiele: /kontakt, https://beispiel.ch, mailto:info@beispiel.ch, tel:+41 71 000 00 00',
      },
    },
  });
}

/**
 * Bildfeld. Keystatic legt die Datei unter public/bilder/<ordner>/<eintrag>/<feldname>.<endung> ab.
 * Der Dateiname entsteht automatisch aus dem Feldnamen, deshalb Feldnamen sprechend wählen.
 */
const BILD_HINWEIS =
  'JPG oder WebP, idealerweise 2400 px breit und unter 500 KB. Keine Handyfotos in Originalgrösse und kein HEIC (iPhone-Format) hochladen.';

type BildOptionen = { beschreibung?: string; /** ersetzt den Standardhinweis zu Format und Grösse */ hinweis?: string };

const beschreibungFuerBild = (o: BildOptionen) => [o.beschreibung, o.hinweis ?? BILD_HINWEIS].filter(Boolean).join(' ');

function pflichtBild(label: string, ordner: string, o: BildOptionen) {
  return fields.image({
    label,
    description: beschreibungFuerBild(o),
    directory: `public/bilder/${ordner}`,
    publicPath: `/bilder/${ordner}/`,
    validation: { isRequired: true },
  });
}

function optionalesBild(label: string, ordner: string, o: BildOptionen) {
  return fields.image({
    label,
    description: beschreibungFuerBild(o),
    directory: `public/bilder/${ordner}`,
    publicPath: `/bilder/${ordner}/`,
  });
}

/** Dateifeld für Downloads (PDF), z. B. Datenblätter. Ablage wie bild(), aber unter public/dokumente/<ordner>. */
export function datei(label: string, ordner: string, o: { beschreibung?: string } = {}) {
  return fields.file({
    label,
    description: [o.beschreibung, 'PDF. Leer lassen, wenn es kein Datenblatt gibt.'].filter(Boolean).join(' '),
    directory: `public/dokumente/${ordner}`,
    publicPath: `/dokumente/${ordner}/`,
  });
}

export function bild(label: string, ordner: string, o: BildOptionen & { pflicht: true }): ReturnType<typeof pflichtBild>;
export function bild(label: string, ordner: string, o?: BildOptionen & { pflicht?: false }): ReturnType<typeof optionalesBild>;
export function bild(label: string, ordner: string, o: BildOptionen & { pflicht?: boolean } = {}) {
  return o.pflicht ? pflichtBild(label, ordner, o) : optionalesBild(label, ordner, o);
}

/** Wandelt einen deutschen Titel in eine saubere Adresse um: "Über uns & Team" wird zu "ueber-uns-team". */
export function adresseAusTitel(titel: string): string {
  return titel
    .normalize('NFC')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(new RegExp(String.fromCodePoint(0xdf), 'g'), 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Titel und Adresse (Slug) für Sammlungen.
 * gesperrt: Adressen, die bereits von festen Seiten belegt sind (z. B. 'jobs' bei den Seiten).
 */
export function titelMitAdresse(label: string, o: { beschreibung?: string; gesperrt?: readonly string[] } = {}) {
  const gesperrt = o.gesperrt ?? [];
  const sperre = gesperrt.length > 0 ? `(?!(${gesperrt.join('|')})$)` : '';
  return fields.slug({
    name: { label, description: o.beschreibung, validation: { isRequired: true, length: { max: 80 }, pattern: TEXTREGEL } },
    slug: {
      label: 'Adresse (URL)',
      description: 'Wird aus dem Titel erzeugt. Nach dem Veröffentlichen nicht mehr ändern, sonst funktionieren bestehende Links nicht mehr.',
      generate: adresseAusTitel,
      validation: {
        pattern: {
          regex: new RegExp(`^${sperre}[a-z0-9]+(-[a-z0-9]+)*$`),
          message:
            gesperrt.length > 0
              ? `Nur Kleinbuchstaben, Zahlen und Bindestriche. Diese Adressen sind bereits vergeben: ${gesperrt.join(', ')}.`
              : 'Nur Kleinbuchstaben, Zahlen und Bindestriche.',
        },
      },
    },
  });
}

/** Alternativtext für Bilder, Pflicht für Barrierefreiheit und SEO. */
export function alttext(pflicht = false) {
  return text('Bildbeschreibung (Alt-Text)', {
    pflicht,
    max: 160,
    beschreibung: 'Beschreibt sachlich, was auf dem Bild zu sehen ist, z. B. "Schaltanlage im Neubau Schulhaus Romanshorn".',
  });
}

/**
 * Logo-Band oder Logo-Raster mit Weiss/Farbe-Umschalter. Wiederverwendet im Block "Partner und
 * Referenzen (Logos)" für frei gestaltbare Seiten sowie direkt in der Übersicht /referenzen.
 * Alle Logos liegen in denselben Ordnern statisch/logos und statisch/logos-farbig, unabhängig
 * davon, wo das Feld eingebunden ist.
 */
export function logosFeld(o: { label?: string } = {}) {
  const felder = {
    titel: text('Titel', { max: 90, beschreibung: 'z. B. "Partner und Mitgliedschaften" oder "Allgemein". Kann leer bleiben.' }),
    laufschrift: fields.checkbox({
      label: 'Als scrollendes Band zeigen',
      description: 'Ein: Logos laufen ununterbrochen durch (ab 4 Logos empfohlen). Aus: festes Raster, alle Logos auf einen Blick.',
      defaultValue: false,
    }),
    darstellung: fields.select({
      label: 'Darstellung des scrollenden Bandes',
      description:
        'Weiss zeigt alle Logos als weisse Silhouette. Farbe zeigt die Logos in Originalfarben auf weissen Kacheln, nur Logos mit ausgefülltem Feld "Logo in Farbe". Gilt nur, wenn das Band eingeschaltet ist.',
      options: [
        { label: 'Weiss', value: 'weiss' as const },
        { label: 'Farbe', value: 'farbig' as const },
      ],
      defaultValue: 'weiss' as const,
    }),
    logos: fields.array(
      fields.object({
        name: text('Name', { pflicht: true, max: 60, beschreibung: 'Wird als Bildbeschreibung verwendet.' }),
        logo: bild('Logo', 'statisch/logos', {
          pflicht: true,
          hinweis: 'SVG oder PNG mit transparentem Hintergrund, unter 30 KB. Im scrollenden Band als weisse Silhouette, darum weiss oder einfarbig hell einfärben.',
        }),
        logoFarbig: bild('Logo in Farbe (optional)', 'statisch/logos-farbig', {
          hinweis: 'Originalfarben, zugeschnitten auf das Logo, mit weissem Hintergrund, unter 30 KB. Wird nur in der Farbdarstellung des scrollenden Bandes gezeigt.',
        }),
        link: link('Link (optional)'),
      }),
      {
        label: 'Logos',
        itemLabel: (p) => p.fields.name.value || 'Logo',
        validation: { length: { min: 3, max: 200 } },
      }
    ),
  };
  return o.label ? fields.object(felder, { label: o.label }) : fields.object(felder);
}

/** SEO-Felder für jede Seite und jeden Sammlungseintrag. */
export function seo() {
  return fields.object(
    {
      titel: text('SEO-Titel', {
        max: 60,
        beschreibung: 'Erscheint in Google und im Browser-Tab. Maximal 60 Zeichen. Leer lassen, dann wird der Seitentitel verwendet. Der Firmenname wird automatisch angehängt.',
      }),
      beschreibung: langtext('SEO-Beschreibung', {
        max: 160,
        beschreibung: 'Erscheint in Google unter dem Titel. 120 bis 160 Zeichen, sachlich und konkret.',
      }),
    },
    { label: 'Google und Suchmaschinen (SEO)' }
  );
}

/** Markdoc-Fliesstext mit Bildern. Überschrift H1 ist gesperrt, weil jede Seite ihren H1 schon hat. */
export function fliesstext(label: string, ordner: string) {
  return fields.markdoc({
    label,
    extension: 'mdoc',
    options: {
      heading: [2, 3, 4],
      bold: true,
      italic: true,
      strikethrough: false,
      code: false,
      codeBlock: false,
      blockquote: true,
      orderedList: true,
      unorderedList: true,
      table: true,
      link: true,
      divider: true,
      image: {
        directory: `public/bilder/${ordner}`,
        publicPath: `/bilder/${ordner}/`,
        transformFilename: dateinameFuerTextbild,
        schema: {
          alt: text('Bildbeschreibung (Alt-Text)', { pflicht: true, max: 160 }),
          title: text('Bildunterschrift (optional)', { max: 160 }),
        },
      },
    },
  });
}

/**
 * Bilder im Fliesstext behalten sonst den Originalnamen (z. B. IMG_1234.JPG) und könnten
 * gleichnamige Bilder überschreiben. Deshalb: klein, ohne Umlaute, mit Präfix und Zeitstempel.
 */
export function dateinameFuerTextbild(original: string): string {
  const punkt = original.lastIndexOf('.');
  const name = punkt > 0 ? original.slice(0, punkt) : original;
  const endung = punkt > 0 ? original.slice(punkt + 1).toLowerCase().replace('jpeg', 'jpg') : 'jpg';
  const sauber = adresseAusTitel(name).slice(0, 40) || 'bild';
  return `text-${sauber}-${Date.now().toString(36)}.${endung}`;
}
