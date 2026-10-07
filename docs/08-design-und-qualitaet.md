# 8. Design und Qualität

Mindeststandard ist schaltkraft.ch. Keine neue Website darf darunter liegen.

## Seitenbreite

Generierte Websites sind meist höchstens 1280 px breit (`max-w-7xl`). Das wirkt auf grossen Bildschirmen schmal und austauschbar. Wir arbeiten **deutlich breiter**, genau wie schaltkraft.ch:

```css
.container-seite { max-width: 2400px; padding-inline: 24px / 32px (ab 640 px) / 48px (ab 1024 px); }
```

- Jeder Abschnitt verwendet `container-seite`. Keine eigenen `max-w-7xl`, `container` oder `mx-auto px-4`.
- Lange Fliesstexte werden mit `lesebreite` (72 Zeichen) begrenzt, damit sie lesbar bleiben.
- Raster nutzen die Breite: Kacheln 2 Spalten ab 640 px, 3 ab 1024 px, 4 ab 1536 px. `rasterFuerKacheln()` verhindert leere Spalten.
- Kopfzeile, Titel und Einleitungen wachsen ab 2200 px weiter (eigener Breakpoint `3xl`), damit die Seite auf grossen Bildschirmen nicht leer wirkt. Eigene Breakpoints immer in rem unter `@theme` anlegen, nie `min-[2200px]:` verwenden: Tailwind sortiert Pixelwerte falsch ein.

## Abstände

Vertikaler Abstand von Abschnitten nur mit diesen Klassen:

| Klasse | Mobil | Desktop | Verwendung |
| --- | --- | --- | --- |
| `abschnitt` | 64 px | 96 px | Standard für alle Blöcke |
| `abschnitt-kompakt` | 48 px | 64 px | schmale Bänder, z. B. Logoleiste |
| `abschnitt-gross` | 80 px | 128 px | Seiten ohne Startbereich (Impressum), Fehlerseite |

Eigene Abstände haben nur Elemente, die keine Abschnitte sind: Startbereich (Hero), Seitenkopf mit Brotkrumen, Kennzahlen (Abstand pro Zelle).

## Typografie

| Klasse | Verwendung |
| --- | --- |
| `titel-1` | H1, einmal pro Seite |
| `titel-2` | Abschnittstitel H2 |
| `titel-3` | Kacheln, Unterabschnitte |
| `einleitung` | Einleitungstexte |
| `ueberzeile` | kleine Zeile über Titeln |

- Genau ein H1 pro Seite. Der `BlockRenderer` stellt das sicher (siehe [02-keystatic.md](02-keystatic.md)).
- Überschriften ohne Sprünge: H1, dann H2, dann H3. Kacheln auf Übersichtsseiten sind deshalb H2 (`titelEbene="h2"`).
- Höchstens zwei Schriftfamilien.

### Schriften ändern

In `src/app/schriften.ts`:

```ts
import { Source_Sans_3, Archivo } from 'next/font/google';

export const schriftText = Source_Sans_3({ subsets: ['latin'], variable: '--font-text', display: 'swap' });
export const schriftUeberschrift = Archivo({ subsets: ['latin'], variable: '--font-ueberschrift', weight: ['600', '700', '800'], display: 'swap' });
```

- Variablennamen `--font-text` und `--font-ueberschrift` beibehalten.
- Die Schriften werden beim Build heruntergeladen und von der Website selbst ausgeliefert. Es gibt keine Verbindung zu Google.
- Eigene Schriftdateien der Firma: `next/font/local` verwenden, Lizenz für Webnutzung prüfen.

## Farben

Nur in `src/app/globals.css` unter `@theme`. Pro Projekt anpassen:

- `--color-marke`, `--color-marke-dunkel`, `--color-marke-hell`
- bei Bedarf die dunklen Flächen (`--color-flaeche-dunkel`) und `themeColor` in `src/app/layout.tsx`
- Kontrast mindestens 4.5 zu 1, prüfen mit https://webaim.org/resources/contrastchecker/
  - weisse Schrift auf `--color-marke` (Knöpfe, Kontaktaufruf)
  - `--color-marke` auf Weiss **und** auf `--color-flaeche` (Überzeilen, Kategorien). Die Beispielfarbe liegt mit 4.55 zu 1 knapp an der Grenze, dunklere Farben sind sicherer
- Keine Farbwerte direkt in Komponenten (`#b4531f`), immer die Tokens (`text-marke`)

## Formen und Bewegung

