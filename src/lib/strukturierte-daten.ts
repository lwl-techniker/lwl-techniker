import { DOMAIN } from '@/site.config';
import type { Einstellungen, Leistung, Person, Referenz } from './cms';
import { sauberText } from './text';

/**
 * Strukturierte Daten (schema.org, JSON-LD) für Google, Bing und KI-Suchsysteme.
 *
 * Alle Knoten verweisen über @id auf die Organisation aus dem Layout, damit Suchmaschinen Leistungen,
 * Personen, Referenzen und Produkte derselben Firma zuordnen. Es werden nur Angaben ausgegeben,
 * die auch sichtbar auf der Seite stehen (keine erfundenen Bewertungen, Preise oder Öffnungszeiten).
 */

export const ORGANISATION_ID = `${DOMAIN}/#organisation`;
export const WEBSITE_ID = `${DOMAIN}/#website`;

const url = (pfad: string) => new URL(pfad, DOMAIN).toString();

/** Organisation (LocalBusiness) und Website als Graph für das Layout. */
export function organisationUndWebsite(e: Einstellungen) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': ORGANISATION_ID,
        name: e.firmenname,
        description: sauberText(e.kurzbeschreibung),
        url: DOMAIN,
        telephone: e.telefon,
        email: e.email,
        logo: e.logo ? url(e.logo) : undefined,
        image: e.ogbild ? url(e.ogbild) : undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: e.strasse,
          postalCode: e.plz,
          addressLocality: e.ort,
          addressRegion: e.kanton || undefined,
          addressCountry: e.land,
        },
        areaServed: { '@type': 'Country', name: 'Schweiz' },
        knowsAbout: ['Glasfasertechnik', 'LWL-Installation', 'Muffenspleissung', 'FTTH', 'OTDR-Messung', 'Rechenzentrumsverkabelung'],
        sameAs: e.socialMedia.map((s) => s.url),
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: DOMAIN,
        name: e.firmenname,
        description: sauberText(e.seoBeschreibung),
        inLanguage: 'de-CH',
        publisher: { '@id': ORGANISATION_ID },
      },
    ],
  };
}

/** Eine Leistung als Service mit der Firma als Anbieter. */
export function leistungAlsService(l: Leistung) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url(`/leistungen/${l.slug}`)}#service`,
    name: sauberText(l.titel),
    description: sauberText(l.kurzbeschreibung),
    url: url(`/leistungen/${l.slug}`),
    image: url(l.bild),
    serviceType: sauberText(l.titel),
    provider: { '@id': ORGANISATION_ID },
    areaServed: { '@type': 'Country', name: 'Schweiz' },
    inLanguage: 'de-CH',
  };
}

/** Übersicht aller Leistungen als Liste (für /leistungen). */
export function leistungenAlsListe(leistungen: Leistung[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Leistungen',
    itemListElement: leistungen.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: url(`/leistungen/${l.slug}`),
      name: sauberText(l.titel),
    })),
  };
}

/** Teamseite: Personen mit Funktion, der Firma zugeordnet. E-Mail und Telefon nur, wenn im CMS hinterlegt. */
export function teamAlsPersonen(personen: Person[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Team',
    itemListElement: personen.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: p.name,
        jobTitle: sauberText(p.funktion),
        worksFor: { '@id': ORGANISATION_ID },
        image: p.foto ? url(p.foto) : undefined,
        email: p.email || undefined,
        telephone: p.telefon || undefined,
      },
    })),
  };
}

/** Referenz als Artikel (Projektbericht) der Firma. */
export function referenzAlsArtikel(r: Referenz) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url(`/referenzen/${r.slug}`)}#artikel`,
    headline: sauberText(r.titel),
    description: sauberText(r.kurzbeschreibung),
    url: url(`/referenzen/${r.slug}`),
    image: r.titelbild ? url(r.titelbild) : undefined,
    datePublished: r.datum || undefined,
    inLanguage: 'de-CH',
    author: { '@id': ORGANISATION_ID },
    publisher: { '@id': ORGANISATION_ID },
    about: r.kategorie ? { '@type': 'Thing', name: sauberText(r.kategorie) } : undefined,
    contentLocation: r.ort ? { '@type': 'Place', name: sauberText(r.ort) } : undefined,
    video: r.video
      ? {
          '@type': 'VideoObject',
          name: sauberText(r.videotext) || `Video: ${sauberText(r.titel)}`,
          description: sauberText(r.videotext) || sauberText(r.kurzbeschreibung),
          contentUrl: url(r.video),
          thumbnailUrl: r.videoposter ? url(r.videoposter) : r.titelbild ? url(r.titelbild) : undefined,
          uploadDate: r.datum || undefined,
          inLanguage: 'de-CH',
        }
      : undefined,
  };
}

/** Referenzübersicht als Liste. */
export function referenzenAlsListe(referenzen: Referenz[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Referenzen',
    itemListElement: referenzen.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: url(`/referenzen/${r.slug}`),
      name: sauberText(r.titel),
    })),
  };
}

/** Datenblattkatalog: Produkte mit Kategorie und PDF, ohne Preise (gibt es auf der Website bewusst nicht). */
export function produkteAlsListe(produkte: { slug: string; titel: string; kategorie: string; dokument: string | null; bild: { pfad: string } | null }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Produkte und Datenblätter',
    numberOfItems: produkte.length,
    itemListElement: produkte.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: sauberText(p.titel),
        category: sauberText(p.kategorie),
        url: `${url('/produkte')}?kategorie=${encodeURIComponent(p.kategorie)}`,
        image: p.bild ? url(p.bild.pfad) : undefined,
        subjectOf: p.dokument ? { '@type': 'DigitalDocument', name: `Datenblatt ${sauberText(p.titel)}`, url: url(p.dokument), encodingFormat: 'application/pdf' } : undefined,
        manufacturer: { '@id': ORGANISATION_ID },
      },
    })),
  };
}
