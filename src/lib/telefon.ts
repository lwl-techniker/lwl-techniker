/** Hilfen für die Telefonnummern der Firma (Haupt-Telefonnummer plus optionale weitere Nummer aus den Firmendaten). */

type MitTelefon = { telefon: string; telefonWeitere?: string | null };

/** tel:-Link ohne Leerzeichen, z. B. tel:+41715520070 */
export const telefonLink = (nummer: string) => `tel:${nummer.replaceAll(' ', '')}`;

/** Schweizer Mobilnummern beginnen mit 074 bis 079, alle anderen Nummern gelten als Festnetz. */
export const telefonArt = (nummer: string): 'Mobil' | 'Festnetz' => (/^(\+41|0041|0)7[4-9]/.test(nummer.replaceAll(' ', '')) ? 'Mobil' : 'Festnetz');

/** Alle gepflegten Nummern in der Reihenfolge Haupt-Telefonnummer, weitere Nummer (leere Felder weggelassen) */
export const telefonnummern = (e: MitTelefon) => [e.telefon, e.telefonWeitere ?? ''].map((n) => n.trim()).filter(Boolean);

/** Nummern als Fliesstext, bei mehreren mit Art in Klammern: "+41 71 552 00 70 (Festnetz), +41 78 920 80 00 (Mobil)" */
export const telefonText = (e: MitTelefon) => {
  const nummern = telefonnummern(e);
  return nummern.map((n) => (nummern.length > 1 ? `${n} (${telefonArt(n)})` : n)).join(', ');
};
