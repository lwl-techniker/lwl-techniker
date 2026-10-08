import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CtaBand } from '@/components/bloecke/CtaBand';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { ReferenzKarte, rasterFuerKacheln } from '@/components/karten/Karten';
import { holeEinstellungen, holeReferenzen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { referenzenAlsListe } from '@/lib/strukturierte-daten';

export async function generateMetadata() {
  const { referenzen: u } = await holeUebersichten();
  return metadaten({ pfad: '/referenzen', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/**
 * Referenzen: dokumentierte Projektbeispiele als Kacheln, neuste zuerst (V2-Darstellung), danach der Verweis auf
 * die Kundenlogos unter /kunden und das gelbe Kontaktband. Die Logos haben seit 8. Oktober 2026 eine eigene Seite.
 */
export default async function ReferenzenSeite() {
  const [{ referenzen: u }, referenzen, e] = await Promise.all([holeUebersichten(), holeReferenzen(), holeEinstellungen()]);

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/referenzen' }]}>
        <Link href="/kunden" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
          Unsere Kunden ansehen
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </Seitenkopf>
      <JsonLd daten={referenzenAlsListe(referenzen)} />

      <section className="abschnitt">
        <div className="container-seite">
          {referenzen.length === 0 ? <p className="einleitung">Die Referenzen werden zurzeit zusammengestellt.</p> : null}
          <div className={`${rasterFuerKacheln(referenzen.length)} gap-y-14`}>
            {referenzen.map((r) => (
              <ReferenzKarte key={r.slug} referenz={r} titelEbene="h2" />
            ))}
          </div>
        </div>
      </section>

      <section className="flaeche-ruhig abschnitt-kompakt" aria-labelledby="kunden-verweis">
        <div className="container-seite flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="ueberzeile">{sauberText(u.logos.titel) || 'Unsere Kunden'}</p>
            <h2 id="kunden-verweis" className="titel-3">
              Für wen wir arbeiten: Logos unserer Kundschaft und Auftraggeber
            </h2>
          </div>
          <Link href="/kunden" className="knopf-sekundaer shrink-0">
            Unsere Kunden
          </Link>
        </div>
      </section>

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
