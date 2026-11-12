/**
 * Lightmodus: dunkel ist immer der Standard, unabhängig von der Geräteeinstellung (Wunsch der Kundschaft vom
 * 30. Oktober 2026). Hell gibt es nur, wenn jemand über den Schalter in der Kopfzeile "hell" wählt.
 * Die Wahl wird in localStorage gemerkt und gilt für weitere Besuche im selben Browser.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'hell' | 'dunkel';

const SCHLUESSEL = 'lwl-theme';
export const THEMA_GEAENDERT = 'lwl-thema-geaendert';

/** Manuell gewähltes Theme, oder null, wenn der Standard (dunkel) gilt. */
export function holeGewaehltesTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const wert = window.localStorage.getItem(SCHLUESSEL);
    return wert === 'hell' || wert === 'dunkel' ? wert : null;
  } catch {
    return null;
  }
}

/** Tatsächlich sichtbares Theme: manuelle Wahl, sonst dunkel. */
export function holeAktivesTheme(): Theme {
  if (typeof document === 'undefined') return 'dunkel';
  return holeGewaehltesTheme() ?? 'dunkel';
}

/** Setzt eine manuelle Wahl (oder null, um zum Standard dunkel zurückzukehren) und informiert offene Komponenten. */
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
  document.addEventListener(THEMA_GEAENDERT, callback);
  return () => document.removeEventListener(THEMA_GEAENDERT, callback);
}

const SERVER_SNAPSHOT: Theme = 'dunkel';
const serverSnapshot = () => SERVER_SNAPSHOT;

/** Liest das aktive Theme und rendert bei Wechsel über den Schalter automatisch neu. */
export function useAktivesTheme(): Theme {
  return useSyncExternalStore(abonnieren, holeAktivesTheme, serverSnapshot);
}