- Ecken bewusst knapp (`--radius-karte` 6 px, `--radius-knopf` 4 px). Stark abgerundete Knöpfe und Karten wirken wie Baukastenseiten.
- Einblenden beim Scrollen: Attribut `data-einblenden` an Karten und Abschnittsköpfen. Geschwister im selben Raster werden automatisch gestaffelt (90 ms pro Spalte), eigene Staffelung mit `style={{ '--einblenden-index': i }}`. Was beim Laden schon sichtbar ist, bleibt ruhig stehen. Umgesetzt als CSS-Animation, damit Hover-Übergänge (`transition-shadow` usw.) sie nicht überschreiben. Kein framer-motion nötig.
- Hover-Effekte (Bildzoom, Schatten, Pfeil) nur mit `hover:`. Tailwind 4 wendet sie nur auf Geräten mit Maus an, auf Touch-Geräten bleiben sie nicht hängen.
- Mobiles Menü blendet in 300 ms ein und aus. Geschlossen ist es `inert`, also nicht per Tastatur erreichbar.
- Bei "Bewegung reduzieren" im Betriebssystem bleibt alles ohne Animation sichtbar.

## Komponenten

- Knöpfe: `knopf-primaer`, `knopf-sekundaer`, `knopf-hell`. Mindesthöhe 48 px (Touch).
- Formularfelder: `formular-label`, `formular-feld`.
- Abschnittsköpfe über `AbschnittKopf`, Seitenköpfe über `Seitenkopf` (mit Brotkrumen).
- Startbereich in zwei Varianten: `vollbild` und `geteilt`.
- Kopfzeile: Mega-Menü ab drei Unterpunkten mit Kurzbeschreibung, Telefonnummer ab 1280 px.

## Qualitätsstandard (jede Website erfüllt alle Punkte)

**Technik**

- `npm run pruefen` und `npm run build` ohne Fehler
- Lighthouse mindestens 90 in Performance, 100 in Barrierefreiheit, Best Practices und SEO. Immer gegen den Produktionsbuild messen (`npm run build`, dann `npm start`, oder die Netlify-Deploy-Vorschau), nie gegen `npm run dev`. In Chrome: DevTools, Lighthouse, Gerät Mobil
- Keine Fehler in der Browser-Konsole
- Alle Seiten statisch vorgerendert (im Build-Log mit Kreis oder Punkt markiert)

**Darstellung**

- Geprüft bei 320 px, 375 px, 768 px, 1024 px, 1280 px, 1920 px und 2560 px Breite
- Kein horizontales Scrollen, auch nicht mit langen Wörtern in Titeln (Worttrennung ist aktiv)
- Tippflächen auf dem Handy mindestens 24 x 24 px (Links in Listen mit `inline-block py-1`), Knöpfe 48 px hoch
- Bilder scharf, nicht verzerrt, mit passendem Ausschnitt
- Favicon ersetzt

**Barrierefreiheit**

- Bedienbar nur mit Tastatur (Tab, Enter, Escape), Fokus überall sichtbar
- Link "Zum Inhalt springen" vorhanden
- Mobiles Menü: Escape schliesst, Fokus springt ins Menü und zurück
- Alle Inhaltsbilder mit Alt-Text
- Animationen respektieren "Bewegung reduzieren"

**SEO**

- Jede Seite mit eigenem Titel und eigener Beschreibung
- Canonical zeigt auf die eigene Adresse
- Sitemap enthält alle öffentlichen Seiten, Impressum und Datenschutz sind ausgeschlossen
- Strukturierte Daten: LocalBusiness (jede Seite), JobPosting (Stellen), BreadcrumbList (Unterseiten). Keine FAQPage, Google zeigt sie für Firmen nicht mehr an
- Prüfen mit https://search.google.com/test/rich-results

## Was wir gegenüber früheren Projekten verbessert haben

| Früher | Vorlage |
| --- | --- |
| Formulare senden an `/.netlify/forms` | senden an `/__forms.html` wie von Netlify dokumentiert |
| Feldnamen in `__forms.html` von Hand gepflegt | automatisch aus einer Definition erzeugt |
| Startbild ohne `next/image`, Fotos bis 4 MB | `next/image` überall, Bildprüfung |
| Stelleninserat für Google fest im Code | vollständig aus CMS-Daten |
| Canonical aller Seiten zeigt auf die Startseite | jede Seite eigenes Canonical |
| Keystatic-Modus fest eingetragen | ein Schalter mit Schutz gegen Fehlkonfiguration |
| Build bricht ohne `.env` ab | Keystatic-API wird erst bei Bedarf erzeugt |
| Referenzen auf der Startseite fest programmiert | automatisch, mit Markierung zum Übersteuern |
| `params` in Detailseiten nicht abgewartet | Next.js-16-konform |
| Sieben verschiedene Abschnittsabstände | drei Klassen |
| Dropdown nur mit Maus bedienbar | Tastatur, Fokus und Escape |
| Debug-Logs im Code und im Repository | keine |
