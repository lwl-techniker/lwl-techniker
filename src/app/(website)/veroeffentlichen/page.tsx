import type { Metadata } from 'next';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { VeroeffentlichenFormular } from './VeroeffentlichenFormular';
import { GITHUB_REPO } from '@/site.config';

export const metadata: Metadata = {
  title: 'Veröffentlichen',
  robots: { index: false, follow: false },
};

/**
 * Veröffentlichung für die Kundschaft: Änderungen aus dem CMS werden erst nach einem Klick hier geprüft und
 * veröffentlicht (docs/18-veroeffentlichung.md). Nicht in Sitemap und Suchmaschinen, nicht im Menü.
 */
export default function VeroeffentlichenSeite() {
  return (
    <>
      <Seitenkopf
        ueberzeile="Website"
        titel="Änderungen freigeben"
        einleitung="Im CMS gespeicherte Änderungen werden hier geprüft und auf die Website übernommen. Die Prüfung dauert einige Minuten. Bei einem Fehler bleibt die bisherige Website online und der Webmaster wird benachrichtigt."
        pfad={[{ text: 'Veröffentlichen', href: '/veroeffentlichen' }]}
      />
      <section className="abschnitt">
        <div className="container-seite max-w-2xl">
          <VeroeffentlichenFormular />
          <p className="mt-10 text-sm text-text-leise">
            Ohne Kennwort: Bei GitHub unter &quot;Actions, Prüfung und Veröffentlichung, Run workflow&quot; starten (Repository {GITHUB_REPO}).
          </p>
        </div>
      </section>
    </>
  );
}
