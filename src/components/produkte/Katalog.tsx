'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Datenblatt } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import { DatenblattKachel } from './DatenblattKachel';

const ALLE = 'Alle Kategorien';

/**
 * Datenblattkatalog (Variante B, technisch an den V3-Katalog angelehnt):
 * - Suche über Produktname, Kategorie, erkannten Dokumenttitel, Artikelnummern und den aus dem PDF extrahierten Text
 * - Kategoriefilter; die Kategorie steht auch in der Adresse (?kategorie=...), damit Menülinks direkt filtern
 * - Filterwechsel ändern nur die Suchparameter (kein Scroll nach oben, siehe RoutenScroll)
 */
export function Katalog({ eintraege, kategorien }: { eintraege: readonly Datenblatt[]; kategorien: readonly string[] }) {
  const suchparameter = useSearchParams();
  const router = useRouter();
  const pfad = usePathname();
  const ausAdresse = suchparameter.get('kategorie') ?? '';
  const [kategorie, setKategorie] = useState(kategorien.includes(ausAdresse) ? ausAdresse : ALLE);
  const [suche, setSuche] = useState('');

  // Menülink mit anderer Kategorie auf derselben Seite: Filter aus der Adresse übernehmen (während des Renderns, ohne Effekt)
  const [letzteAdresse, setLetzteAdresse] = useState(ausAdresse);
  if (ausAdresse !== letzteAdresse) {
    setLetzteAdresse(ausAdresse);
    setKategorie(kategorien.includes(ausAdresse) ? ausAdresse : ALLE);
  }

  const kategorieWaehlen = (wert: string) => {
    setKategorie(wert);
    const params = new URLSearchParams(suchparameter.toString());
    if (wert === ALLE) params.delete('kategorie');
    else params.set('kategorie', wert);
    const neu = params.toString();
    router.replace(neu ? `${pfad}?${neu}` : pfad, { scroll: false });
  };

  const treffer = useMemo(() => {
    const begriff = suche.trim().toLocaleLowerCase('de');
    return eintraege.filter((p) => {
      if (kategorie !== ALLE && p.kategorie !== kategorie) return false;
      if (!begriff) return true;
      const heuhaufen = [p.titel, p.kategorie, p.titelImDokument, p.beschreibung ?? '', p.artikelnummern.join(' '), p.suchtext].join(' ').toLocaleLowerCase('de');
      return begriff.split(/\s+/).every((wort) => heuhaufen.includes(wort));
    });
  }, [eintraege, kategorie, suche]);

  const gruppen = useMemo(() => {
    const liste: { titel: string; eintraege: Datenblatt[] }[] = [];
    for (const p of treffer) {
      let g = liste.find((x) => x.titel === p.kategorie);
      if (!g) {
        g = { titel: p.kategorie, eintraege: [] };
        liste.push(g);
      }
      g.eintraege.push(p);
    }
    return liste;
  }, [treffer]);

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="produkt-suche" className="formular-label">
            Datenblatt suchen
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-leise" aria-hidden />
            <input
              id="produkt-suche"
              type="search"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="z. B. Patchkabel, E2000, QSFP28, Spleissbox"
              className="formular-feld pl-11"
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <label htmlFor="produkt-kategorie" className="formular-label">
            Kategorie
          </label>
          <select id="produkt-kategorie" value={kategorie} onChange={(e) => kategorieWaehlen(e.target.value)} className="formular-feld">
            <option>{ALLE}</option>
            {kategorien.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs tracking-[0.2em] text-text-leise uppercase md:pb-3" role="status" aria-live="polite">
          {treffer.length} {treffer.length === 1 ? 'Eintrag' : 'Einträge'}
        </p>
      </div>

      <div className="mt-10 space-y-14">
        {gruppen.map((g) => (
          <section key={g.titel} aria-labelledby={`kategorie-${g.titel.replace(/\W+/g, '-')}`}>
            <h2 id={`kategorie-${g.titel.replace(/\W+/g, '-')}`} className="titel-3 mb-5 flex items-baseline gap-3">
              {sauberText(g.titel)}
              <span className="font-sans text-xs font-normal tracking-[0.2em] text-text-leise normal-case">{g.eintraege.length}</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {g.eintraege.map((p) => (
                <DatenblattKachel key={p.slug} eintrag={p} />
              ))}
            </div>
          </section>
        ))}
        {treffer.length === 0 ? (
          <div className="rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8">
            <h2 className="titel-3">Kein passendes Datenblatt gefunden</h2>
            <p className="mt-3 text-text-leise">Versuchen Sie einen anderen Begriff oder fragen Sie uns direkt nach einer passenden Ausführung.</p>
            <button
              type="button"
              className="knopf-sekundaer mt-6"
              onClick={() => {
                setSuche('');
                kategorieWaehlen(ALLE);
              }}
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
