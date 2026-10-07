# V4: Herkunftsmatrix und Architektur

Stand: 7. Oktober 2026. V4 führt die ausdrücklich ausgewählten Eigenschaften von V2 und V3 zusammen. Grundlage ist der Masterprompt "LWL-Techniker V4, das Beste aus V2 und V3".

## Quellen

| Quelle | Commit | Bemerkung |
| --- | --- | --- |
| V2 `infraoneit/lwl-techniker-v2` | `f2127e0e2caa68bb6e356393fdbeb6de9a36711f` (main) | Liveansicht https://lwl-techniker-v2.netlify.app entspricht inhaltlich diesem Stand (Hero, Abschnitte, vier neuste Referenzen, Logos, Footer). |
| V3 `infraoneit/lwl-techniker-v3` | `ecf933330e95611d09bb9b635cd9fe3ae53c9119` (main) | Bestätigter Ausgangscommit. Am 7. Oktober 2026 gab es keinen neueren Commit. |

Beide Quellen wurden nur gelesen. Lesekopien im V4-Arbeitsbereich unter `.reference/` (gitignored) dienten für Build und Browservergleich; `git status` beider Klone blieb leer, die HEAD-Hashes blieben unverändert. Die Original-PDFs sind in V2, V3 und V4 identisch (SHA-256, `tests/pdf-pruefsummen.json`).

## Matrix

| Bereich | Herkunft | Umsetzung in V4 |
| --- | --- | --- |
| Gesamtgestaltung | V2 + V3 | Nachtblau/Bernstein, Versalien-Titel mit Konturwort, Punktraster und Faserwellen aus V2; Abschnittsflächen, Kopf-/Fusszeile und Hierarchie aus V3. |
| Schriftfamilie | V2 | Exo 2 (Text) und Poppins (Titel) über next/font, selbst ausgeliefert (`src/app/schriften.ts`). Kein Lato. |
| Schriftgrössen | V3-Hierarchie | `titel-hero` 2.75 bis 7.25 rem (V2: bis 12 rem), `titel-1` bis 4.25 rem, `titel-2` bis 2.9 rem, Fliesstext 16/17 px. Siehe `globals.css`. |
| Buttons | V2 | `.knopf-primaer` (Bernstein-Verlauf, abgeschnittene Ecke), `.knopf-sekundaer` (Geisterknopf). Auf dem gelben Band wird der Primärknopf dunkel, Form und Typografie bleiben. |
| Hero | V2 ohne Bild | Startseite: Vollbild-Hero mit Slogan "Wir bringen Licht ans Ziel.", Einleitung, Primär- und Sekundärknopf. Kein Heroimage, keine Hero-Grafik, keine V3-Beschriftungszeilen. |
| Hintergrund | V2 | `Faserwellen.tsx` (Canvas, fest hinter der Seite, gelb bis orange in beiden Modi, Reduced Motion = Standbild, pointer-events: none). |
| Abschnittsflächen | V3-Idee | `.flaeche-ruhig`, `.flaeche-betont`, `.flaeche-tief`: vollbreit, halbtransparent, abgestuft; Hero, Arbeitsweise und Text-mit-Bild bleiben transparent. Keine weissen Blöcke im Darkmode. |
| Seitenstruktur | V3 | Startseite: Hero, Logoslider, Kennzahlen, alle acht Leistungen, Arbeitsweise, Referenzen, Ausrüstung, Datenblätter, Geschäftsleitung, gelbes Kontaktband. Über uns: Haltung, Werte, Geschäftsleitung, Ausrüstung, Kontaktband. Eigene Routen `/team`, `/referenzen/allgemein`. |
| Header und Menüs | V3 | `Kopfzeile.tsx`: haftende Leiste, Untermenüs per Klick auf den Text, zweispaltig ab fünf Einträgen, Produktkategorien automatisch, Escape mit Fokusrückgabe, Klick ausserhalb, mobiles `<dialog>`-Menü. Gestaltung mit V2-Tokens. |
| Footer | V3 | `Fusszeile.tsx`: Marke mit Leitsatz, Adresse, Linkgruppe, Rechtliches und Social-Media-Symbole (SVG inline). |
| Lightmode | V3-Lösungen | Logo-Varianten (`MarkenLogo`), Referenzlogos (`ReferenzLogo`: Silhouette dunkel, Originalfarben hell, keine weissen Kacheln), Karte abgedunkelt nur im Darkmode, Kontrastwerte geprüft (axe). |
| Logoslider | V3 | `LogoSlider.tsx` liest die zentrale Liste aus "Übersichtsseiten > Referenzen", feste Rahmen 36/44 x 14/16, Pause bei Hover und Fokus, Link zu `/referenzen/allgemein`. Dateien sind PNG (Silhouette) und WebP (Farbe), keine SVG. |
| Gelbe CTA-Banner | V3 | Block `ctaBand` auf Startseite, Über uns, Team, Produkte, Referenzen allgemein. Buttons V2. |
| Kennzahlen | V3-Werte und Zähler | Block `kennzahlen` mit `Zaehler.tsx` (versteht "1 Mio.+" und "1'000+"). Datenblattzahl automatisch aus eindeutigen PDFs (`automatisch:datenblaetter`). |
| Über uns und Team | V3 | Texte aus `editorial.json` und `home.json` übernommen, Team als eigene Sammlung `content/team` (Leitung: Lulzim Selimi, Arsel Thuma; Technik: David Thuma, Christian Colaci, Edwin Stefanov, Zelije Selimi). Lindi Selimi entfernt. |
| Referenzen | V2 vollständig | Alle neun V2-Referenzen mit Texten, Bildern, Galerien, Fakten und der V2-Darstellung (Übersicht, Kacheln, Detailseite). Zusätzlich die V3-Referenz "VAR-Support" (siehe offene Entscheidungen). |
| Produkte | V3-Basis, PDF-geführt | Variante B: Datenblattkatalog mit Suche, Kategorien, automatischer Vorschau und Bild aus dem PDF, Download, Anfrage. Keine Detailseiten, keine separat gepflegten technischen Daten. |
| Kontakt | V2 + Karte V3 | Block `kontaktformular` (Formular links, Kontakttafel rechts) plus `Karte.tsx` darunter, Adresse und Routenlink als Text, Datenschutzhinweis im Datenschutztext (V3). |
| Rechtliches | V3-Texte | Impressum, Datenschutz (mit Google-Maps-Abschnitt) und AGB-Entwurf aus V3, gepflegt als V2-Seiten mit Fliesstext. |
| CMS | V2-Modell | Keystatic mit Seitenbaukasten (Blöcke), erweitert um `logoslider`, `ctaBand`, `teamAuszug`, `datenblaetter`, Karte im Kontaktformular, Sammlung `team`, Datenblattfelder bei `produkte`. Schreibziel `infraoneit/lwl-techniker-v4`. |

