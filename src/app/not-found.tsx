import './globals.css';
import Link from 'next/link';
import { Kopfzeile } from '@/components/layout/Kopfzeile';
import { Fusszeile } from '@/components/layout/Fusszeile';
import { Faserwellen } from '@/components/ui/Faserwellen';
import { holeEinstellungen, holeNavigation } from '@/lib/cms';

export const metadata = { title: 'Seite nicht gefunden' };

export default async function NichtGefunden() {
  const [e, n] = await Promise.all([holeEinstellungen(), holeNavigation()]);
  const kontakt = { text: n.knopf.text || 'Kontakt', link: n.knopf.link || '/kontakt' };
  const menue = n.hauptmenue
    .filter((p) => p.link !== kontakt.link)
    .map((p) => ({ text: p.text, link: p.link, unterpunkte: p.unterpunkte.map((u) => ({ text: u.text, link: u.link, beschreibung: u.beschreibung || undefined, hervorgehoben: u.hervorgehoben })) }));

  return (
    <>
      <Kopfzeile firmenname={e.firmenname} logoHell={e.logohell ?? null} logoDunkel={e.logo ?? null} telefon={e.telefon} menue={menue} kontakt={kontakt} />
      <Faserwellen />
      <main id="inhalt" className="container-seite abschnitt-gross">
        <p className="ueberzeile">Fehler 404</p>
        <h1 className="titel-1 max-w-5xl">Diese Seite gibt es nicht mehr oder die Adresse ist falsch.</h1>
        <p className="einleitung mt-6 max-w-2xl">Über die Startseite finden Sie alle Inhalte. Bei Fragen erreichen Sie uns unter {e.telefon}.</p>
        <Link href="/" className="knopf-primaer mt-10">
          Zur Startseite
        </Link>
      </main>
      <Fusszeile einstellungen={e} navigation={n} />
    </>
  );
}
