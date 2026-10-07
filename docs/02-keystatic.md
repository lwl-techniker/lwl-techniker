# 2. Keystatic

Keystatic ist das CMS. Es speichert Inhalte als Dateien im Repository (`content/`, Bilder in `public/bilder/`). Es gibt keine Datenbank.

## Wie es funktioniert

```
Kundschaft speichert in /keystatic (online)
  → Keystatic erstellt einen Commit im GitHub-Repository
    → Netlify erkennt den Commit und baut die Website neu (1 bis 3 Minuten)
      → Neue Inhalte sind online
```

Lokal (`npm run dev`) schreibt Keystatic direkt in die Dateien. Es entsteht kein Commit, das macht die Entwicklerin oder der Entwickler selbst.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `src/site.config.ts` | Repository, Domain und **Speichermodus** |
| `src/keystatic.config.ts` | Alle Sammlungen und Einzelseiten (Schema) |
| `src/keystatic/felder.ts` | Feldvorlagen mit Qualitätsregeln: `text`, `langtext`, `link`, `bild`, `alttext`, `seo`, `fliesstext` |
| `src/keystatic/bloecke.ts` | Seitenbaukasten für Startseite und Seiten |
| `src/lib/cms.ts` | **Einzige Stelle**, an der Inhalte gelesen werden |
| `src/lib/startseite-auswahl.ts` | Regel für Referenzen und Stellen auf der Startseite |
| `src/app/keystatic/` | Admin-Oberfläche |
| `src/app/api/keystatic/[...params]/route.ts` | API, wird von der Oberfläche aufgerufen |

## Speichermodus (lokal und GitHub)

Eingestellt in `src/site.config.ts`:

```ts
export const KEYSTATIC_MODUS: 'automatisch' | 'lokal' | 'github' = 'automatisch';
```

| Modus | Lokal (`npm run dev`) | Online (Netlify) | Wann verwenden |
| --- | --- | --- | --- |
| `automatisch` | speichert in Dateien | speichert über GitHub | **immer**, ausser in den zwei Fällen unten |
| `github` | speichert über GitHub | speichert über GitHub | nur um die GitHub-App einzurichten oder den Login lokal zu testen |
| `lokal` | speichert in Dateien | **Build bricht ab** | nur in Ausnahmefällen, nie committen |

Die Konfigurationsprüfung verhindert, dass `lokal` online landet, und warnt bei `github`.

## Inhaltsmodell

**Einzelseiten (Singletons)**

| Name | Datei | Inhalt |
| --- | --- | --- |
| Firma und Kontakt | `content/einstellungen/firma.json` | Name, Adresse, Telefon, Öffnungszeiten, Logos, Standard-SEO |
| Navigation | `content/einstellungen/navigation.json` | Hauptmenü, Knopf, Fusszeile, rechtliche Links |
| Übersichtsseiten | `content/einstellungen/uebersichten.json` | Titel und Einleitung für /leistungen, /referenzen, /jobs |
| Startseite | `content/startseite/startseite.json` | SEO und Blöcke |

**Sammlungen (Collections)**

| Name | Ordner | Format | Adresse |
| --- | --- | --- | --- |
| Seiten | `content/seiten/` | JSON mit Blöcken | `/<slug>` |
| Leistungen | `content/leistungen/` | `.mdoc` mit Fliesstext | `/leistungen/<slug>` |
| Referenzen | `content/referenzen/` | `.mdoc` mit Fliesstext | `/referenzen/<slug>` |
| Stellen | `content/jobs/` | `.mdoc` mit Fliesstext | `/jobs/<slug>` |

Seiten mit den Adressen `leistungen`, `referenzen`, `jobs`, `keystatic`, `api` oder `bilder` sind verboten, weil diese Routen fest vergeben sind. Die Konfigurationsprüfung meldet das.

## Blöcke für Seiten

Startseite und Seiten werden aus diesen Blöcken zusammengesetzt (Schema in `src/keystatic/bloecke.ts`, Darstellung in `src/components/bloecke/`):

