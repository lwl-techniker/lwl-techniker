'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
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
  ort: string;
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
 * - Mobile: natives <dialog> als Vollbildmenü mit auf- und zuklappbaren Gruppen, Telefonnummer, Standortzeile
 * - Jeder Linkklick schliesst alle Menüs. Beim erneuten Klick auf die aktuelle Route wird sofort nach oben gescrollt
 *   (Next.js navigiert dann nicht, RoutenScroll greift nicht).
 */
export function Kopfzeile({ firmenname, logoHell, logoDunkel, telefon, ort, menue, kontakt }: Props) {
  const pfad = usePathname();
  const [offen, setOffen] = useState<string | null>(null);
  const [mobilOffen, setMobilOffen] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const ausloeser = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);

  const dialogSchliessen = useCallback((fokusZurueck = true) => {
    const d = dialog.current;
    if (d?.open) d.close();
    document.body.style.overflow = '';
    setMobilOffen(null);
    if (fokusZurueck) ausloeser.current?.focus({ preventScroll: true });
  }, []);

  const dialogOeffnen = () => {
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
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
              <MarkenLogo logoHell={logoHell} logoDunkel={logoDunkel} alt={firmenname} width={724} height={302} eager className="h-12 w-auto sm:h-14 lg:h-[5.25rem] 3xl:h-24" />
            ) : (
              <span className="font-titel text-base font-bold tracking-[0.06em] uppercase">{firmenname}</span>
            )}
          </Link>

          <nav
            ref={navigation}
            aria-label="Hauptnavigation"
            className="hidden items-center gap-1 xl:gap-2 lg:flex"
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
                <div key={punkt.link} className="relative">
                  {hatUntermenue ? (
                    <button
                      type="button"
                      className={cn(
                        'inline-flex min-h-11 items-center border-b-2 border-transparent px-3 font-titel text-[0.8rem] font-semibold tracking-[0.16em] text-text-leise uppercase transition-colors hover:text-marke xl:px-4 xl:text-sm',
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
                        'inline-flex min-h-11 items-center border-b-2 border-transparent px-3 font-titel text-[0.8rem] font-semibold tracking-[0.16em] text-text-leise uppercase transition-colors hover:text-marke xl:px-4 xl:text-sm',
                        istAktiv(punkt.link) && 'text-marke'
                      )}
                    >
                      {punkt.text}
                    </Link>
                  )}
                  {hatUntermenue ? (
                    <div
                      id={id}
                      hidden={!aufgeklappt}
                      className={cn(
                        'absolute top-full mt-3 max-h-[calc(100dvh-8rem)] overflow-y-auto border border-marke/25 border-t-2 border-t-marke p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl',
                        breit ? 'right-[-8rem] w-[min(44rem,calc(100vw-4rem))]' : 'left-0 w-[22rem]'
                      )}
                      style={{ background: 'var(--f-kopf)' }}
                    >
                      <p className="mb-3 text-[0.68rem] font-medium tracking-[0.3em] text-marke uppercase">{punkt.text}</p>
                      <ul className={cn('grid gap-x-6', breit && 'grid-cols-2')}>
                        {punkt.unterpunkte.map((u, i) => (
                          <li key={u.link} className={cn(u.hervorgehoben && 'col-span-full')}>
                            <Link
                              href={u.link}
                              onClick={() => navigieren(u.link)}
                              className={cn(
                                'group grid min-h-12 grid-cols-[1.75rem_1fr_1.25rem] items-center gap-3 border-t border-linie/70 py-3 text-sm transition-colors hover:text-marke focus-visible:text-marke',
                                u.hervorgehoben && 'font-semibold text-marke'
                              )}
                              aria-current={pfad === u.link ? 'page' : undefined}
                            >
                              <span className="font-titel text-[0.68rem] font-bold tracking-[0.1em] text-marke" aria-hidden>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span>
                                <span className="block leading-snug">{u.text}</span>
                                {u.beschreibung ? <span className="mt-0.5 block text-xs leading-snug text-text-leise">{u.beschreibung}</span> : null}
                              </span>
                              <ArrowUpRight className="size-4 text-text-leise transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-marke" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link
              href={kontakt.link}
              onClick={() => navigieren(kontakt.link)}
              aria-current={istAktiv(kontakt.link) ? 'page' : undefined}
              className="ml-3 inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-[#f0a800] to-[#f0d200] px-6 font-titel text-[0.8rem] font-semibold tracking-[0.16em] text-[#060d22] uppercase shadow-[0_0_16px_rgba(240,168,0,0.25)] transition-opacity hover:opacity-85 xl:px-7 xl:text-sm"
            >
              {kontakt.text}
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeSchalter />
            <button
              ref={ausloeser}
              type="button"
              className="inline-flex min-h-11 items-center gap-2 border border-marke/25 px-3 font-titel text-[0.72rem] font-semibold tracking-[0.18em] text-marke uppercase lg:hidden"
              aria-haspopup="dialog"
              aria-label="Menü öffnen"
              onClick={dialogOeffnen}
            >
              Menü <Menu className="size-5" aria-hidden />
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
        }}
      >
        <div className="flex min-h-full flex-col overflow-y-auto px-5 pt-4 pb-10 sm:px-8">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-medium tracking-[0.3em] text-text-leise uppercase">{firmenname}</span>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 border border-marke/25 px-3 font-titel text-[0.72rem] font-semibold tracking-[0.18em] text-marke uppercase"
              aria-label="Menü schliessen"
              onClick={() => dialogSchliessen()}
            >
              Schliessen <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile Hauptnavigation" className="mt-8">
            {menue.map((punkt) => {
              const hatUntermenue = punkt.unterpunkte.length > 0;
              const aufgeklappt = mobilOffen === punkt.link;
              const id = `mobil-${punkt.link.replace(/\W+/g, '')}`;
              return (
                <div key={punkt.link} className="border-t border-linie">
                  {hatUntermenue ? (
                    <button
                      type="button"
                      className={cn('flex w-full items-center justify-between py-4 text-left font-titel text-2xl font-semibold tracking-[0.06em] uppercase', aufgeklappt && 'text-marke')}
                      aria-expanded={aufgeklappt}
                      aria-controls={id}
                      aria-label={`${punkt.text} Untermenü`}
                      onClick={() => setMobilOffen(aufgeklappt ? null : punkt.link)}
                    >
                      {punkt.text}
                      <span className="font-sans text-base text-text-leise" aria-hidden>
                        {aufgeklappt ? 'Schliessen' : 'Öffnen'}
                      </span>
                    </button>
                  ) : (
                    <Link href={punkt.link} onClick={() => navigieren(punkt.link)} className="block py-4 font-titel text-2xl font-semibold tracking-[0.06em] uppercase">
                      {punkt.text}
                    </Link>
                  )}
                  {hatUntermenue ? (
                    <div id={id} hidden={!aufgeklappt} className="pb-4">
                      {punkt.unterpunkte.map((u) => (
                        <Link
                          key={u.link}
                          href={u.link}
                          onClick={() => navigieren(u.link)}
                          className={cn('flex min-h-12 items-center justify-between gap-4 border-t border-linie/60 py-3 text-base text-text-leise', u.hervorgehoben && 'font-semibold text-marke')}
                        >
                          {u.text}
                          <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link href={kontakt.link} onClick={() => navigieren(kontakt.link)} className="block border-t border-b border-linie py-4 font-titel text-2xl font-semibold tracking-[0.06em] text-marke uppercase">
              {kontakt.text}
            </Link>
          </nav>
          <a href={telefonLink} className="mt-10 block py-2 font-titel text-xl font-semibold text-text hover:text-marke">
            {telefon}
          </a>
          <p className="mt-2 text-sm text-text-leise">{ort} · Schweizweit im Einsatz</p>
        </div>
      </dialog>
    </>
  );
}
