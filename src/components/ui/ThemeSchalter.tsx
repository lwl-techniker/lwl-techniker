'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { setzeTheme, useAktivesTheme } from '@/lib/theme';

/**
 * Kleiner, unaufdringlicher Schalter für den Lightmodus, in der Kopfzeile. Zeigt das Symbol des
 * Erscheinungsbilds, zu dem ein Klick wechselt (Mond im hellen, Sonne im dunklen Erscheinungsbild).
 * Merkt eine manuelle Wahl in localStorage, sonst gilt die Geräteeinstellung.
 */
export function ThemeSchalter({ className }: { className?: string }) {
  const theme = useAktivesTheme();
  const umschalten = () => setzeTheme(theme === 'hell' ? 'dunkel' : 'hell');

  return (
    <button
      type="button"
      onClick={umschalten}
      className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-leise transition-colors hover:text-marke lg:size-12 2xl:size-[3.25rem]', className)}
      aria-label={theme === 'hell' ? 'Dunkles Erscheinungsbild einschalten' : 'Helles Erscheinungsbild einschalten'}
      title={theme === 'hell' ? 'Dunkles Erscheinungsbild' : 'Helles Erscheinungsbild'}
    >
      {theme === 'hell' ? <Moon className="size-6 lg:size-7" aria-hidden /> : <Sun className="size-6 lg:size-7" aria-hidden />}
    </button>
  );
}
