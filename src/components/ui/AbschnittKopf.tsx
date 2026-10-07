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
 * Bei nur einem Wort bleibt der Titel gefüllt.
 */
export function TitelMitKontur({ titel }: { titel: string }) {
  const woerter = sauberText(titel).trim().split(/\s+/);
  if (woerter.length < 2) return <>{woerter[0]}</>;
  const letztes = woerter.pop();
  return (
    <>
      {woerter.join(' ')} <span className="kontur">{letztes}</span>
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
