import Image from 'next/image';
import { cn } from '@/lib/cn';

type Props = {
  name: string;
  /** Einfarbige, helle Silhouette (PNG mit Transparenz). Wird als CSS-Maske in Textfarbe gezeigt. */
  logo: string;
  /** Originalfarben (WebP mit Transparenz). Wird im hellen Erscheinungsbild gezeigt. */
  logoFarbig: string | null;
  className?: string;
  /** Für Screenreader verbergen, z. B. in der zweiten Schleife des Logosliders */
  versteckt?: boolean;
};

/**
 * Referenzlogo in beiden Farbmodi (V3-Lösung, behebt den V2-Lightmode-Fehler mit unsichtbaren weissen Logos):
 * - dunkel: die Silhouette liegt als CSS-Maske über der Textfarbe, sie bleibt in jedem Modus kontrastreich
 * - hell: das Logo in Originalfarben, ohne weisse Kachel dahinter (Umschaltung in globals.css)
 * Beide Varianten füllen denselben festen Rahmen, damit hohe Logos (z. B. UPC) nicht abgeschnitten oder verzerrt werden.
 * Die Dateien sind Rasterbilder (PNG, WebP), keine SVG.
 */
export function ReferenzLogo({ name, logo, logoFarbig, className, versteckt }: Props) {
  return (
    <span className={cn('logo-rahmen', className)} role={versteckt ? undefined : 'img'} aria-label={versteckt ? undefined : name} aria-hidden={versteckt || undefined}>
      {/* Ohne Farbversion bleibt die Silhouette auch im hellen Modus sichtbar (Klasse "immer") */}
      <span className={cn('logo-silhouette', !logoFarbig && 'immer')} style={{ maskImage: `url("${logo}")`, WebkitMaskImage: `url("${logo}")` }} aria-hidden />
      {logoFarbig ? (
        // Farbige Logos haben Transparenz: unoptimized, damit das Bild-CDN sie nicht opak einfärbt.
        <Image src={logoFarbig} alt="" aria-hidden className="logo-farbig" width={320} height={128} unoptimized />
      ) : null}
    </span>
  );
}
