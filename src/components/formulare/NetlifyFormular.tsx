'use client';

import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react';
import { HONIGTOPF_FELD, holeFormular, type FormularName } from '@/formulare/typen';
import { cn } from '@/lib/cn';

/**
 * NETLIFY FORMULAR
 *
 * Regeln (Details in docs/05-formulare.md):
 * 1. Felder nur in src/formulare/formulare.json definieren. public/__forms.html wird daraus erzeugt.
 * 2. Senden per fetch an "/__forms.html", niemals an "/" oder an eine Seite.
 * 3. Body als application/x-www-form-urlencoded mit "form-name".
 * 4. Keine Attribute "netlify" oder "data-netlify" im React-Code. Der Netlify-Build bricht sonst ab.
 * 5. Lokal (npm run dev) gibt es Netlify nicht. Das Formular zeigt dann einen Testhinweis und sendet nichts.
 * 6. Vorbelegung über die Adresse (V3): ?produkt=<Produktname> füllt Betreff und Nachricht für eine Produktanfrage,
 *    ?betreff=<Option> wählt eine Betreffoption vor. Es wird nichts automatisch gesendet.
 */

type Status = 'bereit' | 'sendet' | 'erfolg' | 'fehler';

type Props = {
  name: FormularName;
  betreffOptionen?: readonly string[];
  datenschutzLink?: string;
  /** Text nach erfolgreichem Senden, im CMS pflegbar */
  bestaetigung?: string;
  kontaktEmail: string;
  kontaktTelefon: string;
  className?: string;
};

