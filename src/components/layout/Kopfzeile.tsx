'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeSchalter } from '@/components/ui/ThemeSchalter';
import { MarkenLogo } from '@/components/ui/MarkenLogo';

export type Unterpunkt = { text: string; link: string; beschreibung?: string; hervorgehoben?: boolean };
export type Menuepunkt = { text: string; link: string; unterpunkte: readonly Unterpunkt[] };

type Props = {
  firmenname: string;
  logoHell: string | null;
  logoDunkel: string | null;
  telefon: string;
  menue: readonly Menuepunkt[];
  /** Letzter Menüpunkt rechts, hervorgehoben (Kontakt) */
  kontakt: { text: string; link: string };
};

/**
 * Kopfzeile: Aufbau und Bedienung aus V3, Gestaltung mit den V2-Tokens.
 *
 * - vollbreite, oben haftende Leiste mit gemeinsamer Inhaltskante (container-seite)
 * - Desktop: Menüpunkte mit Untermenü öffnen per Klick auf den Text (kein Pfeil), Panel mit nummerierten Einträgen,
 *   Leistungen und Produkte zweispaltig, Escape schliesst und setzt den Fokus zurück, Klick ausserhalb schliesst,
 *   Fokus verlässt das Menü = schliessen
 * - Mobile: Hamburger-Symbol öffnet ein natives <dialog> als Vollbildmenü (Aufbau V2): Menüpunkte als Links,
 *   Untermenü über "Alle anzeigen", Kontakt und Telefonnummer als Knöpfe
 * - Jeder Linkklick schliesst alle Menüs. Beim erneuten Klick auf die aktuelle Route wird sofort nach oben gescrollt
 *   (Next.js navigiert dann nicht, RoutenScroll greift nicht).
 */
