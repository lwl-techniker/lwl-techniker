import Image from 'next/image';
import Link from 'next/link';
import { FileDown, FileText, MessageSquareText } from 'lucide-react';
import type { Datenblatt } from '@/lib/cms';
import { cn } from '@/lib/cn';
import { sauberText } from '@/lib/text';

export const KACHEL_SIZES = '(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

function groesse(bytes: number) {
  if (bytes <= 0) return '';
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/**
 * Kompakter Eintrag im Datenblattkatalog (Variante B):
 * - Bild: wenn zuverlässig aus dem PDF erkannt, die Produktabbildung ("Bild aus dem Datenblatt"), sonst die
 *   gerenderte erste Seite ("Dokumentvorschau"). Beides wird so beschriftet und nicht als freigestelltes Foto ausgegeben.
 * - Text: stabiler Anzeigename aus dem CMS, Kategorie, erkannter Dokumenttitel, Seiten und Grösse.
 * - Aktionen: PDF öffnen (neuer Tab) und Anfrage mit vorbelegtem Formular.
 * Produkte ohne Datenblatt zeigen den Hinweis aus dem CMS (z. B. "Auf Anfrage").
 */
export function DatenblattKachel({ eintrag: p, titelEbene = 'h3', sizes = KACHEL_SIZES }: { eintrag: Datenblatt; titelEbene?: 'h2' | 'h3'; sizes?: string }) {
  const Titel = titelEbene;
  const visuell = p.bild ?? p.vorschau;
  const istBild = Boolean(p.bild);
  const anfrage = `/kontakt?produkt=${encodeURIComponent(sauberText(p.titel))}`;

  return (
    <article data-einblenden className="group flex flex-col overflow-hidden rounded-[var(--radius-karte)] border border-linie bg-flaeche transition-colors duration-300 hover:border-marke/60">
      <div className={cn('relative aspect-[4/3] overflow-hidden', istBild ? 'bg-white p-5' : 'bg-flaeche-dunkel')}>
        {visuell ? (
          <Image
            src={visuell.pfad}
            alt={istBild ? `Abbildung aus dem Datenblatt: ${sauberText(p.titel)}` : `Erste Seite des Datenblatts: ${sauberText(p.titel)}`}
            width={visuell.breite}
            height={visuell.hoehe}
            sizes={sizes}
            className={cn('h-full w-full', istBild ? 'object-contain' : 'object-cover object-top opacity-95')}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-linie" aria-hidden>
            <FileText className="size-1/5" strokeWidth={1} />
          </span>
        )}
        {visuell ? (
          <span className="absolute bottom-2 left-2 rounded-[var(--radius-karte)] bg-[#08112e]/85 px-2 py-1 text-[0.6rem] tracking-[0.14em] text-[#e8e4f8] uppercase">
            {istBild ? 'Bild aus dem Datenblatt' : 'Dokumentvorschau'}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <p className="text-[0.66rem] font-medium tracking-[0.24em] text-marke uppercase">{sauberText(p.kategorie)}</p>
        <Titel className="titel-3 mt-2">{sauberText(p.titel)}</Titel>
        {p.titelImDokument && p.titelImDokument.toLowerCase() !== p.titel.toLowerCase() ? (
          <p className="mt-1 text-sm text-text-leise">Im Datenblatt: {p.titelImDokument}</p>
        ) : null}
        {!p.dokument && p.beschreibung ? <p className="mt-2 text-sm text-text-leise">{sauberText(p.beschreibung)}</p> : null}
        {p.dokument ? (
          <p className="mt-2 text-xs text-text-leise">
            PDF, {p.seiten} {p.seiten === 1 ? 'Seite' : 'Seiten'}
            {groesse(p.bytes) ? `, ${groesse(p.bytes)}` : ''}
            {p.dokumentdatum ? `, Stand ${p.dokumentdatum}` : ''}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5">
          {p.dokument ? (
            <a
              href={p.dokument}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 font-titel text-xs font-semibold tracking-[0.16em] text-marke uppercase hover:text-marke-hell"
            >
              <FileDown className="size-4" aria-hidden />
              Datenblatt öffnen
            </a>
          ) : null}
          <Link href={anfrage} className="inline-flex min-h-10 items-center gap-2 font-titel text-xs font-semibold tracking-[0.16em] text-text-leise uppercase hover:text-marke">
            <MessageSquareText className="size-4" aria-hidden />
            Anfragen
          </Link>
        </div>
      </div>
    </article>
  );
}
