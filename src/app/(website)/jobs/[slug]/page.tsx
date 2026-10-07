import { notFound } from 'next/navigation';
import { Clock, MapPin, CalendarDays, Mail } from 'lucide-react';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { JsonLd } from '@/components/seo/JsonLd';
import { holeEinstellungen, holeJob, holeJobs, holeUebersichten } from '@/lib/cms';
import { markdocAlsHtml, renderMarkdoc } from '@/lib/markdoc';
import { metadaten } from '@/lib/seo';
import { sauberText } from '@/lib/text';
import { DOMAIN } from '@/site.config';

/** Nur offene Stellen erhalten eine Seite. Besetzte Stellen verschwinden beim nächsten Build automatisch. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await holeJobs()).map((j) => ({ slug: j.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const j = await holeJob(slug);
  if (!j) return {};
  return metadaten({ pfad: `/jobs/${slug}`, seitentitel: `${j.titel}, ${j.pensum}`, seo: j.seo, beschreibungFallback: j.kurzbeschreibung });
}

export default async function JobSeite({ params }: Props) {
  const { slug } = await params;
  const [j, e, { jobs: u }] = await Promise.all([holeJob(slug), holeEinstellungen(), holeUebersichten()]);
  if (!j) notFound();
  const [inhalt, beschreibungHtml] = await Promise.all([renderMarkdoc(j.inhalt), markdocAlsHtml(j.inhalt)]);

  const betreff = encodeURIComponent(`Bewerbung: ${j.titel}`);

  // JobPosting für Google Jobs, vollständig aus den CMS-Daten erzeugt
  const stellenDaten = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: sauberText(j.titel),
    description: beschreibungHtml || sauberText(j.kurzbeschreibung),
    datePosted: j.datum,
    // Ganzer letzter Tag gültig, analog zu istNochGueltig() in src/lib/startseite-auswahl.ts
    validThrough: j.gueltigBis ? `${j.gueltigBis}T23:59:59` : undefined,
    // Lehrstellen sind in der Schweiz Vollzeit mit Ausbildung
    employmentType: j.anstellungsart === 'INTERN' ? ['FULL_TIME', 'INTERN'] : j.anstellungsart,
    directApply: false,
    url: new URL(`/jobs/${slug}`, DOMAIN).toString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: e.firmenname,
      sameAs: DOMAIN,
      logo: e.logo ? new URL(e.logo, DOMAIN).toString() : undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: j.arbeitsort,
        addressRegion: e.kanton || undefined,
        addressCountry: e.land,
        // Am Firmensitz ist die volle Adresse bekannt
        ...(j.arbeitsort.trim().toLowerCase() === e.ort.trim().toLowerCase() ? { streetAddress: e.strasse, postalCode: e.plz } : {}),
      },
    },
  };

  return (
    <>
      <Seitenkopf
        titel={j.titel}
        einleitung={j.kurzbeschreibung}
        pfad={[
          { text: u.titel, href: '/jobs' },
          { text: j.titel, href: `/jobs/${slug}` },
        ]}
      >
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-text-leise">
          <li className="inline-flex items-center gap-2">
            <Clock className="size-5 text-marke" aria-hidden />
            {j.pensum}
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin className="size-5 text-marke" aria-hidden />
            {j.arbeitsort}
          </li>
          {j.eintritt ? (
            <li className="inline-flex items-center gap-2">
              <CalendarDays className="size-5 text-marke" aria-hidden />
              Eintritt: {j.eintritt}
            </li>
          ) : null}
        </ul>
      </Seitenkopf>

      <section className="abschnitt">
        <div className="container-seite grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-20">
          <div className="fliesstext lesebreite">{inhalt}</div>
          <aside className="h-fit rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8 lg:sticky lg:top-32 lg:p-10">
            <h2 className="titel-3">So bewerben Sie sich</h2>
            <p className="mt-3 text-text-leise">
              Senden Sie Ihre Unterlagen per E-Mail{j.kontaktperson ? ` an ${j.kontaktperson}` : ''}. Wir melden uns persönlich bei Ihnen.
            </p>
            <a href={`mailto:${j.bewerbungEmail}?subject=${betreff}`} className="knopf-primaer mt-8 w-full">
              <Mail className="size-5" aria-hidden />
              Bewerbung senden
            </a>
            <p className="mt-6 text-sm text-text-leise">
              Fragen zur Stelle:{' '}
              <a href={`tel:${e.telefon.replaceAll(' ', '')}`} className="inline-block py-1 text-text underline underline-offset-4">
                {e.telefon}
              </a>
            </p>
          </aside>
        </div>
      </section>
      <JsonLd daten={stellenDaten} />
    </>
  );
}
