import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Zeigt ein Bild vollständig, ohne es auf die Kachelform zuzuschneiden. Wichtig für Fotos aus dem
 * Feld, die oft im Hochformat aufgenommen sind (z. B. in einem Tunnel), aber in einer breiten
 * Kachel oder im breiten Titelbild einer Referenz erscheinen. Eine unscharfe, vergrösserte Version
 * desselben Bildes füllt den Rand. Bei Querformat-Fotos, die die Fläche fast ausfüllen, ist dieser
 * Rand meist unsichtbar.
 */
export function BildOhneBeschnitt({
  src,
  alt,
  sizes,
  prioritaet = false,
  zoomBeiHover = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  prioritaet?: boolean;
  /** Für Kacheln mit group-hover:scale, z. B. Referenzkarten. */
  zoomBeiHover?: boolean;
}) {
  const zoom = zoomBeiHover && 'transition-transform duration-700 ease-out group-hover:scale-[1.04]';
  return (
    <>
      <Image src={src} alt="" aria-hidden fill sizes={sizes} className={cn('scale-110 object-cover opacity-60 blur-2xl', zoom)} />
      <Image
        src={src}
        alt={alt}
        fill
        loading={prioritaet ? 'eager' : undefined}
        fetchPriority={prioritaet ? 'high' : undefined}
        sizes={sizes}
        className={cn('object-contain', zoom)}
      />
    </>
  );
}
