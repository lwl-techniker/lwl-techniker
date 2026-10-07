import type { MetadataRoute } from 'next';
import { holeEinstellungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';

/** Web-App-Manifest: Name, Farben und Symbole (aus dem V3-Favicon erzeugt) für Startbildschirm und Browser. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const e = await holeEinstellungen();
  return {
    name: e.firmenname,
    short_name: 'LWL-Techniker',
    description: sauberText(e.seoBeschreibung),
    start_url: '/',
    display: 'browser',
    lang: 'de-CH',
    background_color: '#08112e',
    theme_color: '#08112e',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
