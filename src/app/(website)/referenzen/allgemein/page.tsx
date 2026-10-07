import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CtaBand } from '@/components/bloecke/CtaBand';
import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeEinstellungen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { absaetze, sauberText } from '@/lib/text';

export async function generateMetadata() {
  const { referenzen: u } = await holeUebersichten();
  return metadaten({ pfad: '/referenzen/allgemein', seitentitel: u.allgemeinTitel || 'Allgemeine Referenzen', beschreibungFallback: u.allgemeinEinleitung || u.einleitung });
}

/**
 * Allgemeine Referenzen (V3): alle Logos aus der zentralen Liste mit Namen, ohne weisse Kacheln,
 * Silhouette im dunklen und Originalfarben im hellen Modus.
 */
export default async function AllgemeineReferenzen() {
  const [{ referenzen: u }, e] = await Promise.all([holeUebersichten(), holeEinstellungen()]);
  const logos = u.logos.logos;

  return (
    <>
      <Seitenkopf
        ueberzeile="Referenzen"
        titel={u.allgemeinTitel || 'Allgemeine Referenzen'}
        einleitung={u.allgemeinEinleitung}
        pfad={[
          { text: u.titel, href: '/referenzen' },
          { text: 'Allgemein', href: '/referenzen/allgemein' },
        ]}
      />
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
        <section className="flaeche-ruhig abschnitt-kompakt">
          <div className="container-seite">
            <h2 className="titel-2">Die Arbeit hinter den Logos</h2>
            {absaetze(u.allgemeinHinweis).map((a, i) => (
              <p key={i} className="einleitung mt-5 max-w-3xl">
                {a}
              </p>
            ))}
            <Link href="/referenzen" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
              Projektbeispiele ansehen
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}
      <CtaBand
        daten={{
          ueberzeile: 'Kontakt',
          titel: 'Ihre nächste Verbindung.',
          text: 'Eine Installation, eine technische Frage oder ein konkreter Materialbedarf: Erzählen Sie uns, was Sie vorhaben.',
          knopf: { text: 'Projekt besprechen', link: '/kontakt' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
