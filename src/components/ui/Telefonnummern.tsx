import { cn } from '@/lib/cn';
import { telefonArt, telefonLink, telefonnummern } from '@/lib/telefon';

type Props = {
  einstellungen: { telefon: string; telefonWeitere?: string | null };
  className?: string;
  linkKlasse?: string;
};

/** Alle Telefonnummern der Firma untereinander als tel:-Links; bei mehreren Nummern mit Zusatz (Festnetz, Mobil). */
export function Telefonnummern({ einstellungen, className, linkKlasse = 'inline-block py-1 hover:text-marke' }: Props) {
  const nummern = telefonnummern(einstellungen);
  return (
    <span className={cn('flex flex-col items-start', className)}>
      {nummern.map((n) => (
        <a key={n} href={telefonLink(n)} className={linkKlasse}>
          {n}
          {nummern.length > 1 ? <span className="text-[0.9em] text-text-leise"> ({telefonArt(n)})</span> : null}
        </a>
      ))}
    </span>
  );
}
