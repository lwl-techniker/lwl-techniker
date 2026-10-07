import { renderMarkdoc } from '@/lib/markdoc';
import { sauberText } from '@/lib/text';
import { cn } from '@/lib/cn';
import type { BlockDaten } from './BlockRenderer';

/** Freier Text. Steht er mit Titel als erster Block (z. B. Impressum), wird der Titel zum H1. */
export async function Fliesstext({ daten: d, alsSeitentitel }: { daten: BlockDaten<'fliesstext'>; alsSeitentitel: boolean }) {
  const inhalt = await renderMarkdoc(d.inhalt);
  const TitelTag = alsSeitentitel ? 'h1' : 'h2';

  return (
    <section className={alsSeitentitel ? 'abschnitt-gross' : 'abschnitt'}>
      <div className="container-seite">
        <div className="lesebreite">
          {d.titel ? <TitelTag className={cn(alsSeitentitel ? 'titel-1' : 'titel-2', 'mb-10')}>{sauberText(d.titel)}</TitelTag> : null}
          <div className="fliesstext">{inhalt}</div>
        </div>
      </div>
    </section>
  );
}
