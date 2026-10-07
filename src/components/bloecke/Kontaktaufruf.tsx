import Link from 'next/link';
import type { Einstellungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

const SOCIAL_NAMEN: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

/**
 * Kontaktaufruf wie der Abschnitt "Kontakt" im Entwurf: Bernstein-Linie oben, grosser Titel mit
 * Verlauf im letzten Wort, "LWL" als Kontur im Hintergrund, rechts die Kontaktdaten als Tabelle.
 */
export function Kontaktaufruf({ daten: d, einstellungen: e }: { daten: BlockDaten<'kontaktaufruf'>; einstellungen: Einstellungen }) {
  const woerter = sauberText(d.titel).trim().split(/\s+/);
  const letztes = woerter.length > 1 ? woerter.pop() : null;
  const daten = [
    { k: 'Firma', v: e.firmenname },
    { k: 'Adresse', v: `${e.strasse}, ${e.plz} ${e.ort}` },
    ...(d.telefonZeigen ? [{ k: 'Telefon', v: e.telefon, href: `tel:${e.telefon.replaceAll(' ', '')}` }] : []),
    { k: 'E-Mail', v: e.email, href: `mailto:${e.email}` },
  ];

  return (
    <section className="relative overflow-hidden border-t-[3px] border-marke">
      <div
        className="pointer-events-none absolute top-1/2 right-[-4%] hidden -translate-y-1/2 font-titel text-[26vw] leading-none font-bold text-transparent select-none lg:block"
        style={{ WebkitTextStroke: '1px rgb(30 45 120 / 0.7)' }}
        aria-hidden
      >
        LWL
      </div>
      <div className="container-seite abschnitt-gross relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div data-einblenden>
          <p className="ueberzeile">Kontakt aufnehmen</p>
          <h2 className="titel-1">
            {woerter.join(' ')}
            {letztes ? (
              <>
                {' '}
                <span className="verlauf">{letztes}</span>
              </>
            ) : null}
          </h2>
          {d.text ? <p className="mt-8 max-w-xl text-lg leading-8 text-text-leise">{sauberText(d.text)}</p> : null}
          {d.knopf.text && d.knopf.link ? (
            <Link href={d.knopf.link} className="knopf-primaer mt-10">
              {d.knopf.text}
            </Link>
          ) : null}
        </div>
        <div data-einblenden style={{ '--einblenden-index': 1 } as React.CSSProperties}>
          <dl className="border-t border-linie">
            {daten.map((z) => (
              <div key={z.k} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-linie py-4">
                <dt className="pt-1 text-xs tracking-[0.28em] text-text-leise uppercase">{z.k}</dt>
                <dd className="font-titel text-base font-semibold tracking-[0.04em]">
                  {z.href ? (
                    <a href={z.href} className="inline-block py-0.5 text-marke hover:text-marke-hell">
                      {z.v}
                    </a>
                  ) : (
                    z.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {e.socialMedia.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-3">
              {e.socialMedia.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="pille">
                    {SOCIAL_NAMEN[s.plattform] ?? s.plattform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
