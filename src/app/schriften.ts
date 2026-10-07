import { Exo_2, Poppins } from 'next/font/google';

/**
 * Schriften werden von next/font beim Build heruntergeladen und selbst ausgeliefert.
 * Keine Verbindung zu Google beim Besuch der Seite (Datenschutz).
 * Pro Projekt austauschbar, Variablennamen beibehalten.
 */
export const schriftText = Exo_2({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
});

export const schriftUeberschrift = Poppins({
  subsets: ['latin'],
  variable: '--font-ueberschrift',
  weight: ['600', '700'],
  display: 'swap',
});
