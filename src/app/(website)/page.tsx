import { BlockRenderer } from '@/components/bloecke/BlockRenderer';
import { holeEinstellungen, holeStartseite } from '@/lib/cms';
import { metadaten } from '@/lib/seo';

export async function generateMetadata() {
  const s = await holeStartseite();
  return metadaten({ pfad: '/', seo: s.seo });
}

export default async function Startseite() {
  const [s, e] = await Promise.all([holeStartseite(), holeEinstellungen()]);
  return <BlockRenderer bloecke={s.bloecke} einstellungen={e} seitentitel={e.seoTitel} />;
}
