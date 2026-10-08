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
| Hintergrund | V2 | `Faserwellen.tsx` (Canvas, fest hinter der Seite, gelb bis orange in beiden Modi, pointer-events: none). Bei "Bewegung reduzieren" läuft die Animation langsamer und mit weniger Lichtpulsen weiter (siehe Abschnitt "Bewegung reduzieren"). |
| Abschnittsflächen | V3-Idee | `.flaeche-ruhig`, `.flaeche-betont`, `.flaeche-tief`: vollbreit, stark durchscheinend (dunkel 30, 42, 55 Prozent; hell 42, 55, 65 Prozent), abgestuft; Hero, Arbeitsweise und Text-mit-Bild bleiben transparent. Seit dem 7. Oktober 2026 so transparent, dass die Faserwellen wie in V2 (dort alle Abschnitte transparent) durch die ganze Seite sichtbar bleiben; Kontraste mit axe in beiden Modi geprüft. Keine weissen Blöcke im Darkmode. |
| Seitenstruktur | V3 | Startseite: Hero, Kennzahlen, vier Leistungsbereiche mit Bild (Block `leistungsbereiche`, Texte aus dem V3-Abschnitt "Glasfaser verbindet. Wir machen sie nutzbar.", Link "Alle Leistungen"), Arbeitsweise, Referenzen, Logoslider, Ausrüstung, Datenblätter, gelbes Kontaktband (Abschnitt Geschäftsleitung seit 8. Oktober 2026 nur noch auf /ueber-uns und /team). Alle acht Leistungen stehen auf `/leistungen`. Über uns: Haltung, Werte, Geschäftsleitung, Ausrüstung, Kontaktband. Eigene Route `/team`. Referenzen seit 8. Oktober 2026 auf zwei Seiten: `/referenzen` zeigt die Projektbeispiele als Kacheln, einen Verweis auf die Kundenlogos und das gelbe Kontaktband; `/kunden` (Menüpunkt "Unsere Kunden") zeigt alle Referenzlogos mit Namen, "Die Arbeit hinter den Logos" und das Kontaktband. Beide Seiten verweisen aufeinander, der Logoslider der Startseite führt nach `/kunden`, `/referenzen/allgemein` leitet dorthin weiter. Untermenü Referenzen: Projektbeispiele, Unsere Kunden. |
| Header und Menüs | V3 | `Kopfzeile.tsx`: haftende Leiste, Untermenüs per Klick auf den Text, zweispaltig ab fünf Einträgen, Produktkategorien automatisch, Escape mit Fokusrückgabe, Klick ausserhalb, mobiles `<dialog>`-Menü (seit 8. Oktober 2026 im V2-Aufbau: Hamburger-Symbol ohne Text, Menüpunkte als Links, Untermenü über "Alle anzeigen", Kontakt und Telefon als Knöpfe). Gestaltung mit V2-Tokens. Menütexte 0.85 bis 1.25 rem (lg bis 3xl) und Theme-Schalter 44 bis 52 px, passend zum vergrösserten Logo (7. Oktober 2026). Untermenü Produkte: "Alle Produkte" (wie V3), Produktentwicklung, Kategorien, zuletzt "Datenblätter und Downloads". |
| Footer | V3 | `Fusszeile.tsx`: Marke mit Leitsatz, Adresse, Linkgruppe, Rechtliches und Social-Media-Symbole (SVG inline). |
| Lightmode | V3-Lösungen | Logo-Varianten (`MarkenLogo`), Referenzlogos (`ReferenzLogo`: Silhouette dunkel, Originalfarben hell, keine weissen Kacheln), Karte abgedunkelt nur im Darkmode, Kontrastwerte geprüft (axe). |
| Logoslider | V3 | `LogoSlider.tsx` liest die zentrale Liste aus "Übersichtsseiten > Referenzen", feste Rahmen 36/44 x 14/16, Pause bei Hover und Fokus, Link zu `/kunden` (Unsere Kunden). Dateien sind PNG (Silhouette) und WebP (Farbe), keine SVG. |
| Gelbe CTA-Banner | V3 | Block `ctaBand` auf Startseite, Über uns, Team, Produkte, Referenzen allgemein. Buttons V2. |
| Kennzahlen | V3-Werte und Zähler | Block `kennzahlen` mit `Zaehler.tsx` (versteht "1 Mio.+" und "1'000+"). Datenblattzahl automatisch aus eindeutigen PDFs (`automatisch:datenblaetter`). |
| Über uns und Team | V3 | Texte aus `editorial.json` und `home.json` übernommen, Team als eigene Sammlung `content/team` (Leitung: Lulzim Selimi, Arsel Thuma; Technik: David Thuma, Christian Colaci, Edwin Stefanov, Zelije Selimi). Lindi Selimi entfernt. |
| Referenzen | V2 vollständig | Alle neun V2-Referenzen mit Texten, Bildern, Galerien, Fakten und der V2-Darstellung (Übersicht, Kacheln, Detailseite). Zusätzlich die V3-Referenz "VAR-Support" (siehe offene Entscheidungen). |
| Produkte | V3-Basis, PDF-geführt | Variante B: Datenblattkatalog mit Suche, Kategorien, automatischer Vorschau und Bild aus dem PDF, Download, Anfrage. Keine Detailseiten, keine separat gepflegten technischen Daten. |
| Kontakt | V2 + Karte V3 | Block `kontaktformular` (Formular links, Kontakttafel rechts) plus `Karte.tsx` darunter, Adresse und Routenlink als Text, Datenschutzhinweis im Datenschutztext (V3). |
| Rechtliches | V3-Texte | Impressum, Datenschutz (mit Google-Maps-Abschnitt) und AGB-Entwurf aus V3, gepflegt als V2-Seiten mit Fliesstext. |
| CMS | V2-Modell | Keystatic mit Seitenbaukasten (Blöcke), erweitert um `logoslider`, `ctaBand`, `teamAuszug`, `datenblaetter`, `leistungsbereiche` (Bereiche mit Titel, Text, Leistung als Verknüpfung, optional eigenes Bild), Karte im Kontaktformular, Sammlung `team`, Datenblattfelder bei `produkte`. Schreibziel `lwl-techniker/lwl-techniker`. |

