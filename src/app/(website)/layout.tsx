import '../globals.css';
import type { Metadata } from 'next';
import { Kopfzeile, type Menuepunkt } from '@/components/layout/Kopfzeile';
import { Fusszeile } from '@/components/layout/Fusszeile';
import { RoutenScroll } from '@/components/layout/RoutenScroll';
import { JsonLd } from '@/components/seo/JsonLd';
import { Einblenden } from '@/components/ui/Einblenden';
import { Faserwellen } from '@/components/ui/Faserwellen';
import { holeEinstellungen, holeNavigation, holeProduktKategorien } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import { DOMAIN } from '@/site.config';

export async function generateMetadata(): Promise<Metadata> {
  const e = await holeEinstellungen();
  return {
    title: { default: sauberText(e.seoTitel), template: `%s | ${e.firmenname}` },
    description: sauberText(e.seoBeschreibung),
  };
}

/**
 * Gemeinsames Layout: Kopfzeile und Fusszeile aus V3, V2-Hintergrundanimation fest hinter der ganzen Seite,
 * sofortiger Scroll nach oben bei Routenwechsel (RoutenScroll).
 *
 * Untermenü Produkte: Kategorien der Datenblätter werden automatisch an die im CMS gepflegten Unterpunkte angehängt.
 */
export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [e, n, kategorien] = await Promise.all([holeEinstellungen(), holeNavigation(), holeProduktKategorien()]);

  const menue: Menuepunkt[] = n.hauptmenue
    .filter((p) => p.link !== (n.knopf.link || '/kontakt'))
    .map((p) => {
      const unterpunkte = p.unterpunkte.map((u) => ({ text: u.text, link: u.link, beschreibung: u.beschreibung || undefined, hervorgehoben: u.hervorgehoben }));
      if (p.link === '/produkte') {
        const vorhanden = new Set(unterpunkte.map((u) => u.link));
        for (const k of kategorien) {
          const link = `/produkte?kategorie=${encodeURIComponent(k)}`;
          if (!vorhanden.has(link)) unterpunkte.push({ text: k, link, beschreibung: undefined, hervorgehoben: false });
        }
        // "Datenblätter und Downloads" bleibt wie in V3 der letzte Eintrag, nach den Kategorien
        const downloads = unterpunkte.filter((u) => u.link === '/downloads');
        return { text: p.text, link: p.link, unterpunkte: [...unterpunkte.filter((u) => u.link !== '/downloads'), ...downloads] };
      }
      return { text: p.text, link: p.link, unterpunkte };
    });

  const organisation = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${DOMAIN}/#organisation`,
    name: e.firmenname,
    description: sauberText(e.kurzbeschreibung),
    url: DOMAIN,
    telephone: e.telefon,
    email: e.email,
    logo: e.logo ? new URL(e.logo, DOMAIN).toString() : undefined,
    image: e.ogbild ? new URL(e.ogbild, DOMAIN).toString() : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: e.strasse,
      postalCode: e.plz,
      addressLocality: e.ort,
      addressRegion: e.kanton || undefined,
      addressCountry: e.land,
    },
    areaServed: { '@type': 'Country', name: 'Schweiz' },
    sameAs: e.socialMedia.map((s) => s.url),
  };

  return (
    <>
      <RoutenScroll />
      <Kopfzeile
        firmenname={e.firmenname}
        logoHell={e.logohell ?? null}
        logoDunkel={e.logo ?? null}
        telefon={e.telefon}
        ort={e.ort}
        menue={menue}
        kontakt={{ text: n.knopf.text || 'Kontakt', link: n.knopf.link || '/kontakt' }}
      />
      {/* Faserwellen (V2) liegen fest hinter der ganzen Seite */}
      <Faserwellen />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Fusszeile einstellungen={e} navigation={n} />
      <JsonLd daten={organisation} />
      <Einblenden />
    </>
  );
}
