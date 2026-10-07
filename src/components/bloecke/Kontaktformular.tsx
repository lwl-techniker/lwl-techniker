import { Suspense } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { NetlifyFormular } from '@/components/formulare/NetlifyFormular';
import { Karte } from '@/components/ui/Karte';
import type { Einstellungen } from '@/lib/cms';
import { absaetze, sauberText, whatsappLink } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Kontaktseite: Gestaltung und Grundaufbau aus V2 (Formular links, Kontaktdaten als haftende Tafel rechts),
 * ergänzt um die eingebettete Karte aus V3 unter dem Formular. Vorbelegung aus der Adresse (z. B. ?produkt=...)
 * übernimmt NetlifyFormular.
 */
export function Kontaktformular({ daten: d, einstellungen: e }: { daten: BlockDaten<'kontaktformular'>; einstellungen: Einstellungen }) {
  return (
    <section id="formular" className="flaeche-ruhig abschnitt scroll-mt-28">
      <div className="container-seite grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-20 2xl:gap-28">
        <div>
          <h2 className="titel-2">{sauberText(d.titel)}</h2>
          {absaetze(d.text).map((a, i) => (
            <p key={i} className="einleitung mt-5 max-w-3xl">
              {a}
            </p>
          ))}
          {/* Suspense: das Formular liest Suchparameter (Vorbelegung), die Seite bleibt statisch */}
          <Suspense fallback={<div className="mt-10 min-h-[32rem]" aria-busy />}>
            <NetlifyFormular
              name="kontakt"
              className="mt-10"
              betreffOptionen={d.betreffOptionen}
              bestaetigung={sauberText(d.bestaetigung)}
              kontaktEmail={e.email}
              kontaktTelefon={e.telefon}
            />
          </Suspense>
        </div>

        {d.kontaktdatenZeigen ? (
          <aside className="h-fit rounded-[var(--radius-karte)] bg-flaeche p-8 lg:sticky lg:top-32 lg:p-10">
            <h3 className="titel-3">{e.firmenname}</h3>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-marke" aria-hidden />
                <span>
                  {e.strasse}
                  <br />
                  {e.plz} {e.ort}
                </span>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 size-5 shrink-0 text-marke" aria-hidden />
                <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="inline-block py-1 hover:text-marke">
                  {e.telefon}
                </a>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-1 size-5 shrink-0 text-marke" aria-hidden />
                <a href={`mailto:${e.email}`} className="inline-block py-1 break-all hover:text-marke">
                  {e.email}
                </a>
              </li>
              {e.whatsapp ? (
                <li className="flex gap-4">
                  <MessageCircle className="mt-1 size-5 shrink-0 text-marke" aria-hidden />
                  <a href={whatsappLink(e.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-marke">
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {e.oeffnungszeiten.length > 0 ? (
                <li className="flex gap-4">
                  <Clock className="mt-1 size-5 shrink-0 text-marke" aria-hidden />
                  <dl className="space-y-2">
                    {e.oeffnungszeiten.map((z) => (
                      <div key={z.tage}>
                        <dt className="text-text-leise">{z.tage}</dt>
                        <dd>{z.zeiten}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ) : null}
            </ul>
          </aside>
        ) : null}
      </div>
      {d.karteZeigen ? (
        <div className="container-seite mt-14 lg:mt-20">
          <h2 className="ueberzeile">Standort</h2>
          <Karte name={e.firmenname} strasse={e.strasse} plz={e.plz} ort={e.ort} />
        </div>
      ) : null}
    </section>
  );
}
