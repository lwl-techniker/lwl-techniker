import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CtaBand } from '@/components/bloecke/CtaBand';
import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeEinstellungen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { absaetze, sauberText } from '@/lib/text';
import { aktualisiertVon } from '@/lib/aktualisiert';

export async function generateMetadata() {
  const { referenzen: u } = await holeUebersichten();
  return metadaten({ pfad: '/kunden', seitentitel: 'Unsere Kunden', seo: u.kundenSeo, beschreibungFallback: u.allgemeinEinleitung || u.einleitung });
}

/**
 * Unsere Kunden (seit 8. Oktober 2026 eigene Seite): alle Referenzlogos mit Namen aus der zentralen Liste
 * (Silhouette dunkel, Originalfarben hell), darunter "Die Arbeit hinter den Logos" und der Verweis auf die
 * Projektbeispiele unter /referenzen. Titel und Texte stammen aus "Übersichtsseiten > Referenzen".
 */
export default async function KundenSeite() {
  const [{ referenzen: u }, e] = await Promise.all([holeUebersichten(), holeEinstellungen()]);
  const logos = u.logos.logos;

  return (
    <>
      <Seitenkopf aktualisiert={aktualisiertVon('content/einstellungen/uebersichten.json')}
        ueberzeile={u.logos.titel || 'Unsere Kunden'}
        titel={u.allgemeinTitel || 'Unsere Kunden'}
        einleitung={u.allgemeinEinleitung}
        pfad={[
          { text: u.titel, href: '/referenzen' },
          { text: 'Unsere Kunden', href: '/kunden' },
        ]}
      >
        <Link href="/referenzen" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
          Zu den Projektbeispielen
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </Seitenkopf>

      <section className="abschnitt">
        <ul className="container-seite grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" aria-label="Referenzlogos">
          {logos.map((l, i) => (
            <li key={`${l.name}-${i}`} data-einblenden style={{ '--einblenden-index': i % 4 } as React.CSSProperties} className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-full items-center justify-center rounded-[var(--radius-karte)] border border-linie bg-flaeche px-5 py-4">
                <ReferenzLogo name={l.name} logo={l.logo} logoFarbig={l.logoFarbig} className="h-12" />
              </div>
              <span className="text-center text-xs text-text-leise">{sauberText(l.name)}</span>
            </li>
          ))}
        </ul>
      </section>

      {u.allgemeinHinweis ? (
        <section className="flaeche-ruhig abschnitt">
          <div className="container-seite grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <h2 className="titel-2">Die Arbeit hinter den Logos</h2>
            <div>
              {absaetze(u.allgemeinHinweis).map((a, i) => (
                <p key={i} className="einleitung mt-5 first:mt-0">
                  {a}
                </p>
              ))}
              <Link href="/referenzen" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
                Projektbeispiele ansehen
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        daten={{
          ueberzeile: 'Kontakt',
          titel: 'Ihre nächste\nVerbindung.',
          text: 'Eine Installation, eine technische Frage oder ein konkreter Materialbedarf: Erzählen Sie uns, was Sie vorhaben.',
          knopf: { text: 'Projekt besprechen', link: '/kontakt' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
