import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { LeistungKarte, rasterFuerKacheln } from '@/components/karten/Karten';
import { holeLeistungen, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';

export async function generateMetadata() {
  const { leistungen: u } = await holeUebersichten();
  return metadaten({ pfad: '/leistungen', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

export default async function LeistungenSeite() {
  const [{ leistungen: u }, leistungen] = await Promise.all([holeUebersichten(), holeLeistungen()]);

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/leistungen' }]} />
      <section className="abschnitt">
        {leistungen.length === 0 ? <p className="container-seite einleitung">Die Leistungen werden zurzeit beschrieben.</p> : null}
        <div className={`container-seite ${rasterFuerKacheln(leistungen.length)}`}>
          {leistungen.map((l) => (
            <LeistungKarte key={l.slug} leistung={l} titelEbene="h2" />
          ))}
        </div>
      </section>
    </>
  );
}
