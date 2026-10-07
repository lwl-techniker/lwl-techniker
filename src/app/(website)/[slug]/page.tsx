import { notFound } from 'next/navigation';
import { BlockRenderer, ersterBlockHatH1 } from '@/components/bloecke/BlockRenderer';
import { Seitenkopf } from '@/components/ui/Seitenkopf';
import { holeAlleSeiten, holeEinstellungen, holeSeite } from '@/lib/cms';
import { metadaten } from '@/lib/seo';

/** Nur Seiten aus dem CMS existieren. Unbekannte Adressen ergeben sofort 404, ohne Dateizugriff zur Laufzeit. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const seiten = await holeAlleSeiten();
  return seiten.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const seite = await holeSeite(slug);
  if (!seite) return {};
  return metadaten({ pfad: `/${slug}`, seitentitel: seite.titel, seo: seite.seo, ohneIndex: !seite.inSitemap });
}

export default async function Seite({ params }: Props) {
  const { slug } = await params;
  const [seite, e] = await Promise.all([holeSeite(slug), holeEinstellungen()]);
  if (!seite) notFound();
  // Beginnt die Seite nicht mit Startbereich oder Fliesstext mit Titel, erhält sie einen sichtbaren Seitenkopf
  const mitSeitenkopf = !ersterBlockHatH1(seite.bloecke);
  return (
    <>
      {mitSeitenkopf ? <Seitenkopf titel={seite.titel} pfad={[{ text: seite.titel, href: `/${slug}` }]} /> : null}
      <BlockRenderer bloecke={seite.bloecke} einstellungen={e} seitentitel={seite.titel} hatSeitenkopf={mitSeitenkopf} />
    </>
  );
}
