import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { JobZeile } from '@/components/karten/Karten';
import { holeJobsFuerStartseite, type Einstellungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

/** Offene Stellen, automatisch. Ohne offene Stelle erscheint der Hinweis für Initiativbewerbungen. */
export async function JobsBlock({ daten: d, einstellungen }: { daten: BlockDaten<'jobs'>; einstellungen: Einstellungen }) {
  const jobs = await holeJobsFuerStartseite(d.anzahl === 'alle' ? 'alle' : Number(d.anzahl));

  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf
          ueberzeile={d.ueberzeile}
          titel={d.titel}
          text={d.text}
          link={jobs.length > 0 ? { text: 'Alle offenen Stellen', href: '/jobs' } : undefined}
        />
        {jobs.length > 0 ? (
          <div className="border-t border-linie">
            {jobs.map((j) => (
              <JobZeile key={j.slug} job={j} />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8 lg:p-12">
            <p className="einleitung max-w-3xl">{sauberText(d.keineStellenText || 'Zurzeit sind alle Stellen besetzt. Initiativbewerbungen lesen wir trotzdem gerne.')}</p>
            <a href={`mailto:${einstellungen.email}`} className="knopf-primaer mt-8">
              Initiativ bewerben
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
