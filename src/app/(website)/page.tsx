import { BlockRenderer } from '@/components/bloecke/BlockRenderer';
import { JsonLd } from '@/components/seo/JsonLd';
import { aktualisiertVon } from '@/lib/aktualisiert';
import { holeEinstellungen, holeStartseite } from '@/lib/cms';
import { metadaten } from '@/lib/seo';
import { seiteAlsWebPage } from '@/lib/strukturierte-daten';

export async function generateMetadata() {
  const s = await holeStartseite();
  return metadaten({ pfad: '/', seo: s.seo });
}

export default async function Startseite() {
  const [s, e] = await Promise.all([holeStartseite(), holeEinstellungen()]);
  return (
    <>
      <JsonLd
        daten={seiteAlsWebPage({
          pfad: '/',
          titel: s.seo.titel || e.seoTitel,
          beschreibung: s.seo.beschreibung || e.seoBeschreibung,
          aktualisiert: aktualisiertVon('content/startseite', 'content/leistungen', 'content/referenzen'),
          bild: e.ogbild,
        })}
      />
      <BlockRenderer bloecke={s.bloecke} einstellungen={e} seitentitel={e.seoTitel} />
    </>
  );
}