## Bewusst nicht übernommen

- V2: schwebende Pill-Navigation, `scroll-behavior: smooth` auf `html` (Ursache des Hochscroll-Fehlers), weisse Logos im Lightmode, Lindi Selimi, Logo-Darstellungswahl "weiss/farbig" (der Farbmodus entscheidet jetzt).
- V3: Lato und Geist Mono, separate Hero-Grafik, Faser-Wasserzeichen in Abschnitten (würden mit der V2-Animation konkurrieren), Produktdetailseiten mit manuell gepflegten Eigenschaften, Routen `/downloads` und `/produkte/[slug]` (Weiterleitung auf `/produkte`), gelbes Kennzahlenband (als Option im Block wählbar, Standard ist das dunkle V2-Band).

## Architektur

Next.js 16.3.5 (App Router, Turbopack), React 19.3, TypeScript, Tailwind 4, Keystatic 0.6.9, Markdoc, mupdf (WASM) für die PDF-Verarbeitung, sharp für Bilder.

| Pfad | Aufgabe |
| --- | --- |
| `src/app/layout.tsx` | Wurzel: Schriften, Theme-Skript vor der Hydration. |
| `src/app/(website)/layout.tsx` | Kopfzeile (mit automatischen Produktkategorien), Faserwellen, RoutenScroll, Fusszeile, LocalBusiness-Schema. |
| `src/app/globals.css` | Design Tokens, Farbmodi, Abschnittsflächen, Typografie, Knöpfe, Logos, Karte, Fliesstext. |
| `src/components/layout/` | `Kopfzeile`, `Fusszeile`, `RoutenScroll`. |
| `src/components/bloecke/` | Blöcke des Seitenbaukastens (`BlockRenderer.tsx` ordnet zu). |
| `src/components/produkte/` | `Katalog` (Client, Suche und Filter), `DatenblattKachel`. |
| `src/components/ui/` | `Faserwellen`, `ReferenzLogo`, `MarkenLogo`, `Karte`, `Zaehler`, `Galerie`, `Seitenkopf`, `AbschnittKopf`, `ThemeSchalter`, `Einblenden`. |
| `src/lib/cms.ts` | Einzige Lesestelle für Inhalte; `holeDatenblaetter` verbindet Produkte mit dem generierten Index. |
| `src/generated/datenblaetter.json` | Vom Build erzeugter Datenblatt-Index (committet). |
| `scripts/erzeuge-datenblaetter.mjs` | PDF-Verarbeitung (Prüfsumme, Text, Vorschau, Bild). |
| `scripts/verify-write-target.mjs` | Schreibziel und Schutz von V2/V3. |
| `tests/` | Unit- und Inhaltstests (`npm test`), Browserprüfung (`npm run test:browser`). |

Routing: `/`, `/leistungen`, `/leistungen/[slug]`, `/produkte` (mit `?kategorie=`), `/referenzen`, `/referenzen/[slug]`, `/referenzen/allgemein`, `/ueber-uns`, `/team`, `/kontakt` (mit `?produkt=`, `?betreff=`), `/jobs`, `/jobs/[slug]`, `/impressum`, `/datenschutz`, `/agb` (alle freien Seiten über `/[slug]`), `/keystatic`.

## Routenwechsel (bekannter V2-Fehler)

Ursache in V2: `html { scroll-behavior: smooth }`. Next.js setzt die Position bei Navigation auf 0, der Browser animiert das. V4: `scroll-behavior: auto`, `RoutenScroll.tsx` setzt die Position bei Pfadwechsel sofort (`behavior: 'instant'`), ausser bei Sprungmarken (#anker). Browser-Zurück bleibt dem Browser überlassen. Filterwechsel im Katalog ändern nur Suchparameter (`router.replace(..., { scroll: false })`). Erneuter Klick auf die aktuelle Route scrollt in der Kopfzeile sofort nach oben. Geprüft in `tests/browser.mjs`.
