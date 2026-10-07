import Link from 'next/link';
import { FaserWasserzeichen } from '@/components/ui/FaserWasserzeichen';
import type { Einstellungen } from '@/lib/cms';
import { absaetze, sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/**
 * Gelbes Kontaktband (V3): vollbreite gelbe Fläche, Überzeile, grosser Titel links, Text und Knöpfe rechts.
 * Die Knöpfe bleiben im V2-Stil (abgeschnittene Ecke); auf dem gelben Band ist der Primärknopf dunkel,
 * damit er sich abhebt (siehe .band-gelb .knopf-primaer in globals.css).
 * Dahinter das animierte Faser-Wasserzeichen aus V3 (FaserWasserzeichen.tsx).
 */
export function CtaBand({ daten: d, einstellungen: e }: { daten: BlockDaten<'ctaBand'>; einstellungen: Einstellungen }) {
  const primaer = d.knopf.text && d.knopf.link;
  return (
    <section className="band-gelb mit-wasserzeichen abschnitt">
      <FaserWasserzeichen />
      <div className="container-seite">
        {d.ueberzeile ? <p className="ueberzeile">{sauberText(d.ueberzeile)}</p> : null}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <h2 className="titel-1 whitespace-pre-line">{sauberText(d.titel)}</h2>
          <div>
            {absaetze(d.text).map((a, i) => (
              <p key={i} className="max-w-xl text-base leading-7 lg:text-lg">
                {a}
              </p>
            ))}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primaer ? (
                <Link href={d.knopf.link} className="knopf-primaer">
                  {d.knopf.text}
                </Link>
              ) : null}
              {d.telefonZeigen ? (
                <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="knopf-sekundaer">
                  {e.telefon}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
