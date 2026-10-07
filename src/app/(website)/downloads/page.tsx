import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { CtaBand } from '@/components/bloecke/CtaBand';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeDatenblaetter, holeEinstellungen, holeProduktKategorien } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';

export async function generateMetadata() {
  return metadaten({
    pfad: '/downloads',
    seitentitel: 'Datenblätter und Downloads',
    seo: { titel: '', beschreibung: '' },
    beschreibungFallback: 'Alle Datenblätter der LWL-Techniker Schweiz GmbH als PDF, nach Kategorie geordnet, zum Ansehen und Herunterladen.',
  });
}

function groesse(bytes: number) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Datenblätter und Downloads (Menüpunkt aus V3): alle PDFs als kompakte Liste nach Kategorie.
 * Grösse und Seitenzahl kommen automatisch aus dem Datenblatt-Index (scripts/erzeuge-datenblaetter.mjs).
 * Der Katalog mit Suche und Vorschau bleibt unter /produkte.
 */
export default async function DownloadsSeite() {
  const [eintraege, kategorien, e] = await Promise.all([holeDatenblaetter(), holeProduktKategorien(), holeEinstellungen()]);
  const mitPdf = eintraege.filter((p) => p.dokument);

  return (
    <>
      <Seitenkopf
        ueberzeile="Dokumentation"
        titel="Datenblätter und Downloads"
        einleitung={`${mitPdf.length} Originaldatenblätter als PDF, nach Kategorie geordnet. Mit Suche und Vorschau finden Sie dieselben Dokumente im Produktkatalog.`}
        pfad={[
          { text: 'Produkte', href: '/produkte' },
          { text: 'Datenblätter und Downloads', href: '/downloads' },
        ]}
      >
        <Link href="/produkte" className="knopf-sekundaer mt-8">
          Zum Produktkatalog
        </Link>
      </Seitenkopf>
      <section className="abschnitt">
        <div className="container-seite grid gap-14 lg:grid-cols-2 lg:gap-x-20">
          {kategorien.map((k) => {
            const liste = mitPdf.filter((p) => p.kategorie === k);
            if (liste.length === 0) return null;
            return (
              <section key={k} aria-labelledby={`kat-${k.replace(/\W+/g, '-')}`}>
                <h2 id={`kat-${k.replace(/\W+/g, '-')}`} className="titel-3 mb-5 text-marke">
                  {k}
                </h2>
                <ul className="border-t border-linie">
                  {liste.map((p) => (
                    <li key={p.slug} className="border-b border-linie">
                      <a
                        href={p.dokument as string}
                        target="_blank"
                        rel="noopener"
                        className="group grid min-h-14 grid-cols-[1.5rem_1fr_auto] items-center gap-4 py-3 transition-colors hover:text-marke"
                      >
                        <FileText className="size-5 text-marke" aria-hidden />
                        <span>
                          <span className="block font-medium leading-snug">{sauberText(p.titel)}</span>
                          <span className="mt-0.5 block text-xs tracking-[0.08em] text-text-leise uppercase">
                            PDF{p.seiten ? `, ${p.seiten} ${p.seiten === 1 ? 'Seite' : 'Seiten'}` : ''}
                            {p.bytes ? `, ${groesse(p.bytes)}` : ''}
                          </span>
                        </span>
                        <Download className="size-5 text-text-leise transition-colors group-hover:text-marke" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
      <CtaBand
        daten={{
          ueberzeile: 'Beratung',
          titel: 'Sie suchen eine bestimmte Ausführung?',
          text: 'Nennen Sie uns Produkt, Ausführung und Menge. Wir klären Verfügbarkeit und Liefertermin mit Ihrer Anfrage.',
          knopf: { text: 'Produkt anfragen', link: '/kontakt?betreff=Produkte%20und%20Datenbl%C3%A4tter' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
