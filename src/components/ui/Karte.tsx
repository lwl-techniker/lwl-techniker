import { ExternalLink } from 'lucide-react';

type Props = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
};

/**
 * Eingebettete Google-Maps-Karte (V3) für die Kontaktseite.
 * - lazy geladen, referrerPolicy strict-origin-when-cross-origin
 * - im dunklen Modus per CSS abgedunkelt (.karte-rahmen in globals.css), im hellen Modus normal
 * - Adresse und externer Routenlink zusätzlich als Text, damit die Information ohne Karte verfügbar bleibt
 * - Datenschutz: Die Einbindung ist in der Datenschutzerklärung unter "Google Maps" beschrieben.
 */
export function Karte({ name, strasse, plz, ort }: Props) {
  const adresse = `${strasse}, ${plz} ${ort}, Schweiz`;
  const abfrage = encodeURIComponent(adresse);
  return (
    <div>
      <div className="karte-rahmen h-[clamp(280px,42vw,460px)] overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche">
        <iframe
          title={`Google Maps: ${name}, ${adresse}`}
          src={`https://www.google.com/maps?q=${abfrage}&output=embed`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="block h-full w-full border-0"
        />
      </div>
      <p className="mt-4 text-sm text-text-leise">
        {name}, {adresse}
        {' · '}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${abfrage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1 py-2 text-marke underline underline-offset-4 hover:text-marke-hell"
        >
          Route in Google Maps öffnen
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </p>
    </div>
  );
}
