'use client';

import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

type Props = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  /** Link zum Google-Unternehmensprofil ("Firma und Kontakt"); ohne Angabe eine Adresssuche in Google Maps */
  googleProfil?: string | null;
};

/**
 * Karte von Google Maps für die Kontaktseite, erst auf Klick geladen (Datenschutz: vor dem Klick keine Verbindung zu Google).
 * - Platzhalter mit Adresse und Knopf "Karte laden", danach der iframe (referrerPolicy strict-origin-when-cross-origin)
 * - im dunklen Modus per CSS abgedunkelt (.karte-rahmen in globals.css), im hellen Modus normal
 * - Adresse und Routenlink zusätzlich als Text, damit die Information ohne Karte verfügbar bleibt
 * - Die Einbindung ist in der Datenschutzerklärung unter "Eingebettete Karte" beschrieben.
 */
export function Karte({ name, strasse, plz, ort, googleProfil }: Props) {
  const [geladen, setGeladen] = useState(false);
  const adresse = `${strasse}, ${plz} ${ort}, Schweiz`;
  const abfrage = encodeURIComponent(adresse);
  const routenLink = googleProfil || `https://www.google.com/maps/search/?api=1&query=${abfrage}`;
  return (
    <div>
      <div className="karte-rahmen h-[clamp(280px,42vw,460px)] overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche">
        {geladen ? (
          <iframe
            title={`Google Maps: ${name}, ${adresse}`}
            src={`https://www.google.com/maps?q=${abfrage}&output=embed`}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <MapPin className="size-10 text-marke" aria-hidden />
            <p className="font-titel text-lg font-semibold">{name}</p>
            <p className="text-sm text-text-leise">{adresse}</p>
            <button type="button" onClick={() => setGeladen(true)} className="knopf-sekundaer mt-2">
              Karte laden
            </button>
            <p className="max-w-sm text-xs text-text-leise">Beim Laden der Karte stellt Ihr Browser eine Verbindung zu Google her (siehe Datenschutzerklärung).</p>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-text-leise">
        {name}, {adresse}
        {' · '}
        <a
          href={routenLink}
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