export function NetlifyFormular({
  name,
  betreffOptionen = [],
  datenschutzLink = '/datenschutz',
  bestaetigung = 'Wir haben Ihre Anfrage erhalten und melden uns innert eines Arbeitstages.',
  kontaktEmail,
  kontaktTelefon,
  className,
}: Props) {
  const formular = holeFormular(name);
  const id = useId();
  const [status, setStatus] = useState<Status>('bereit');
  const [testmodus, setTestmodus] = useState(false);
  const suche = useSearchParams();
  const produkt = suche.get('produkt')?.slice(0, 120) ?? '';
  const betreffWunsch = suche.get('betreff') ?? (produkt ? 'Produkte und Datenblätter' : '');
  const betreffVorbelegt = betreffOptionen.includes(betreffWunsch) ? betreffWunsch : '';
  const nachrichtVorbelegt = produkt ? `Ich interessiere mich für "${produkt}".\n\nBenötigte Ausführung und Menge:\n` : '';

  async function absenden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStatus('sendet');

    const daten = new FormData(form);
    const body = new URLSearchParams();
    for (const [schluessel, wert] of daten.entries()) {
      if (typeof wert === 'string') body.append(schluessel, wert);
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('[Formular-Testmodus] Lokal wird nichts gesendet. Diese Daten würden an Netlify gehen:', Object.fromEntries(body));
      await new Promise((r) => setTimeout(r, 600));
      setTestmodus(true);
      setStatus('erfolg');
      form.reset();
      return;
    }

    try {
      const antwort = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!antwort.ok) throw new Error(`Status ${antwort.status}`);
      setStatus('erfolg');
      form.reset();
    } catch (fehler) {
      console.error('Formular konnte nicht gesendet werden', fehler);
      setStatus('fehler');
    }
  }

  if (status === 'erfolg') {
    return (
      <div className={cn('rounded-[var(--radius-karte)] border border-linie bg-flaeche p-8 lg:p-10', className)} role="status">
        <CheckCircle2 className="size-10 text-marke" aria-hidden />
        <h3 className="mt-5 text-2xl font-semibold">Vielen Dank für Ihre Nachricht</h3>
        <p className="mt-3 max-w-prose text-text-leise">{bestaetigung}</p>
        {testmodus ? (
          <p className="mt-4 border border-marke/40 bg-marke/10 px-4 py-3 text-sm text-marke">
            Testmodus: Lokal wird nichts versendet. Auf Netlify geht die Anfrage an die hinterlegte Adresse.
          </p>
        ) : null}
        <button type="button" onClick={() => setStatus('bereit')} className="knopf-sekundaer mt-6">
          Weitere Nachricht senden
        </button>
      </div>
    );
  }

  return (
    <form name={name} method="POST" onSubmit={absenden} noValidate className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2', className)}>
      <input type="hidden" name="form-name" value={name} />
      <input type="hidden" name="subject" value={formular.emailBetreff} />
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label>
          Dieses Feld leer lassen
          <input name={HONIGTOPF_FELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formular.felder.map((feld) => {
        const feldId = `${id}-${feld.name}`;
        const breite = feld.breite === 'voll' ? 'sm:col-span-2' : '';

        if (feld.typ === 'auswahl') {
          if (betreffOptionen.length === 0) return null;
          return (
            <div key={feld.name} className={breite}>
              <label htmlFor={feldId} className="formular-label">
                {feld.label} {feld.pflicht ? <Pflicht /> : null}
              </label>
              <select id={feldId} name={feld.name} required={feld.pflicht} defaultValue={betreffVorbelegt} className="formular-feld">
                <option value="" disabled>
                  Bitte auswählen
                </option>
                {betreffOptionen.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (feld.typ === 'textbereich') {
          return (
            <div key={feld.name} className={breite}>
              <label htmlFor={feldId} className="formular-label">
                {feld.label} {feld.pflicht ? <Pflicht /> : null}
              </label>
              <textarea id={feldId} name={feld.name} required={feld.pflicht} rows={6} defaultValue={nachrichtVorbelegt} className="formular-feld resize-y" />
            </div>
          );
        }

        if (feld.typ === 'zustimmung') {
          return (
            <div key={feld.name} className={cn('flex items-start gap-3', breite)}>
              <input id={feldId} type="checkbox" name={feld.name} value="ja" required={feld.pflicht} className="mt-0.5 size-6 shrink-0 cursor-pointer accent-[var(--color-marke)]" />
              <label htmlFor={feldId} className="text-sm leading-relaxed text-text-leise">
                {feld.label}{' '}
                <Link href={datenschutzLink} className="underline underline-offset-4 hover:text-marke">
                  Zur Datenschutzerklärung
                </Link>
                {feld.pflicht ? <Pflicht /> : null}
              </label>
            </div>
          );
        }

        return (
          <div key={feld.name} className={breite}>
            <label htmlFor={feldId} className="formular-label">
              {feld.label} {feld.pflicht ? <Pflicht /> : null}
            </label>
            <input id={feldId} type={feld.typ} name={feld.name} required={feld.pflicht} autoComplete={feld.autocomplete} className="formular-feld" />
          </div>
        );
      })}

      {status === 'fehler' ? (
        <div className="flex gap-3 border border-red-400/60 bg-red-950/40 p-4 text-sm text-red-100 sm:col-span-2" role="alert">
          <TriangleAlert className="size-5 shrink-0" aria-hidden />
          <p>
            Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut. Sie erreichen uns auch per E-Mail an{' '}
            <a className="underline" href={`mailto:${kontaktEmail}`}>
              {kontaktEmail}
            </a>{' '}
            oder telefonisch unter{' '}
            <a className="underline" href={`tel:${kontaktTelefon.replaceAll(' ', '')}`}>
              {kontaktTelefon}
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="knopf-primaer" disabled={status === 'sendet'}>
          {status === 'sendet' ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
          {status === 'sendet' ? 'Wird gesendet' : 'Nachricht senden'}
        </button>
        <p className="text-sm text-text-leise">
          <Pflicht /> Pflichtfeld
        </p>
      </div>
    </form>
  );
}

function Pflicht() {
  return (
    <span className="text-marke" aria-hidden>
      *
    </span>
  );
}
