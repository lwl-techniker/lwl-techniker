import formulare from './formulare.json';

export type FeldTyp = 'text' | 'email' | 'tel' | 'auswahl' | 'textbereich' | 'zustimmung';

export type Feld = {
  name: string;
  typ: FeldTyp;
  label: string;
  pflicht: boolean;
  autocomplete?: string;
  breite: 'halb' | 'voll';
};

export type Formular = {
  emailBetreff: string;
  felder: Feld[];
};

export type FormularName = keyof typeof formulare;

export function holeFormular(name: FormularName): Formular {
  return formulare[name] as Formular;
}

/** Name des Spam-Fallen-Feldes. Muss mit scripts/erzeuge-formulare.mjs übereinstimmen. */
export const HONIGTOPF_FELD = 'bot-field';
