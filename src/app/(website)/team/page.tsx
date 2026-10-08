import { CtaBand } from '@/components/bloecke/CtaBand';
import { Personen } from '@/components/bloecke/TeamAuszug';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeEinstellungen, holeTeam, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { teamAlsPersonen } from '@/lib/strukturierte-daten';
import { aktualisiertVon } from '@/lib/aktualisiert';

export async function generateMetadata() {
  const { team: u } = await holeUebersichten();
  return metadaten({ pfad: '/team', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/** Teamseite (Struktur V3): Geschäftsleitung und Technik getrennt, Daten aus der Sammlung Team. */
export default async function TeamSeite() {
  const [{ team: u }, personen, e] = await Promise.all([holeUebersichten(), holeTeam(), holeEinstellungen()]);
  const leitung = personen.filter((p) => p.bereich === 'leitung');
  const technik = personen.filter((p) => p.bereich === 'technik');

  return (
    <>
      <Seitenkopf aktualisiert={aktualisiertVon('content/einstellungen/uebersichten.json', 'content/team.json')}
        ueberzeile={u.ueberzeile}
        titel={u.titel}
        einleitung={u.einleitung}
        pfad={[
          { text: 'Über uns', href: '/ueber-uns' },
          { text: u.titel, href: '/team' },
        ]}
      />
      <JsonLd daten={teamAlsPersonen(personen)} />
      {leitung.length > 0 ? (
        <section className="abschnitt" data-team="leitung">
          <div className="container-seite">
            <h2 className="titel-2 mb-10">{sauberText(u.leitungTitel)}</h2>
            <Personen personen={leitung} kompakt />
          </div>
        </section>
      ) : null}
      {technik.length > 0 ? (
        <section className="flaeche-ruhig abschnitt" data-team="technik">
          <div className="container-seite">
            <h2 className="titel-2 mb-10">{sauberText(u.technikTitel)}</h2>
            <Personen personen={technik} kompakt />
          </div>
        </section>
      ) : null}
      <CtaBand
        daten={{
          ueberzeile: 'Kontakt',
          titel: 'Sprechen wir über Ihr Projekt.',
          text: 'Sie erreichen uns direkt, ohne Umweg über eine Zentrale. Rufen Sie an oder schreiben Sie uns.',
          knopf: { text: 'Kontakt aufnehmen', link: '/kontakt' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