export function Kopfzeile({ firmenname, logoHell, logoDunkel, telefon, menue, kontakt }: Props) {
  const pfad = usePathname();
  const [offen, setOffen] = useState<string | null>(null);
  const [mobilOffen, setMobilOffen] = useState<string | null>(null);
  // Logo im Dialog nur bei offenem Dialog rendern: Lighthouse misst sonst das versteckte Bild mit falschem Seitenverhältnis
  const [dialogOffen, setDialogOffen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const ausloeser = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);

  const dialogSchliessen = useCallback((fokusZurueck = true) => {
    const d = dialog.current;
    if (d?.open) d.close();
    document.body.style.overflow = '';
    setMobilOffen(null);
    setDialogOffen(false);
    if (fokusZurueck) ausloeser.current?.focus({ preventScroll: true });
  }, []);

  const dialogOeffnen = () => {
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    setDialogOffen(true);
  };

  /** Klick auf einen Link: Menüs schliessen; bei gleicher Route sofort nach oben */
  const navigieren = (ziel: string) => {
    setOffen(null);
    dialogSchliessen(false);
    const zielPfad = ziel.split('?')[0].split('#')[0];
    if (zielPfad === pfad && !ziel.includes('#')) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Desktop-Untermenü: Klick ausserhalb schliesst; grosses Fenster schliesst das mobile Menü
  useEffect(() => {
    const ausserhalb = (e: PointerEvent) => {
      if (!navigation.current?.contains(e.target as Node)) setOffen(null);
    };
    document.addEventListener('pointerdown', ausserhalb);
    const breit = window.matchMedia('(min-width: 1024px)');
    const pruefen = () => {
      if (breit.matches && dialog.current?.open) dialogSchliessen(false);
    };
    breit.addEventListener('change', pruefen);
    return () => {
      document.removeEventListener('pointerdown', ausserhalb);
      breit.removeEventListener('change', pruefen);
      document.body.style.overflow = '';
    };
  }, [dialogSchliessen]);

  // Bei Routenwechsel alles schliessen (z. B. Zurück-Taste)
  const [letzterPfad, setLetzterPfad] = useState(pfad);
  if (pfad !== letzterPfad) {
    setLetzterPfad(pfad);
    setOffen(null);
  }

  const istAktiv = (link: string) => (link === '/' ? pfad === '/' : pfad === link || pfad.startsWith(`${link}/`));
  const telefonLink = `tel:${telefon.replaceAll(' ', '')}`;

  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-marke focus:px-4 focus:py-2 focus:font-semibold focus:text-text-dunkel"
      >
        Zum Inhalt springen
      </a>
      <header
        className="sticky top-0 z-50 border-b border-linie/70 backdrop-blur-xl"
        style={{ background: 'var(--f-kopf)' }}
      >
        <div className="container-seite flex min-h-[5rem] items-center justify-between gap-6 lg:min-h-[7rem]">
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${firmenname}, zur Startseite`} onClick={() => navigieren('/')}>
            {logoHell || logoDunkel ? (
              <MarkenLogo logoHell={logoHell} logoDunkel={logoDunkel} alt={firmenname} width={724} height={302} eager sizes="(min-width: 2200px) 230px, (min-width: 1024px) 202px, (min-width: 640px) 134px, 115px" className="h-12 w-auto sm:h-14 lg:h-[5.25rem] 3xl:h-24" />
            ) : (
              <span className="font-titel text-base font-bold tracking-[0.06em] uppercase">{firmenname}</span>
            )}
          </Link>

          <nav
            ref={navigation}
            aria-label="Hauptnavigation"
            className="hidden items-center gap-0.5 xl:gap-2 2xl:gap-3 lg:flex"
            onKeyDown={(e) => {
              if (e.key !== 'Escape' || offen === null) return;
              const knopf = e.currentTarget.querySelector<HTMLButtonElement>('[aria-expanded="true"]');
              setOffen(null);
              knopf?.focus();
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOffen(null);
            }}
          >
            {menue.map((punkt) => {
              const hatUntermenue = punkt.unterpunkte.length > 0;
              const aufgeklappt = offen === punkt.link;
              const id = `untermenue-${punkt.link.replace(/\W+/g, '')}`;
              const breit = punkt.unterpunkte.length > 4;
              return (
                <div
                  key={punkt.link}
                  className="relative"
                  // Mit der Maus öffnet das Untermenü beim Überfahren (nur auf Geräten mit Mauszeiger, Tastatur und Touch bleiben beim Klick)
                  onMouseEnter={() => {
                    if (hatUntermenue && window.matchMedia('(hover: hover)').matches) setOffen(punkt.link);
                  }}
                  onMouseLeave={() => {
                    if (hatUntermenue && window.matchMedia('(hover: hover)').matches) setOffen((aktuell) => (aktuell === punkt.link ? null : aktuell));
                  }}
                >
                  {hatUntermenue ? (
                    <button
                      type="button"
                      className={cn(
                        'inline-flex min-h-12 items-center border-b-2 border-transparent px-2 font-titel text-[0.85rem] font-semibold tracking-[0.14em] text-text-leise uppercase transition-colors hover:text-marke xl:px-4 xl:text-base 2xl:px-5 2xl:text-[1.1rem] 3xl:text-xl',
                        (aufgeklappt || istAktiv(punkt.link)) && 'text-marke',
                        aufgeklappt && 'border-marke'
                      )}
                      aria-expanded={aufgeklappt}
                      aria-controls={id}
                      aria-label={`${punkt.text} Untermenü`}
                      onClick={() => setOffen(aufgeklappt ? null : punkt.link)}
                    >
                      {punkt.text}
                    </button>
                  ) : (
                    <Link
                      href={punkt.link}
                      onClick={() => navigieren(punkt.link)}
                      aria-current={istAktiv(punkt.link) ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-12 items-center border-b-2 border-transparent px-2 font-titel text-[0.85rem] font-semibold tracking-[0.14em] text-text-leise uppercase transition-colors hover:text-marke xl:px-4 xl:text-base 2xl:px-5 2xl:text-[1.1rem] 3xl:text-xl',
                        istAktiv(punkt.link) && 'text-marke'
                      )}
                    >
                      {punkt.text}
                    </Link>
                  )}
                  {hatUntermenue ? (
                    // Äusserer Rahmen mit pt-3: die Lücke zwischen Menüpunkt und Panel gehört zum Menü, sonst schliesst es beim Überfahren der Lücke
                    <div id={id} hidden={!aufgeklappt} className={cn('absolute top-full z-10 pt-3', breit ? 'right-[-8rem] w-[min(48rem,calc(100vw-4rem))]' : 'left-0 w-[24rem]')}>
                    <div
                      className="max-h-[calc(100dvh-8rem)] overflow-y-auto border border-marke/25 border-t-2 border-t-marke p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                      style={{ background: 'var(--f-menue)' }}
                    >
                      <p className="mb-3 text-xs font-medium tracking-[0.3em] text-marke uppercase">{punkt.text}</p>
                      <ul className={cn('grid gap-x-6', breit && 'grid-cols-2')}>
                        {punkt.unterpunkte.map((u, i) => (
                          <li key={u.link} className={cn(u.hervorgehoben && 'col-span-full')}>
                            <Link
                              href={u.link}
                              onClick={() => navigieren(u.link)}
                              className={cn(
                                'group grid min-h-12 grid-cols-[1.75rem_1fr_1.25rem] items-center gap-3 border-t border-linie/70 py-3 text-base transition-colors hover:text-marke focus-visible:text-marke',
                                u.hervorgehoben && 'font-semibold text-marke'
                              )}
                              aria-current={pfad === u.link ? 'page' : undefined}
                            >
                              <span className="font-titel text-[0.72rem] font-bold tracking-[0.1em] text-marke" aria-hidden>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span>
                                <span className="block leading-snug">{u.text}</span>
                                {u.beschreibung ? <span className="mt-0.5 block text-sm leading-snug text-text-leise">{u.beschreibung}</span> : null}
                              </span>
                              <ArrowUpRight className="size-4 text-text-leise transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-marke" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link
              href={kontakt.link}
              onClick={() => navigieren(kontakt.link)}
              aria-current={istAktiv(kontakt.link) ? 'page' : undefined}
              className="ml-2 inline-flex min-h-12 items-center rounded-full bg-gradient-to-r from-[#f0a800] to-[#f0d200] px-5 font-titel text-[0.85rem] font-semibold tracking-[0.14em] text-[#060d22] uppercase shadow-[0_0_16px_rgba(240,168,0,0.25)] transition-opacity hover:opacity-85 xl:ml-3 xl:px-7 xl:text-base 2xl:min-h-[3.25rem] 2xl:px-8 2xl:text-[1.1rem] 3xl:text-xl"
            >
              {kontakt.text}
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeSchalter />
            {/* Anruf-Knopf nur auf Mobil und Tablet (Notfalleinsätze: ein Tipp genügt) */}
            <a href={telefonLink} className="inline-flex size-11 items-center justify-center rounded-full border border-marke/25 text-marke lg:hidden" aria-label={`Anrufen: ${telefon}`}>
              <Phone className="size-5" aria-hidden />
            </a>
            <button
              ref={ausloeser}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-marke/25 text-marke lg:hidden"
              aria-haspopup="dialog"
              aria-label="Menü öffnen"
              onClick={dialogOeffnen}
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialog}
        aria-label="Hauptnavigation"
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 p-0 text-text backdrop:bg-flaeche-dunkel lg:hidden"
        style={{ background: 'var(--color-grund)' }}
        onCancel={(e) => {
          e.preventDefault();
          dialogSchliessen();
        }}
        onClose={() => {
          document.body.style.overflow = '';
          setDialogOffen(false);
        }}
      >
        {/* Aufbau wie V2: Kopfzeile mit Logo, Schalter und Schliessen-Symbol; Menüpunkte als Links, Untermenü über "Alle anzeigen"; Kontakt und Telefon als Knöpfe */}
        <div className="flex min-h-full flex-col overflow-y-auto px-5 pt-4 pb-10 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center" aria-label={`${firmenname}, zur Startseite`} onClick={() => navigieren('/')}>
              {dialogOffen && (logoHell || logoDunkel) ? (
                <MarkenLogo logoHell={logoHell} logoDunkel={logoDunkel} alt={firmenname} width={724} height={302} sizes="115px" className="h-12 w-auto" />
              ) : (
                <span className="font-titel text-base font-bold tracking-[0.06em] uppercase">{firmenname}</span>
              )}
            </Link>
            <div className="flex items-center gap-1">
              <ThemeSchalter />
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full border border-marke/25 text-marke"
                aria-label="Menü schliessen"
                onClick={() => dialogSchliessen()}
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
          </div>
          <nav aria-label="Mobile Hauptnavigation" className="mt-10">
            <ul className="space-y-1">
              {menue.map((punkt) => {
                const hatUntermenue = punkt.unterpunkte.length > 0;
                const aufgeklappt = mobilOffen === punkt.link;
                const id = `mobil-${punkt.link.replace(/\W+/g, '')}`;
                return (
                  <li key={punkt.link}>
                    <Link
                      href={punkt.link}
                      onClick={() => navigieren(punkt.link)}
                      aria-current={istAktiv(punkt.link) ? 'page' : undefined}
                      className={cn('block py-3 font-titel text-2xl font-semibold tracking-[0.2em] text-text uppercase hover:text-marke', istAktiv(punkt.link) && 'text-marke')}
                    >
                      {punkt.text}
                    </Link>
                    {hatUntermenue ? (
                      <div className="mb-3 border-l border-linie pl-4">
                        <button
                          type="button"
                          className="flex min-h-10 items-center gap-2 py-1 text-sm font-medium tracking-[0.14em] text-text-leise uppercase hover:text-text"
                          aria-expanded={aufgeklappt}
                          aria-controls={id}
                          aria-label={`${punkt.text} Untermenü`}
                          onClick={() => setMobilOffen(aufgeklappt ? null : punkt.link)}
                        >
                          <ChevronDown className={cn('size-4 transition-transform', aufgeklappt && 'rotate-180')} aria-hidden />
                          {aufgeklappt ? 'Weniger anzeigen' : 'Alle anzeigen'}
                        </button>
                        {aufgeklappt ? (
                          <ul id={id} className="space-y-1 pb-2">
                            {punkt.unterpunkte.map((u) => (
                              <li key={u.link}>
                                <Link
                                  href={u.link}
                                  onClick={() => navigieren(u.link)}
                                  className={cn('block min-h-10 py-2 text-base text-text-leise hover:text-text', u.hervorgehoben && 'font-semibold text-marke')}
                                >
                                  {u.text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 flex flex-col gap-4">
              <Link href={kontakt.link} onClick={() => navigieren(kontakt.link)} className="knopf-primaer">
                {kontakt.text}
              </Link>
              <a href={telefonLink} className="knopf-sekundaer">
                {telefon}
              </a>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
