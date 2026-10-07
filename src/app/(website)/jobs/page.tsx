import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { JobZeile } from '@/components/karten/Karten';
import { holeEinstellungen, holeJobs, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';

export async function generateMetadata() {
  const { jobs: u } = await holeUebersichten();
  return metadaten({ pfad: '/jobs', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

export default async function JobsSeite() {
  const [{ jobs: u }, jobs, e] = await Promise.all([holeUebersichten(), holeJobs(), holeEinstellungen()]);

  return (
    <>
      <Seitenkopf ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/jobs' }]} />
      <section className="abschnitt">
        <div className="container-seite">
          {jobs.length > 0 ? (
            <div className="border-t border-linie">
              {jobs.map((j) => (
                <JobZeile key={j.slug} job={j} titelEbene="h2" />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8 lg:p-12">
              <p className="einleitung max-w-3xl">Zurzeit sind alle Stellen besetzt. Initiativbewerbungen lesen wir trotzdem gerne.</p>
              <a href={`mailto:${e.email}`} className="knopf-primaer mt-8">
                Initiativ bewerben
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