## Bewusst nicht übernommen

- V2: schwebende Pill-Navigation, `scroll-behavior: smooth` auf `html` (Ursache des Hochscroll-Fehlers), weisse Logos im Lightmode, Lindi Selimi, Logo-Darstellungswahl "weiss/farbig" (der Farbmodus entscheidet jetzt).
- V3: Lato und Geist Mono, separate Hero-Grafik, Faser-Wasserzeichen in Abschnitten (würden mit der V2-Animation konkurrieren), Produktdetailseiten mit manuell gepflegten Eigenschaften, Route `/produkte/[slug]` (Weiterleitung auf `/produkte`; `/downloads` gibt es als Seite "Datenblätter und Downloads"), gelbes Kennzahlenband (als Option im Block wählbar, Standard ist das dunkle V2-Band).

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

Routing: `/`, `/leistungen`, `/leistungen/[slug]`, `/produkte` (mit `?kategorie=`), `/referenzen`, `/referenzen/[slug]`, `/kunden` (Referenzlogos, Weiterleitung von `/referenzen/allgemein`), `/ueber-uns`, `/team`, `/kontakt` (mit `?produkt=`, `?betreff=`), `/jobs`, `/jobs/[slug]`, `/impressum`, `/datenschutz`, `/agb` (alle freien Seiten über `/[slug]`), `/keystatic`.

## Routenwechsel (bekannter V2-Fehler)

