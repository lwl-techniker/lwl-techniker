import type { Metadata, Viewport } from 'next';
import { DOMAIN, SPRACHE } from '@/site.config';
import { schriftText, schriftUeberschrift } from './schriften';

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5fa' },
    { media: '(prefers-color-scheme: dark)', color: '#08112e' },
  ],
};

/** Setzt data-theme auf <html>, bevor irgendetwas gezeichnet wird, falls die Kundschaft den Schalter schon einmal manuell benutzt hat. Ohne das würde die Seite kurz im falschen Erscheinungsbild aufblitzen. */
const THEMA_SCRIPT = `try{var t=localStorage.getItem('lwl-theme');if(t==='hell'||t==='dunkel')document.documentElement.dataset.theme=t;}catch(e){}`;

/**
 * Wurzel-Layout: nur html und body.
 * globals.css wird bewusst erst in (website)/layout.tsx und not-found.tsx geladen,
 * damit Tailwind die Keystatic-Oberfläche unter /keystatic nicht verändert.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: data-theme wird vom Skript unten vor der Hydration gesetzt
    <html lang={SPRACHE} className={`${schriftText.variable} ${schriftUeberschrift.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: Browser-Erweiterungen (z. B. ColorZilla) schreiben Attribute in den Body, bevor React lädt */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEMA_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
