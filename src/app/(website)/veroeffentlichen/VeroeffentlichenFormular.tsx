'use client';

import { useState } from 'react';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';

type Zustand = { art: 'leer' } | { art: 'laeuft' } | { art: 'ok'; text: string } | { art: 'fehler'; text: string };

/** Kennwort eingeben und die Veröffentlichung über /api/veroeffentlichen starten. */
export function VeroeffentlichenFormular() {
  const [kennwort, setKennwort] = useState('');
  const [zustand, setZustand] = useState<Zustand>({ art: 'leer' });

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    setZustand({ art: 'laeuft' });
    try {
      const antwort = await fetch('/api/veroeffentlichen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kennwort }),
      });
      const daten = (await antwort.json()) as { ok: boolean; text: string };
      setZustand(daten.ok ? { art: 'ok', text: daten.text } : { art: 'fehler', text: daten.text });
      if (daten.ok) setKennwort('');
    } catch {
      setZustand({ art: 'fehler', text: 'Keine Verbindung. Bitte später erneut versuchen.' });
    }
  }

  return (
    <form onSubmit={senden} className="rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8 lg:p-10">
      <label htmlFor="kennwort" className="formular-label">
        Kennwort für die Veröffentlichung
      </label>
      <input
        id="kennwort"
        type="password"
        autoComplete="current-password"
        required
        value={kennwort}
        onChange={(e) => setKennwort(e.target.value)}
        className="formular-feld"
        disabled={zustand.art === 'laeuft'}
      />
      <button type="submit" className="knopf-primaer mt-6" disabled={zustand.art === 'laeuft'}>
        {zustand.art === 'laeuft' ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden /> Wird gestartet
          </>
        ) : (
          'Prüfen und veröffentlichen'
        )}
      </button>
      {zustand.art === 'ok' ? (
        <p role="status" className="mt-6 flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-marke" aria-hidden />
          <span>{zustand.text}</span>
        </p>
      ) : null}
      {zustand.art === 'fehler' ? (
        <p role="alert" className="mt-6 flex items-start gap-2 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-marke" aria-hidden />
          <span>{zustand.text}</span>
        </p>
      ) : null}
    </form>
  );
}