Ursache in V2: `html { scroll-behavior: smooth }`. Next.js setzt die Position bei Navigation auf 0, der Browser animiert das. V4: `scroll-behavior: auto`, `RoutenScroll.tsx` setzt die Position bei Pfadwechsel sofort (`behavior: 'instant'`), ausser bei Sprungmarken (#anker). Browser-Zurück bleibt dem Browser überlassen. Filterwechsel im Katalog ändern nur Suchparameter (`router.replace(..., { scroll: false })`). Erneuter Klick auf die aktuelle Route scrollt in der Kopfzeile sofort nach oben. Geprüft in `tests/browser.mjs`.

## Bewegung reduzieren (sanfter statt aus)

Befund vom 7. Oktober 2026 auf dem PC der Kundschaft (Windows-VM über Remotedesktop, Chrome 154, 2560 px, keine GPU): Im laufenden Chrome meldete `matchMedia('(prefers-reduced-motion: reduce)')` den Wert `true`. Chrome leitet diesen Wert unter Windows aus der Systemeinstellung "Animationseffekte" (`SPI_GETCLIENTAREAANIMATION`) ab; Remotedesktop setzt diese Einstellung beim Verbinden, wenn im Remotedesktop-Client "Menü- und Fensteranimation" ausgeschaltet ist (Standard bei automatischer Verbindungsqualität). Chrome übernimmt den Wert beim Start und behält ihn, bis Windows eine Änderung meldet. Ein frisch gestartetes Chrome in derselben Sitzung meldete `false`, Playwright emuliert standardmässig `no-preference`; deshalb fiel das in den Cloud-Prüfungen nicht auf. Der V4-Code hatte bei "Bewegung reduzieren" alle Animationen abgeschaltet (Standbild, keine Einblendungen, Zähler ohne Zählen), darum sah die Kundschaft keine einzige Animation.

Entscheid der Kundschaft: Die Animationen gehören zum Markenauftritt, bei "Bewegung reduzieren" werden sie sanfter, nicht abgeschaltet.

| Element | Normal | Bewegung reduzieren |
| --- | --- | --- |
| Faserwellen (`Faserwellen.tsx`) | Aufziehen beim Laden, Lichtpulse in Schüben von 4 bis 8, Leuchtsaum atmet | Unverändert wie V2 (Entscheid Kundschaft, 7. Oktober 2026, zweite Rückmeldung: die Pulse sollen so schnell und regelmässig laufen wie in V2) |
| Startbereich (`globals.css`, `hero-zeile`, `hero-auf`, `hero-balken`) | Zeilen steigen auf, Balken wächst | Nur Überblendung (`auf-ruhig`), Balken wächst in 0.8 s |
| Einblenden beim Scrollen (`Einblenden.tsx`) | Überblendung mit Verschiebung, gestaffelt | Überblendung ohne Verschiebung, ohne Staffelung (`einblenden-ruhig`) |
| Zähler (`Zaehler.tsx`) | zählt 1.7 s hoch | zählt 0.9 s hoch |
| Logoslider | Dauer aus `--laufschrift-dauer` | doppelte Dauer (halbes Tempo), Pause bei Hover und Fokus bleibt |
| Faser-Wasserzeichen im gelben Band | Drift und Lichtimpulse | kein Drift, Impulse mit 12 s statt 6 s |
| Blinkpunkt der Überzeile | 2 s | 4 s |

Der frühere globale Block `* { animation-duration: 0.01ms !important }` ist entfernt. Geprüft in `tests/browser.mjs`, Abschnitt "Bewegung reduzieren" (Kontext mit `reducedMotion: 'reduce'`).

Tempo der Faserwellen: In V2 bewegen sich Pulse und Verdrillung pro gezeichnetem Bild. Auf dem PC der Kundschaft (rund 20 Bilder pro Sekunde ohne GPU) liefen sie damit dreimal langsamer als in der Cloud mit 60 Bildern pro Sekunde. V4 rechnet seit dem 7. Oktober 2026 zeitbasiert (Bezug 60 Bilder pro Sekunde, nach Pausen höchstens vier Bilder nachholen), die Geschwindigkeit ist damit auf jedem Rechner gleich, nur die Flüssigkeit unterscheidet sich.

Codevergleich mit V2 (7. Oktober 2026): `Faserwellen.tsx`, `Einblenden.tsx` und die Hero-Animationen in `globals.css` waren in V4 vor den Anpassungen byteidentisch mit V2 (`f2127e0`). Beide Versionen liefen auf demselben PC nebeneinander (V2 auf Port 3000, V4 auf 3104, `.qa/vergleich/v2-v4.mjs`): Canvas-Helligkeit und Gelbanteil sind gleich. Der sichtbare Unterschied waren die Abschnittsflächen, die in V4 die Faserwellen zu 62 bis 82 Prozent abdeckten (V2: alle Abschnitte transparent). Die Flächen sind jetzt deutlich durchscheinender (siehe Matrix).

## Suchmaschinen, KI-Suche und strukturierte Daten

| Element | Umsetzung |
| --- | --- |
| Metadaten (`src/lib/seo.ts`) | Titel mit Firmenname, Beschreibung, Canonical, Open Graph mit Bildgrösse, Twitter Card `summary_large_image`, Robots `max-image-preview:large`, `applicationName`, `authors`, `publisher`, Format-Erkennung. |
| Strukturierte Daten (`src/lib/strukturierte-daten.ts`) | Layout: `Organization` + `LocalBusiness` und `WebSite` als Graph mit `@id`. Unterseiten: `BreadcrumbList` (Seitenkopf), `Service` je Leistung, `ItemList` auf `/leistungen`, `/referenzen`, `/produkte` (Produkte mit Kategorie und PDF als `DigitalDocument`), `Article` je Referenz, `Person` im Team, `JobPosting` je Stelle. Nur sichtbare Angaben, keine Bewertungen, Preise oder Öffnungszeiten. |
| Sprachmodelle | `/llms.txt` (Übersicht mit Links) und `/llms-full.txt` (vollständige Texte der Leistungen, Referenzen und Stellen), beim Build aus dem CMS erzeugt (`src/lib/llms.ts`). |
| robots.txt | Produktiv: alle Suchmaschinen und KI-Crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot und weitere) dürfen die öffentlichen Seiten lesen; `/keystatic`, `/api/` und `/__forms.html` gesperrt. Vorschauen bleiben komplett gesperrt (`SITE_INDEXABLE`). |
| Favicon und Manifest | `icon.svg` aus V3 (Faserschwung auf Nachtblau), daraus erzeugt `icon.png` (32 px), `apple-icon.png` (180 px), `public/icons/icon-192.png` und `icon-512.png`; `manifest.webmanifest` über `src/app/manifest.ts`. |
| Sitemap | Alle öffentlichen Routen inklusive `/downloads`, Leistungen, Referenzen, Stellen und freigegebene Seiten; 28 Adressen, alle mit HTTP 200 geprüft. |

Bildrate auf dem PC der Kundschaft: Ohne GPU (SwiftShader oder Microsoft Basic Render Driver) erreicht Chrome bei 2560 px rund 20 bis 25 Bilder pro Sekunde, auch ohne Canvas, Blur und Punktraster (Messung `.qa/engpass.mjs`, siehe `docs/15`). Eine kleinere Zeichenauflösung des Canvas brachte keinen messbaren Gewinn und wurde darum nicht eingebaut. Wer am Remotedesktop volle Animationen will, schaltet im Remotedesktop-Client unter "Leistung" die Option "Menü- und Fensteranimation" ein und startet Chrome danach neu.
