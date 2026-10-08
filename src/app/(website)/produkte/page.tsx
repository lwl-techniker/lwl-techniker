import { Suspense } from 'react';
import { CtaBand } from '@/components/bloecke/CtaBand';
import { Katalog } from '@/components/produkte/Katalog';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeDatenblaetter, holeEinstellungen, holeProduktKategorien, holeUebersichten } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { produkteAlsListe } from '@/lib/strukturierte-daten';
import { aktualisiertVon } from '@/lib/aktualisiert';

export async function generateMetadata() {
  const { produkte: u } = await holeUebersichten();
  return metadaten({ pfad: '/produkte', seitentitel: u.titel, seo: u.seo, beschreibungFallback: u.einleitung });
}

/**
 * Produkte als Datenblattkatalog (Variante B): Kategorien, Suche über den extrahierten PDF-Text, kompakte Einträge
 * mit automatischer Vorschau, direkte Ansicht und Download, Anfrage mit vorbelegtem Formular.
 * Es gibt bewusst keine Detailseiten mit separat gepflegten technischen Angaben: das PDF ist die Quelle.
 */
export default async function ProdukteSeite() {
  const [{ produkte: u }, eintraege, kategorien, e] = await Promise.all([holeUebersichten(), holeDatenblaetter(), holeProduktKategorien(), holeEinstellungen()]);
  const mitDatenblatt = eintraege.filter((p) => p.dokument).length;

  return (
    <>
      <Seitenkopf aktualisiert={aktualisiertVon('content/einstellungen/uebersichten.json', 'content/produkte')} ueberzeile={u.ueberzeile} titel={u.titel} einleitung={u.einleitung} pfad={[{ text: u.titel, href: '/produkte' }]}>
        {u.anfrageHinweis ? <p className="mt-6 max-w-3xl text-sm text-text-leise">{sauberText(u.anfrageHinweis)}</p> : null}
      </Seitenkopf>
      <JsonLd daten={produkteAlsListe(eintraege)} />
      <section className="abschnitt">
        <div className="container-seite">
          <p className="mb-8 text-xs tracking-[0.2em] text-text-leise uppercase">
            {mitDatenblatt} Datenblätter als PDF, {eintraege.length - mitDatenblatt} Produkte auf Anfrage
          </p>
          {/* Suspense: der Katalog liest den Kategoriefilter aus der Adresse, die Seite bleibt statisch */}
          <Suspense fallback={<div className="min-h-[40rem]" aria-busy />}>
            <Katalog eintraege={eintraege} kategorien={kategorien} />
          </Suspense>
          {u.archivHinweis ? <p className="mt-14 max-w-3xl text-sm text-text-leise">{sauberText(u.archivHinweis)}</p> : null}
        </div>
      </section>
      <CtaBand
        daten={{
          ueberzeile: 'Individuelle Lösungen',
          titel: 'Ihr Projekt passt in keine Standardbox?',
          text: 'Wandverteiler mit besonderen Abmessungen, vorkonfektionierte Kabel oder Komponenten mit Ihrem Logo: Wir entwickeln und konfektionieren nach Ihren Angaben. Werkzeuge und Reinigungsmaterial erhalten Sie auf Anfrage.',
          knopf: { text: 'Offerte anfragen', link: '/kontakt?betreff=Produkte%20und%20Datenbl%C3%A4tter' },
          telefonZeigen: true,
        }}
        einstellungen={e}
      />
    </>
  );
}
