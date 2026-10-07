import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

type Props = {
  ueberzeile?: string;
  titel: string;
  text?: string;
  link?: { text: string; href: string };
  hell?: boolean;
  className?: string;
};

/**
 * Titel in Versalien, das letzte Wort als Kontur (wie "UNSERE EXPERTISE" im Entwurf).
 * Bei nur einem Wort bleibt der Titel gefüllt. Zeilenumbrüche aus dem CMS bleiben erhalten,
 * die Kontur liegt dann auf dem letzten Wort der letzten Zeile.
 */
export function TitelMitKontur({ titel }: { titel: string }) {
  const zeilen = sauberText(titel)
    .split('\n')
    .map((z) => z.trim())
    .filter(Boolean);
  return (
    <>
      {zeilen.map((zeile, i) => {
        const woerter = zeile.split(/\s+/);
        const letzteZeile = i === zeilen.length - 1;
        const letztes = letzteZeile && woerter.length > 1 ? woerter.pop() : null;
        return (
          <Fragment key={i}>
            {i > 0 ? <br /> : null}
            {woerter.join(' ')}
            {letztes ? (
              <>
                {' '}
                <span className="kontur">{letztes}</span>
              </>
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}

/** Einheitlicher Kopf für alle Abschnitte: Überzeile mit Schrägstrich, H2, Einleitung und optional Link rechts. */
export function AbschnittKopf({ ueberzeile, titel, text, link, hell, className }: Props) {
  return (
    <div data-einblenden className={cn('mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="max-w-4xl">
        {ueberzeile ? <p className="ueberzeile">{sauberText(ueberzeile)}</p> : null}
        <h2 className="titel-2">
          <TitelMitKontur titel={titel} />
        </h2>
        {text ? <p className={cn('einleitung mt-6 max-w-3xl', hell && 'text-text-hell-leise')}>{sauberText(text)}</p> : null}
      </div>
      {link ? (
        <Link href={link.href} className="group inline-flex min-h-11 shrink-0 items-center gap-2 py-2 font-titel text-sm font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell">
          {link.text}
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