| Block | Zweck |
| --- | --- |
| Startbereich (Hero) | Titel, Einleitung, Bild, zwei Knöpfe. Darstellung `vollbild` (Text auf Bild) oder `geteilt` (Text links, Bild rechts) |
| Text mit Bild | Abschnitt mit Bild links oder rechts |
| Fliesstext | Freier Text mit Zwischentiteln, Listen, Tabellen, Bildern |
| Kennzahlen | 2 bis 4 belegbare Zahlen |
| Vorteile / Arbeitsweise | 3 bis 6 nummerierte Punkte auf dunklem Grund |
| Leistungen (automatisch alle) | Kacheln aller Leistungen |
| Referenzen (automatisch die neusten) | siehe Automatik unten |
| Offene Stellen (automatisch) | siehe Automatik unten |
| Ablauf in Schritten | nummerierte Schritte mit Verbindungslinie |
| Team | Personen mit Foto, Funktion, Kontakt |
| Partner und Referenzen (Logos) | Logoleiste als festes Raster oder als scrollendes Band. Beim Band wählt die Redaktion im Feld "Darstellung", ob die Logos als weisse Silhouette oder in Originalfarben auf weissen Kacheln laufen |
| Kundenstimmen | Zitate mit Name und Funktion |
| Häufige Fragen | aufklappbare Fragen |
| Kontaktaufruf | farbiges Band mit Knopf und Telefon |
| Kontaktformular | Netlify-Formular mit Kontaktdaten |

Jede Seite erhält automatisch genau einen H1: Ist der erste Block ein Startbereich oder ein Fliesstext mit Titel, liefert er den H1. Sonst zeigen Unterseiten einen Seitenkopf mit Titel und Brotkrumen, die Startseite einen unsichtbaren H1 aus dem Standard-SEO-Titel. Im CMS heissen Blöcke "Abschnitte".

## Automatik auf der Startseite (Referenzen und Stellen)

Die Blöcke **Referenzen (automatisch die neusten)** und **Offene Stellen (automatisch)** holen ihre Einträge selbst. Sie funktionieren auf jeder Seite, nicht nur auf der Startseite. Die Regel steht in `src/lib/startseite-auswahl.ts` und ist mit Tests abgesichert (`npm test`):

1. Einträge mit Häkchen **Auf Startseite zeigen** kommen zuerst, neuste zuerst.
2. Freie Plätze werden mit den neusten übrigen Einträgen aufgefüllt.
3. Sind mehr markiert als Plätze vorhanden, gewinnen die neusten markierten.

Beispiel mit 4 Plätzen:

| Markiert | Ergebnis |
| --- | --- |
| keine | die 4 neusten |
| 1 ältere | die markierte, dann die 3 neusten |
| genau 4 | nur diese 4 |
| 6 | die 4 neusten markierten |

Weitere Regeln:

- Referenzen mit **Veröffentlicht** aus erscheinen nirgends.
- Referenzen mit **Abschlussdatum anzeigen** aus zeigen kein Datum (laufende Projekte, Projektgruppen). Das Datum bestimmt dann nur die Reihenfolge.
- Stellen mit **Stelle ist offen** aus oder abgelaufenem **gültig bis** erscheinen nirgends, auch die Detailseite verschwindet.
- Gültigkeit wird beim Build geprüft. Damit abgelaufene Stellen ohne neuen Commit verschwinden, in Netlify einen täglichen Build einrichten ([04-netlify.md](04-netlify.md), Schritt 5).

## Bilder in Keystatic

Keystatic benennt hochgeladene Bilder **selbst** nach dem Feldnamen und legt sie in einen Unterordner:

