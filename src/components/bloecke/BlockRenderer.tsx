import type { Block, Einstellungen } from '@/lib/cms';
import { sauberText } from '@/lib/text';
import { Hero } from './Hero';
import { TextMitBild } from './TextMitBild';
import { Fliesstext } from './Fliesstext';
import { Kennzahlen } from './Kennzahlen';
import { Vorteile } from './Vorteile';
import { LeistungenBlock } from './LeistungenBlock';
import { Leistungsbereiche } from './Leistungsbereiche';
import { ReferenzenBlock } from './ReferenzenBlock';
import { JobsBlock } from './JobsBlock';
import { Ablauf } from './Ablauf';
import { Team } from './Team';
import { Logos } from './Logos';
import { Kundenstimmen } from './Kundenstimmen';
import { Faq } from './Faq';
import { Kontaktaufruf } from './Kontaktaufruf';
import { Kontaktformular } from './Kontaktformular';
import { LogoSlider } from './LogoSlider';
import { CtaBand } from './CtaBand';
import { TeamAuszug } from './TeamAuszug';
import { Datenblaetter } from './Datenblaetter';

type Props = {
  bloecke: readonly Block[];
  einstellungen: Einstellungen;
  /** Seitentitel für den unsichtbaren H1, falls kein Block einen H1 liefert */
  seitentitel: string;
  /** true, wenn die Seite bereits einen sichtbaren Seitenkopf mit H1 zeigt */
  hatSeitenkopf?: boolean;
};

/** Liefert der erste Block selbst einen H1 (Startbereich oder Fliesstext mit Titel)? */
export function ersterBlockHatH1(bloecke: readonly Block[]): boolean {
  const erster = bloecke[0];
  return erster?.discriminant === 'hero' || (erster?.discriminant === 'fliesstext' && Boolean(erster.value.titel));
}

/**
 * Ordnet jeden Keystatic-Block seiner Komponente zu.
 * TypeScript meldet einen Fehler, wenn ein Block im Schema existiert, hier aber fehlt (siehe `nieErreicht`).
 *
 * Jede Seite hat genau einen H1:
 * - erster Block ist ein Startbereich (Hero): dessen Titel
 * - erster Block ist ein Fliesstext mit Titel: dessen Titel
 * - Unterseiten sonst: sichtbarer Seitenkopf mit Brotkrumen (src/app/(website)/[slug]/page.tsx)
 * - Startseite sonst: unsichtbarer H1 mit dem Seitentitel (für Screenreader und Google)
 */
export function BlockRenderer({ bloecke, einstellungen, seitentitel, hatSeitenkopf = false }: Props) {
  const ersterIstTitelText = bloecke[0]?.discriminant === 'fliesstext' && Boolean(bloecke[0].value.titel);
  const brauchtH1 = !hatSeitenkopf && !ersterBlockHatH1(bloecke);

  return (
    <>
      {brauchtH1 ? <h1 className="sr-only">{sauberText(seitentitel)}</h1> : null}
      {bloecke.map((block, index) => {
        const key = `${block.discriminant}-${index}`;
        switch (block.discriminant) {
          case 'hero':
            return <Hero key={key} daten={block.value} istErster={index === 0} />;
          case 'textMitBild':
            return <TextMitBild key={key} daten={block.value} />;
          case 'fliesstext':
            return <Fliesstext key={key} daten={block.value} alsSeitentitel={index === 0 && ersterIstTitelText} />;
          case 'kennzahlen':
            return <Kennzahlen key={key} daten={block.value} />;
          case 'vorteile':
            return <Vorteile key={key} daten={block.value} />;
          case 'leistungen':
            return <LeistungenBlock key={key} daten={block.value} />;
          case 'leistungsbereiche':
            return <Leistungsbereiche key={key} daten={block.value} />;
          case 'referenzen':
            return <ReferenzenBlock key={key} daten={block.value} />;
          case 'jobs':
            return <JobsBlock key={key} daten={block.value} einstellungen={einstellungen} />;
          case 'ablauf':
            return <Ablauf key={key} daten={block.value} />;
          case 'team':
            return <Team key={key} daten={block.value} />;
          case 'logos':
            return <Logos key={key} daten={block.value} />;
          case 'kundenstimmen':
            return <Kundenstimmen key={key} daten={block.value} />;
          case 'faq':
            return <Faq key={key} daten={block.value} />;
          case 'kontaktaufruf':
            return <Kontaktaufruf key={key} daten={block.value} einstellungen={einstellungen} />;
          case 'kontaktformular':
            return <Kontaktformular key={key} daten={block.value} einstellungen={einstellungen} />;
          case 'logoslider':
            return <LogoSlider key={key} daten={block.value} />;
          case 'ctaBand':
            return <CtaBand key={key} daten={block.value} einstellungen={einstellungen} />;
          case 'teamAuszug':
            return <TeamAuszug key={key} daten={block.value} />;
          case 'datenblaetter':
            return <Datenblaetter key={key} daten={block.value} />;
          default:
            return nieErreicht(block);
        }
      })}
    </>
  );
}

function nieErreicht(block: never): null {
  console.warn('Unbekannter Block', block);
  return null;
}

/** Typ Hilfe für die Block-Komponenten */
export type BlockDaten<T extends Block['discriminant']> = Extract<Block, { discriminant: T }>['value'];
