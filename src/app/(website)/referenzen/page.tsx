import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { ReferenzKarte, rasterFuerKacheln } from '@/components/karten/Karten';
import { holeReferenzen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { Logos } from '@/components/bloecke/Logos';
import { JsonLd } from '@/components/seo/JsonLd';
import { referenzenAlsListe } from '@/lib/strukturierte-daten';

export async function generateMetadata() {
  const { referenzen: u } = await holeUebersichten();
  return metadaten({ pfad: '/referenzen', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/**
 * Referenzübersicht (V2): alle veröffentlichten Referenzen als Kacheln, neuste zuerst,
 * darüber das Logoband aus der zentralen Liste (jetzt in beiden Farbmodi korrekt).
 */
export default async function ReferenzenSeite() {
  const [{ referenzen: u }, referenzen] = await Promise.all([holeUebersichten(), holeReferenzen()]);

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/referenzen' }]}>
        <Link href="/referenzen/allgemein" className="group mt-6 inline-flex min-h-11 items-center gap-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
          Alle Referenzlogos
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </Seitenkopf>
      <JsonLd daten={referenzenAlsListe(referenzen)} />
      {u.logos.logos.length > 0 ? <Logos daten={u.logos} /> : null}
      <section className="abschnitt">
        {referenzen.length === 0 ? <p className="container-seite einleitung">Die Referenzen werden zurzeit zusammengestellt.</p> : null}
        <div className={`container-seite ${rasterFuerKacheln(referenzen.length)} gap-y-14`}>
          {referenzen.map((r) => (
            <ReferenzKarte key={r.slug} referenz={r} titelEbene="h2" />
          ))}
        </div>
      </section>
    </>
  );
}