| Wo | Ablage |
| --- | --- |
| Sammlung | `public/bilder/referenzen/<slug>/titelbild.webp` |
| Liste in Sammlung | `public/bilder/referenzen/<slug>/galerie/0/bild.webp` |
| Block auf Seite | `public/bilder/seiten/<slug>/bloecke/2/value/bild.webp` |
| Block auf Startseite | `public/bilder/startseite/bloecke/0/value/bild.webp` |
| Einzelseite | `public/bilder/firma/logo.svg` |

**Bilder im Fliesstext** werden beim Hochladen umbenannt, z. B. `IMG_1234.JPG` zu `text-img-1234-m3k9x2.jpg`. So bleiben Namen sauber und nichts wird überschrieben. Der Alt-Text ist dort ebenfalls Pflicht.

Folgen daraus:

- **Bildfelder immer klein und ohne Bindestrich benennen** (`titelbild`, `ogbild`, `logohell`). Der Feldname wird zum Dateinamen.
- **Bilder nie von Hand an einen anderen Ort legen und im JSON verlinken.** Beim nächsten Speichern verschiebt Keystatic sie an den obigen Ort. Wer Bilder von Hand einfügt, verwendet exakt diese Pfade.
- Werden Blöcke umsortiert, verschiebt Keystatic die Bilder beim Speichern mit. Das ist normal.
- Für SEO zählt der **Alternativtext**, nicht der Dateiname. Deshalb ist der Alt-Text bei allen Inhaltsbildern Pflicht.

## Dateiformat

Keystatic schreibt beim Speichern ein festes Format. Wer Dateien von Hand anlegt, hält sich daran, sonst entstehen beim ersten Speichern unnötige Änderungen:

- JSON mit 2 Leerzeichen Einzug, Zeilenumbruch am Dateiende
- Leere Textfelder werden **weggelassen**, leere Objekte als `{}` geschrieben
- `.mdoc`: YAML-Kopf zwischen `---`, leeres SEO als `seo: {}`
- Zeilenenden LF (`.gitattributes` erzwingt das)

Am einfachsten: Eintrag im CMS anlegen und die entstandene Datei als Muster nehmen.

## Neuen Block anlegen

Als Muster dient der eingebaute Block **Ablauf**. So wurde er angelegt (vereinfacht, vollständig in `src/components/bloecke/Ablauf.tsx`):

**1. Schema** in `src/keystatic/bloecke.ts` innerhalb von `fields.blocks({ ... })`:

```ts
ablauf: {
  label: 'Ablauf in Schritten',
  itemLabel: (p) => p.fields.titel.value || 'Ablauf',
  schema: fields.object({
    ueberzeile: ueberzeile(),
    titel: text('Titel', { pflicht: true, max: 90 }),
    schritte: fields.array(
      fields.object({
        titel: text('Titel', { pflicht: true, max: 60 }),
        text: langtext('Text', { pflicht: true, max: 240 }),
      }),
      { label: 'Schritte (2 bis 6)', itemLabel: (p) => p.fields.titel.value || 'Schritt', validation: { length: { min: 2, max: 6 } } }
    ),
  }),
},
```

**2. Komponente** `src/components/bloecke/Ablauf.tsx`:

```tsx
import { AbschnittKopf } from '@/components/ui/AbschnittKopf';
import { sauberText } from '@/lib/text';
import type { BlockDaten } from './BlockRenderer';

export function Ablauf({ daten: d }: { daten: BlockDaten<'ablauf'> }) {
  return (
    <section className="abschnitt">
      <div className="container-seite">
        <AbschnittKopf ueberzeile={d.ueberzeile} titel={d.titel} />
        <ol className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {d.schritte.map((s, i) => (
            <li key={i} data-einblenden style={{ '--einblenden-index': i } as React.CSSProperties}>
              <h3 className="titel-3">{sauberText(s.titel)}</h3>
              <p className="mt-2 text-text-leise">{sauberText(s.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

**3. Eintragen** in `src/components/bloecke/BlockRenderer.tsx`:

```tsx
case 'ablauf':
  return <Ablauf key={key} daten={block.value} />;
