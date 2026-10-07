import Link from 'next/link';
import type { Einstellungen, Navigation } from '@/lib/cms';
import { MarkenLogo } from '@/components/ui/MarkenLogo';
import { sauberText, whatsappLink } from '@/lib/text';

const SOCIAL_NAMEN: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

/** Social-Media-Symbole (V3): schlicht, in Textfarbe, ohne externe Bibliothek */
function SocialSymbol({ plattform }: { plattform: string }) {
  const gemeinsam = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const, focusable: false as const };
  switch (plattform) {
    case 'linkedin':
      return (
        <svg {...gemeinsam}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.94v5.666H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...gemeinsam}>
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.098 10.125 24v-8.436H7.078v-3.49h3.047V9.412c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.512c-1.49 0-1.957.931-1.957 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.098 24 18.1 24 12.073Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...gemeinsam} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2.3" y="2.3" width="19.4" height="19.4" rx="5.2" />
          <circle cx="12" cy="12" r="4.4" />
          <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...gemeinsam}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Fusszeile: Aufbau aus V3 (Marke mit Leitsatz, Adresse, Linkgruppe, untere Zeile mit Rechtlichem und
 * Social-Media-Symbolen), Gestaltung mit V2-Tokens auf der tiefsten Abschnittsfläche.
 */
export function Fusszeile({ einstellungen: e, navigation: n }: { einstellungen: Einstellungen; navigation: Navigation }) {
  const jahr = new Date().getFullYear();

  return (
    <footer className="flaeche-tief border-b-0">
      <div className="container-seite pt-14 pb-6 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_0.8fr] md:gap-10 lg:gap-16">
          <div className="max-w-md">
            {e.logohell || e.logo ? (
              <MarkenLogo logoHell={e.logohell ?? null} logoDunkel={e.logo ?? null} alt={e.firmenname} width={724} height={302} sizes="(min-width: 1024px) 134px, 115px" className="h-12 w-auto lg:h-14" />
            ) : (
              <p className="font-titel text-xl font-bold tracking-[0.06em] uppercase">{e.firmenname}</p>
            )}
            <p className="mt-6 text-sm text-text-leise">{sauberText(e.kurzbeschreibung)}</p>
          </div>

          <div>
            <h2 className="text-[0.68rem] font-medium tracking-[0.28em] text-marke uppercase">Kontakt</h2>
            <address className="mt-4 space-y-0.5 text-sm not-italic">
              <p>{e.firmenname}</p>
              <p>{e.strasse}</p>
              <p>
                {e.plz} {e.ort}
              </p>
              <p className="pt-2">
                <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="inline-block py-1 hover:text-marke">
                  {e.telefon}
                </a>
              </p>
              <p>
                <a href={`mailto:${e.email}`} className="inline-block py-1 hover:text-marke">
                  {e.email}
                </a>
              </p>
              {e.whatsapp ? (
                <p>
                  <a href={whatsappLink(e.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-marke">
                    WhatsApp
                  </a>
                </p>
              ) : null}
            </address>
          </div>

          {n.fusszeile.length > 0 ? (
            <nav aria-label="Fussnavigation">
              <h2 className="text-[0.68rem] font-medium tracking-[0.28em] text-marke uppercase">Übersicht</h2>
              <ul className="mt-4 space-y-0.5 text-sm">
                {n.fusszeile.map((l) => (
                  <li key={l.link}>
                    <Link href={l.link} className="inline-block py-1 hover:text-marke">
                      {l.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-linie pt-6 text-[0.68rem] tracking-[0.16em] text-text-leise uppercase md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              © {jahr} {e.firmenname}
            </span>
            {/* Dezenter Hinweis auf die Umsetzung der Website (Wunsch Kundschaft) */}
            <a href="https://infraone.ch" target="_blank" rel="noopener noreferrer" className="inline-block py-1 normal-case tracking-normal hover:text-text">
              Gemacht mit <span aria-label="Herz">❤️</span> von InfraOne
            </a>
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {n.rechtliches.map((l) => (
              <li key={l.link}>
                <Link href={l.link} className="inline-block py-1 hover:text-text">
                  {l.text}
                </Link>
              </li>
            ))}
            {e.socialMedia.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 py-1 hover:text-text"
                  aria-label={`${SOCIAL_NAMEN[s.plattform] ?? s.plattform} öffnen (neuer Tab)`}
                >
                  <SocialSymbol plattform={s.plattform} />
                  {SOCIAL_NAMEN[s.plattform] ?? s.plattform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
