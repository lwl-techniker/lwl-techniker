import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { DOMAIN } from '@/site.config';
import { absaetze, sauberText } from '@/lib/text';
import { seiteAlsWebPage } from '@/lib/strukturierte-daten';
import { TitelMitKontur } from './AbschnittKopf';

type Pfadpunkt = { text: string; href: string };

/**
 * Kopfbereich für Übersichts- und Detailseiten mit Brotkrumen. Gibt BreadcrumbList und WebPage (mit
 * dateModified aus der Git-Historie, Prop "aktualisiert") als strukturierte Daten aus.
 */
export function Seitenkopf({
  ueberzeile,
  titel,
  einleitung,
  pfad,
  aktualisiert,
  bild,
  children,
}: {
  ueberzeile?: string;
  titel: string;
  einleitung?: string;
  pfad: Pfadpunkt[];
  /** ISO-Zeitpunkt der letzten Änderung (src/lib/aktualisiert.ts) */
  aktualisiert?: string;
  /** Hauptbild der Seite für primaryImageOfPage */
  bild?: string | null;
  children?: React.ReactNode;
}) {
  const alle = [{ text: 'Startseite', href: '/' }, ...pfad];
  const eigener = alle[alle.length - 1];

  return (
    <header className="border-b border-linie">
      <div className="container-seite pt-6 pb-14 lg:pt-8 lg:pb-20">
        <nav aria-label="Brotkrumen">
          <ol className="flex flex-wrap items-center gap-1 text-xs tracking-[0.18em] text-text-leise uppercase">
            {alle.map((p, i) => (
              <li key={p.href} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-4" aria-hidden /> : null}
                {i < alle.length - 1 ? (
                  <Link href={p.href} className="inline-block py-1 hover:text-marke">
                    {sauberText(p.text)}
                  </Link>
                ) : (
                  <span aria-current="page" className="py-1">
                    {sauberText(p.text)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-10 max-w-6xl animate-einblenden lg:mt-14">
          {ueberzeile ? <p className="ueberzeile">{sauberText(ueberzeile)}</p> : null}
          <h1 className="titel-1">
            <TitelMitKontur titel={titel} />
          </h1>
          {absaetze(einleitung).map((a, i) => (
            <p key={i} className="einleitung mt-6 max-w-3xl">
              {a}
            </p>
          ))}
          {children}
        </div>
      </div>
      <JsonLd
        daten={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: alle.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: sauberText(p.text),
            item: new URL(p.href, DOMAIN).toString(),
          })),
        }}
      />
      <JsonLd daten={seiteAlsWebPage({ pfad: eigener.href, titel, beschreibung: einleitung, aktualisiert, bild })} />
    </header>
  );
}
