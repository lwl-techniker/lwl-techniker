'use client';

import Image from 'next/image';
import { useAktivesTheme } from '@/lib/theme';

type Props = {
  /** Helle Logovariante, für einen dunklen Untergrund */
  logoHell: string | null;
  /** Dunkle Logovariante, für einen hellen Untergrund */
  logoDunkel: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
};

/**
 * Logo, das automatisch zwischen der hellen und dunklen Variante wechselt, passend zum
 * Erscheinungsbild (Kopf- und Fusszeile sind im hellen Erscheinungsbild hell statt dunkel).
 */
export function MarkenLogo({ logoHell, logoDunkel, alt, width, height, className, eager }: Props) {
  const theme = useAktivesTheme();
  const logo = theme === 'hell' ? (logoDunkel ?? logoHell) : (logoHell ?? logoDunkel);
  if (!logo) return null;

  return (
    <Image
      src={logo}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : undefined}
      fetchPriority={eager ? 'high' : undefined}
      unoptimized={logo.endsWith('.svg')}
      className={className}
    />
  );
}
