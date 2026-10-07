import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { DatenblattKachel } from '@/components/produkte/DatenblattKachel';
import { holeDatenblaetter } from '@/lib/cms';
import { cn } from '@/lib/cn';
import type { BlockDaten } from './BlockRenderer';

/**
 * Startseiten-Teaser für Produkte (Idee aus V3, reduziert): zwei bis vier im CMS gewählte Datenblätter
 * mit automatisch erzeugter Vorschau. Keine separat gepflegten Produkttexte.
 */
export async function Datenblaetter({ daten: d }: { daten: BlockDaten<'datenblaetter'> }) {
  const alle = await holeDatenblaetter();
  const auswahl = d.produkte.map((slug) => alle.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (auswahl.length === 0) return null;

  return (
    <section className="flaeche-betont abschnitt">
      <div className="container-seite">
        <AbschnittKopf ueberzeile={d.ueberzeile} titel={d.titel} text={d.text} link={d.linkText ? { text: d.linkText, href: '/produkte' } : undefined} />
        <div className={cn('grid gap-6 sm:grid-cols-2 lg:gap-8', auswahl.length === 3 ? 'lg:grid-cols-3' : auswahl.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2')}>
          {auswahl.map((p) => (
            <DatenblattKachel key={p.slug} eintrag={p} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
          ))}
        </div>
      </div>
    </section>
  );
}
