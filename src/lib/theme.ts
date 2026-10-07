/**
 * Lightmodus: dunkel ist der Standard, hell greift automatisch bei Geräteeinstellung "hell"
 * (siehe globals.css) oder wenn die Kundschaft über den Schalter manuell "hell" wählt.
 * Eine manuelle Wahl wird in localStorage gemerkt und überschreibt die Geräteeinstellung.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'hell' | 'dunkel';

const SCHLUESSEL = 'lwl-theme';
export const THEMA_GEAENDERT = 'lwl-thema-geaendert';

/** Manuell gewähltes Theme, oder null wenn die Geräteeinstellung gilt. */
export function holeGewaehltesTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const wert = window.localStorage.getItem(SCHLUESSEL);
    return wert === 'hell' || wert === 'dunkel' ? wert : null;
  } catch {
    return null;
  }
}

/** Tatsächlich sichtbares Theme: manuelle Wahl, sonst Geräteeinstellung. */
export function holeAktivesTheme(): Theme {
  if (typeof document === 'undefined') return 'dunkel';
  const gewaehlt = holeGewaehltesTheme();
  if (gewaehlt) return gewaehlt;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'hell' : 'dunkel';
}

/** Setzt eine manuelle Wahl (oder null, um wieder der Geräteeinstellung zu folgen) und informiert offene Komponenten. */
export function setzeTheme(theme: Theme | null) {
  try {
    if (theme) window.localStorage.setItem(SCHLUESSEL, theme);
    else window.localStorage.removeItem(SCHLUESSEL);
  } catch {
    // Speicher nicht verfügbar (z. B. privates Fenster): Wahl gilt nur für diese Seitenansicht
  }
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  document.dispatchEvent(new Event(THEMA_GEAENDERT));
}

function abonnieren(callback: () => void) {
  const geraet = window.matchMedia('(prefers-color-scheme: light)');
  document.addEventListener(THEMA_GEAENDERT, callback);
  geraet.addEventListener('change', callback);
  return () => {
    document.removeEventListener(THEMA_GEAENDERT, callback);
    geraet.removeEventListener('change', callback);
  };
}

const SERVER_SNAPSHOT: Theme = 'dunkel';
const serverSnapshot = () => SERVER_SNAPSHOT;

/** Liest das aktive Theme und rendert bei Wechsel (Schalter, Geräteeinstellung) automatisch neu. */
export function useAktivesTheme(): Theme {
  return useSyncExternalStore(abonnieren, holeAktivesTheme, serverSnapshot);
}