```

TypeScript meldet einen Fehler, solange Schritt 3 fehlt. So kann kein Block vergessen werden.

Regeln für Block-Komponenten: `container-seite` und eine Abschnittsklasse verwenden, Titel über `AbschnittKopf` (H2), Texte durch `sauberText()`, Bilder mit `next/image` und `sizes`, Einblenden mit `data-einblenden`.
## Neue Sammlung anlegen

1. In `src/keystatic.config.ts` unter `collections` ergänzen (Titel mit `titelMitAdresse()`) und in `ui.navigation` eintragen.
2. Lesefunktion in `src/lib/cms.ts` ergänzen (`holeXyz`, mit `cache()`).
3. Seiten unter `src/app/(website)/xyz/page.tsx` und `[slug]/page.tsx` mit `generateStaticParams` und `dynamicParams = false`.
4. In `src/app/sitemap.ts` ergänzen.
5. Die neue Adresse `xyz` bei den gesperrten Adressen der Seiten (`src/keystatic.config.ts`) und in `RESERVIERT` in `scripts/pruefe-konfiguration.mjs` ergänzen.

## Adressen (Slugs)

Alle Sammlungen verwenden `titelMitAdresse()` aus `felder.ts`:

- Die Adresse wird aus dem Titel erzeugt, Umlaute werden ersetzt: "Über uns" wird `ueber-uns`.
- Erlaubt sind nur Kleinbuchstaben, Zahlen und einzelne Bindestriche.
- Bei den Seiten sind die Adressen `leistungen`, `referenzen`, `jobs`, `keystatic`, `api` und `bilder` gesperrt. Diese Liste muss mit `RESERVIERT` in `scripts/pruefe-konfiguration.mjs` übereinstimmen.

## Arbeiten, wenn die Kundschaft schon online bearbeitet

Jede Speicherung im CMS ist ein Commit auf `main`. Deshalb:

1. **Vor jeder lokalen Arbeit** `git pull`, sonst entstehen Konflikte mit Inhaltsänderungen.
2. Grössere Umbauten in einem eigenen Branch. Netlify erstellt dafür eine Deploy-Vorschau.
3. Jede Speicherung löst einen Build aus und verbraucht Netlify-Build-Minuten. Bei sehr aktiven Redaktionen im Netlify-Plan berücksichtigen.

## Regeln für Felder

- Alle Textfelder über `text()` oder `langtext()` aus `felder.ts`. Nie `fields.text` direkt, sonst fehlt die Sperre gegen scharfes S und Gedankenstriche. Ausnahmen nur für E-Mail-Adressen und URLs.
- Beschriftungen für Laien: "Untermenü" statt "Dropdown", "Aktualisierung der Website" statt "Build".
- Jedes Feld mit verständlichem deutschem Label und, wo nötig, einer Beschreibung mit Beispiel.
- Längen begrenzen (`max`), damit das Layout nicht bricht.
- Datumsfelder für alles, was sortiert wird.
- Slugs nach dem Veröffentlichen nicht mehr ändern (steht auch im CMS).

## Häufige Fehler

| Meldung | Ursache | Lösung |
| --- | --- | --- |
| `Missing required config in Keystatic API setup` | Umgebungsvariablen fehlen | [03-github-verbinden.md](03-github-verbinden.md) |
| `/keystatic` online zeigt Text "nicht vollständig eingerichtet" | wie oben | Variablen in Netlify setzen, neu deployen |
| `redirect_uri is not associated with this application` | Callback-URL fehlt in der GitHub-App | Callback-URL ergänzen ([03-github-verbinden.md](03-github-verbinden.md)) |
| Login klappt, aber "Repo not found" | GitHub-App nicht auf dem Repository installiert | App auf das Repository installieren |
| Änderungen im CMS erscheinen nicht online | Netlify-Build fehlgeschlagen | Netlify-Deploy-Log lesen, meist Konfigurationsprüfung |
| Bilder fehlen nur online | Gross- und Kleinschreibung im Pfad | `npm run pruefen:konfiguration` |
