import { CtaBand } from '@/components/bloecke/CtaBand';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { ReferenzKarte, rasterFuerKacheln } from '@/components/karten/Karten';
import { ReferenzLogo } from '@/components/ui/ReferenzLogo';
import { holeEinstellungen, holeReferenzen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { absaetze, sauberText } from '@/lib/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { referenzenAlsListe } from '@/lib/strukturierte-daten';

export async function generateMetadata() {
  const { referenzen: u } = await holeUebersichten();
  return metadaten({ pfad: '/referenzen', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/**
 * Referenzen auf einer Seite (seit 8. Oktober 2026, vorher zusätzlich /referenzen/allgemein):
 * 1. Projektbeispiele als Kacheln, neuste zuerst (V2-Darstellung)
 * 2. Alle Referenzlogos mit Namen aus der zentralen Liste (Silhouette dunkel, Originalfarben hell)
 * 3. "Die Arbeit hinter den Logos" (Einordnung der Logos, Texte aus dem CMS)
 * 4. Gelbes Kontaktband
 */
export default async function ReferenzenSeite() {
  const [{ referenzen: u }, referenzen, e] = await Promise.all([holeUebersichten(), holeReferenzen(), holeEinstellungen()]);
  const logos = u.logos.logos;

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/referenzen' }]} />
      <JsonLd daten={referenzenAlsListe(referenzen)} />

      <section className="abschnitt" aria-labelledby="projektbeispiele">
        <div className="container-seite">
          <h2 id="projektbeispiele" className="titel-2 mb-10 lg:mb-14">
            Projektbeispiele
          </h2>
          {referenzen.length === 0 ? <p className="einleitung">Die Referenzen werden zurzeit zusammengestellt.</p> : null}
          <div className={`${rasterFuerKacheln(referenzen.length)} gap-y-14`}>
            {referenzen.map((r) => (
              <ReferenzKarte key={r.slug} referenz={r} />
            ))}
          </div>
        </div>
      </section>

      {logos.length > 0 ? (
        <section className="flaeche-ruhig abschnitt" aria-labelledby="referenzlogos">
          <div className="container-seite">
            <div className="mb-12 max-w-4xl lg:mb-16">
              <p className="ueberzeile">{sauberText(u.logos.titel) || 'Referenzen'}</p>
              <h2 id="referenzlogos" className="titel-2">
                {sauberText(u.allgemeinTitel) || 'Allgemeine Referenzen'}
              </h2>
              {u.allgemeinEinleitung ? <p className="einleitung mt-6 max-w-3xl">{sauberText(u.allgemeinEinleitung)}</p> : null}
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" aria-label="Referenzlogos">
              {logos.map((l, i) => (
                <li key={`${l.name}-${i}`} data-einblenden style={{ '--einblenden-index': i % 4 } as React.CSSProperties} className="flex flex-col items-center gap-3">
                  <div className="flex h-20 w-full items-center justify-center rounded-[var(--radius-karte)] border border-linie bg-flaeche px-5 py-4">
                    <ReferenzLogo name={l.name} logo={l.logo} logoFarbig={l.logoFarbig} className="h-12" />
                  </div>
                  <span className="text-center text-xs text-text-leise">{sauberText(l.name)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {u.allgemeinHinweis ? (
        <section className="abschnitt" aria-labelledby="arbeit-hinter-logos">
          <div className="container-seite grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <h2 id="arbeit-hinter-logos" className="titel-2">
              Die Arbeit hinter den Logos
            </h2>
            <div>
              {absaetze(u.allgemeinHinweis).map((a, i) => (
                <p key={i} className="einleitung mt-5 first:mt-0">
                  {a}
                </p>
              ))}
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
