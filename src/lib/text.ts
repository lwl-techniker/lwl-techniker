/**
 * Letzte Sicherung beim Ausgeben von Texten.
 *
 * Das CMS verhindert scharfes S und Gedankenstriche bereits beim Speichern von Textfeldern.
 * Markdoc-Fliesstexte lassen sich dort aber nicht prüfen. Deshalb wird hier zusätzlich korrigiert,
 * damit online nie eines dieser Zeichen erscheint:
 *
 *   scharfes S                                   wird zu ss
 *   Betrag mit Punkt und Strich (Franken)        wird zu Betrag mit .00
 *   Strich ohne Leerzeichen zwischen Wörtern     wird zu "bis" (Zeiten, Wochentage, Orte)
 *   Strich mit Leerzeichen zwischen Zahlen       wird zu "bis"
 *   Wochentag, Bindestrich, Wochentag            wird zu "bis"
 *   Gedankenstrich mit Leerzeichen               wird zu Komma
 *   Bindestrich mit Leerzeichen vor einem Wort   wird zu Komma
 *
 * Unverändert bleiben: normale Bindestriche (E-Mail-Adresse), Minuszeichen vor Zahlen, Adressen (URLs),
 * Telefonnummern und Zeilenumbrüche. `npm run pruefen:texte` meldet die Stellen trotzdem,
 * damit sie sauber umformuliert werden. Tests: tests/text.test.mjs
 */
const cp = (n: number) => String.fromCodePoint(n);
const STRICH = `[${cp(0x2013)}${cp(0x2014)}]`;
const TAG = '(?:Mo|Di|Mi|Do|Fr|Sa|So)';
const WORTZEICHEN = `[0-9A-Za-z${cp(0xc0)}-${cp(0x24f)}]`;

const REGELN: [RegExp, string][] = [
  [new RegExp(cp(0xdf), 'g'), 'ss'],
  [new RegExp(cp(0x1e9e), 'g'), 'SS'],
  // Datumsbereich (Tag, Punkt, Strich, Tag) vor der Betragsregel, sonst entsteht ein Betrag
  [new RegExp(`(\\d)\\.[ \\t]*${STRICH}[ \\t]*(\\d)`, 'g'), '$1. bis $2'],
  // Betrag mit Punkt und Strich (Schweizer Frankenschreibweise)
  [new RegExp(`(\\d)\\.${STRICH}(?!\\d)`, 'g'), '$1.00'],
  // Wochentage mit Strich oder Bindestrich, auch mit Punkt (Mo., Fr.)
  [new RegExp(`\\b(${TAG}\\.?)[ \\t]*[-${cp(0x2013)}${cp(0x2014)}][ \\t]*(${TAG}\\.?)(?![A-Za-z])`, 'g'), '$1 bis $2'],
  // Wortverbindung mit Strich vor einem Bindestrichwort wird zum Bindestrich (Nord-Süd-Achse)
  [new RegExp(`(${WORTZEICHEN})${STRICH}(?=${WORTZEICHEN}+-)`, 'g'), '$1-'],
  [new RegExp(`(${WORTZEICHEN})${STRICH}(${WORTZEICHEN})`, 'g'), '$1 bis $2'],
  // Zahlenbereich mit Leerzeichen, aber keine Telefonnummer wie "071 - 000 00 00"
  [new RegExp(`(\\d)[ \\t]+(?:${STRICH}|-(?![ \\t]+\\d{3}[ \\t]\\d{2}))[ \\t]+(\\d)`, 'g'), '$1 bis $2'],
  [new RegExp(`[ \\t]+${STRICH}[ \\t]+`, 'g'), ', '],
  [new RegExp(`[ \\t]*${STRICH}[ \\t]*`, 'g'), ', '],
  [new RegExp(`(\\S)[ \\t]+-[ \\t]+(?=[A-Za-z${cp(0xc0)}-${cp(0x24f)}])`, 'g'), '$1, '],
];

const ADRESSE = /(https?:\/\/\S+|mailto:\S+|tel:\S+)/;

export function sauberText(wert: string): string {
  // Adressen bleiben unangetastet, nur der Text dazwischen wird korrigiert
  return wert
    .split(ADRESSE)
    .map((teil, i) => (i % 2 === 1 ? teil : REGELN.reduce((t, [muster, ersatz]) => t.replace(muster, ersatz), teil)))
    .join('');
}

/** Teilt mehrzeiligen CMS-Text in Absätze (Trennung durch Leerzeile). */
export function absaetze(wert: string | null | undefined): string[] {
  if (!wert) return [];
  return sauberText(wert)
    .split(/\n[ \t]*\n/)
    .map((a) => a.trim())
    .filter(Boolean);
}

/** wa.me erwartet nur Ziffern (Landesvorwahl ohne Plus, keine Leerzeichen). */
export function whatsappLink(nummer: string): string {
  return `https://wa.me/${nummer.replace(/\D/g, '')}`;
}
