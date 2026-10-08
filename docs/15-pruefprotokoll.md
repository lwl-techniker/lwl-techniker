# V4: Prüfprotokoll

Stand: 7. Oktober 2026. Durchläufe 1 bis 5 im Arbeitsbereich Linux (Node 22.22, Chromium 1194 über Playwright), Durchläufe 6 bis 9 auf dem Windows-PC der Kundschaft (Windows 11, Node 24.15, Chrome 154 über `PLAYWRIGHT_CHROMIUM`). Alle Browserprüfungen liefen gegen den lokalen Produktionsbuild (`npm run build && npm start`, Port 3104). Keine fiktiven Prüfungen; die Skripte liegen im Repository (`tests/browser.mjs`) bzw. in `.qa/` (lokal, nicht versioniert).

## Durchläufe

| Durchlauf | Befund | Beleg | Änderung | Erneute Prüfung |
| --- | --- | --- | --- | --- |
| 1 | Nach dem ersten Build blieben Abschnitte unter dem Hero in Vollseiten-Screenshots leer. | `.qa/v4/desktop-dunkel-home.png` (Lauf 1) | Keine Codeänderung nötig: Ursache war der Screenshot ohne Scrollen (Einblend-Animation nicht ausgelöst). Screenshot-Skript scrollt jetzt zuerst durch die Seite. | Alle Abschnitte sichtbar. |
| 1 | Kennzahl "Datenblätter" zeigte 41 statt 40. | Screenshot Startseite | `Kennzahlen.tsx`: Produkte ohne PDF (Prüfsumme null) werden nicht gezählt. | 40. |
| 1 | Logo in der Kopfzeile zu klein. | Screenshot 1440 px | Logo 44/48/68 px hoch, Kopfzeile 72/92 px. | Proportionen wie V3. |
| 2 | Browsertest: Klick auf Menüpunkt nach Scrollen schlug fehl, Teamfoto fing den Klick ab. Die haftende Kopfzeile haftete nicht. | Playwright-Fehlermeldung "intercepts pointer events" | Ursache `body { overflow-x: hidden }` aus V2 (setzt `position: sticky` ausser Kraft). Ersetzt durch `html { overflow-x: clip }`. | Kopfzeile haftet, Klicks treffen. |
| 3 | axe: Kontrast der Bernstein-Beschriftungen im hellen Modus 4.1 bis 4.2 : 1. | axe-Ausgabe (`.qa/axe-detail.mjs`) | Helle Markenfarbe von #996300 auf #865800 (V3-Wert), Verlauf angepasst. | 5.2 : 1, keine Verstösse. |
| 3 | axe meldete Kontrast im Hero während der Einblendanimation. | axe-Ausgabe | Test wartet 2.2 s auf die Hero-Animation (kein Darstellungsfehler). | Keine Verstösse. |
| 4 | Zu kleine Bedienelemente: Galerie-Punkte 10 x 10 px, Abschnittslinks 20 px hoch. | `.qa/viewports.mjs` | Galerie-Punkte mit 44-px-Klickfläche, Abschnittslinks und Routenlink mit Mindesthöhe 40/44 px. | Nur noch der unsichtbare Skip-Link (1 x 1 px, nur bei Fokus sichtbar) und Inline-Textlinks gemeldet. |
| 4 | Startseite zeigte nur vier der acht Leistungen; V3-Struktur sieht die Leistungsnavigation mit allen acht vor. | Vergleich mit V3-Screenshot | Block "Leistungen" um Option "Alle Leistungen" ergänzt, Startseite nutzt sie. | Acht Zeilen. |
| 5 | Gestalterischer Durchgang (zehn schwächste Stellen, siehe unten). | Screenshots | siehe unten | siehe unten |
| 6 | Auf dem PC der Kundschaft (Windows-VM über Remotedesktop, Chrome 154, 2560 px, Dark Mode) lief keine Animation: weder Faserwellen noch Einblendungen, Hero, Zähler, Logoslider oder Wasserzeichen. | Messung im laufenden Chrome über die Chrome-Erweiterung: `prefers-reduced-motion: reduce` = true, `js-einblenden` fehlte, Hero-Animation `none`, Canvas ohne Schleife. Frisches Chrome ohne Emulation: false. Windows-API in der Sitzung: Animationen eingeschaltet, Remotesitzung = 1. Keine Konsolenfehler, IntersectionObserver vorhanden, Canvas 2560 x 1271, GPU "Microsoft Basic Render Driver". | Ursache: Chrome hatte beim Start in der Remotedesktop-Sitzung "Animationen aus" übernommen und meldet seither "Bewegung reduzieren"; V4 schaltete dann alles ab. Lösung: sanfter statt aus (`docs/12`, Abschnitt "Bewegung reduzieren"), globaler `0.01ms`-Block entfernt. | Browsertest Abschnitt 8 mit `reducedMotion: 'reduce'`: Canvas bewegt sich, Hero sichtbar, Einblenden aktiv, Zähler erreichen Endwerte, Logoslider läuft mit doppelter Dauer. Im Chrome der Kundschaft nach dem Build: `js-einblenden` gesetzt, Hero-Animation `auf-ruhig`, Logoslider 220 s. |
| 6 | Bildrate der Faserwellen ohne GPU: 21 Bilder pro Sekunde bei 2560 px (DPR 1), 12.5 bei DPR 1.5, 25.5 bei 1920 px (`.qa/fps.mjs`, Chrome headless mit SwiftShader). | Messskripte `.qa/fps.mjs`, `.qa/engpass.mjs`, `.qa/bench.mjs` | Versuch mit adaptiver Zeichenauflösung (1, 0.75, 0.5): keine Verbesserung (20.5 statt 21). Engpass ist der Software-Compositor: ohne Canvas, Blur und Punktraster 25 bis 30 Bilder pro Sekunde; die Canvas-Befehle selbst kosten unter 3 ms pro Bild. Adaptive Auflösung wieder entfernt. | Keine Codeänderung an der Bildrate; Hinweis für Remotedesktop in `docs/12` und `docs/16`. |
| 7 | Untermenü Produkte mit doppeltem Eintrag ("Alle Datenblätter" auf `/produkte` und "Datenblätter und Downloads" auf `/downloads`). | `content/einstellungen/navigation.json` | Erster Eintrag heisst wie in V3 "Alle Produkte" (`/produkte`), "Alle Datenblätter" entfernt, "Datenblätter und Downloads" bleibt der letzte Eintrag nach den Kategorien. | Desktop- und Mobilmenü: 17 Einträge, keine Duplikate (`.qa/sicht/screenshots.mjs`), Fusszeile unverändert. |
| 8 | Menütexte (0.8 rem) und Theme-Schalter (36 px) zu klein neben dem vergrösserten Logo. | Screenshot Kopfzeile 2560 px | `Kopfzeile.tsx`: Menüpunkte 0.85 rem (lg), 1 rem (xl), 1.1 rem (2xl), 1.25 rem (3xl), Höhe 48 px; Kontaktknopf gleich gross; Untermenüeinträge 1 rem, Beschreibungen 0.875 rem, Panels 24/48 rem. `ThemeSchalter.tsx`: 44/48/52 px, Symbol 24/28 px. Mobiler Menüknopf 48 px. | Browsertest Abschnitt 9: Kopfzeile 81 px (375) und 113 px (1024 bis 2560), alle Menüpunkte einzeilig, kein Überlauf. Screenshots `.qa/sicht/kopfzeile-*.png`. |
| 10 | Kundschaft: Hintergrundanimation und weitere Animationen entsprechen nicht V2. | Codevergleich (byteidentisch) und Rendervergleich V2 Port 3000 gegen V4 Port 3104 im selben Chrome (`.qa/vergleich/`): Canvas gleich, aber Abschnittsflächen decken die Faserwellen in V4 zu 62 bis 82 Prozent ab, in V2 sind alle Abschnitte transparent. | Flächen auf 30, 42, 55 Prozent (dunkel) und 42, 55, 65 Prozent (hell) gesenkt. "Bewegung reduzieren" bei den Faserwellen auf V2-Tempo mit Aufziehen, nur halb so viele Pulse. | Screenshots gescrollt bei 1100 und 2400 px: Faserwellen in beiden Modi durch alle Abschnitte sichtbar, axe ohne Verstösse, Browsertest bestanden. |
| 11 | SEO, KI-Suche, Favicon, Keystatic, Mobil und Tablet. | Lighthouse (Chrome DevTools) mobil und Desktop; `.qa/seo-check.mjs`; `.qa/keystatic-check.mjs`; `.qa/sicht/geraete.mjs`. | Favicon aus V3, PNG-Icons und Manifest; Metadaten erweitert; strukturierte Daten je Seitentyp; `/llms.txt`, `/llms-full.txt`; robots mit KI-Crawlern; Logo mit `sizes` (lud vorher 1920 px breit). Überlauf bei 320 px auf Leistungsseiten (Zeile "Weitere Leistungen") mit `flex-wrap` behoben. | Lighthouse mobil und Desktop: Accessibility 100, Best Practices 100, SEO 100 (mit `SITE_INDEXABLE=true`; ohne Freigabe meldet Lighthouse die gesperrte robots.txt, das ist gewollt), Agentic Browsing 100. 14 Routen: genau ein H1, Beschreibung, Canonical, Open Graph, Twitter, Manifest, JSON-LD ohne Fehler. Sitemap 28/28. Keystatic: Dashboard, Startseite mit Block Leistungsbereiche (Bereiche und Leistungsfeld sichtbar), Sammlungen, keine Konsolenfehler. Geräte 320 bis 1280 px auf acht Routen: kein Überlauf, keine Konsolenfehler; nur Inline-Textlinks unter 24 px (zulässig). Ladegewicht Startseite: HTML 36 KB gzip, Skripte 522 KB, Bilder 410 KB, CLS 0, LCP 0.4 s lokal. |
| 12 | Rückmeldung Kundschaft vom 7. Oktober 2026 (zweite Runde): Menü soll beim Überfahren öffnen, Untermenü-Panels etwas dichter, Desktop-Rand je rund 1 cm, Wasserzeichen im gelben Band abgeschnitten, Leistungsseiten mit zu grossem Bild und zu kleinem Text, Kennzahl "Datenblätter" ersetzen und Zähler synchron, InfraOne-Hinweis, AGB final. | Screenshots der Kundschaft | Untermenüs öffnen per Mauszeiger (nur bei `(hover: hover)`, Lücke gehört zum Panel), Panels mit `--f-menue` (97 bzw. 98.5 Prozent), Rand `lg:px-[5.5rem]`, Wasserzeichen vertikal zentriert mit voller Höhe, Leistungsseite neu: Text in Lesegrösse mit Knöpfen, haftende Spalte mit Bild 4:3 und "Auf einen Blick" (neues CMS-Feld `merkmale` mit Symbolen, aus den bestehenden Texten befüllt), Kennzahl "30+ Gemeinden mit FTTH erschlossen" (Quelle: Leistungstext FTTH), `ZaehlerGruppe` startet alle Zähler gleichzeitig mit 2.6 s, "1 Mio." zählt mit Dezimalstelle; Hinweis "Gemacht mit Herz von InfraOne" in Fusszeile und Impressum; AGB final (docs/16 Nr. 5). | siehe folgende Zeile |
| 13 | Rückmeldung Kundschaft vom 8. Oktober 2026: Porträts der Technik grösser als die der Geschäftsleitung; doppelter Inhalt zwischen /referenzen und /referenzen/allgemein; Mobilmenü mit Text "Menü" und "Öffnen"; Abschnitt "Fachwissen hat ein Gesicht" auf der Startseite. | Screenshots der Kundschaft | Personenraster mit Karten von höchstens 18 rem (beide Gruppen gleich gross, gemessen 288 px); /referenzen/allgemein entfernt und Inhalte (Logos mit Namen, "Die Arbeit hinter den Logos", gelbes Kontaktband) in /referenzen integriert, Weiterleitung 308, Referenzen im Menü ohne Untermenü; Mobilmenü im V2-Aufbau; Block Team von der Startseite entfernt. | Browsertest bestanden (Routenwechsel über direkten Link, Mobilmenü, Logos im hellen Modus auf /referenzen), Screenshots `.qa/sicht/r9-*.png`. |
| 9 | Startseite zeigte alle acht Leistungen als Liste; gewünscht sind vier Bereiche mit Bild nach dem V3-Abschnitt "Glasfaser verbindet. Wir machen sie nutzbar." | V3 `content/settings/home.json` (`connectionAreas`) | Neuer Block `leistungsbereiche` (Schema, Komponente, BlockRenderer), Texte wörtlich aus V3 mit "und" statt "&", Bilder und Links über die verknüpfte Leistung, `TitelMitKontur` mit Zeilenumbrüchen. `/leistungen` unverändert mit acht Leistungen. | Inhaltstest "vier Leistungsbereiche", Browsertest: vier Karten mit geladenen Bildern, acht Artikel auf `/leistungen`. Screenshots `.qa/sicht/leistungsbereiche-*.png` bei 375, 1920, 2560 px in beiden Modi. |

## Gestalterischer Durchgang (zehn geprüfte Stellen)

1. Hero-Titel in einzeiligen Unterseiten-Heros erschien nur als Kontur (schwach lesbar): einzeilige Titel jetzt gefüllt.
2. Zwei Personen im Fünfspalter liessen die Zeile leer wirken: Raster passt sich an zwei Personen an.
3. Kontaktformular lag direkt über der Animation, Linien liefen durch die Felder: Abschnittsfläche "ruhig" hinterlegt.
4. Katalog mit 43 grossen Kacheln sehr lang: ab 1280 px vier, ab 1536 px fünf Spalten.
5. Kennzahl mit falscher Zahl (siehe oben).
6. Abschnittsfolge der Startseite ohne Rhythmus: Flächen jetzt transparent / ruhig / tief / ruhig / transparent / betont / transparent / betont / ruhig / gelb / tief.
7. Referenzblock mit V2-Rahmenlinie und Ablauf mit Unterlinie passten nicht zu den Flächen: auf die gemeinsamen Flächenklassen umgestellt.
8. Logo in der Kopfzeile zu klein (siehe oben).
9. Mobile Kennzahlen untereinander mit viel Höhe: bewusst belassen (bei 320 px wären drei Spalten unleserlich); Abstände reduziert.
10. Produktkachel-Beschriftung "Bild aus dem Datenblatt" / "Dokumentvorschau" auf hellen Bildern: dunkle Kapsel mit festem Kontrast geprüft, keine Änderung nötig.

Erneute Prüfung der fünf schwächsten Stellen danach: Kontaktseite (Karte lädt im geschlossenen Arbeitsbereich nicht, extern geprüft siehe Hinweis), Katalog-Kategorien mit einem Eintrag (viel Leerraum, bewusst belassen zugunsten der Orientierung), Team auf 2560 px (Raster bleibt links, Inhaltskante stimmt mit Kopfzeile überein), Hero auf 320 px (Titel 2.75 rem, drei Zeilen, kein Umbruch im Wort), Footer auf 320 px (Spalten untereinander, Social-Links mit 40 px Höhe).

## Browserprüfung `npm run test:browser` (bestanden)

- Startseite: genau ein H1, Canvas-Animation vorhanden.
- Routenwechsel über Untermenüs (Leistungen, Produkte, Referenzen, Über uns) nach Scrollen auf 1800 px: Zielseite sofort bei 0, nach 400 ms weiterhin 0 (kein nachträgliches Hochscrollen).
- Erneuter Klick auf aktuelle Route: sofort oben.
- Kontakt-Link und Logo: Zielseite oben. Browser-Zurück: Browser stellt Position selbst her.
- Desktop-Untermenü: Leistungen 9 Einträge, Escape schliesst und gibt Fokus zurück, Klick ausserhalb schliesst, Produkte-Untermenü enthält Kategorien (16 Einträge), Kategorie-Link filtert den Katalog.
- Farbmodus: Schalter ändert `data-theme`, Wahl bleibt nach Neuladen (localStorage `lwl-theme`), keine Hydrationwarnungen, keine Konsolenfehler (Google-Maps-Netzwerkfehler des geschlossenen Arbeitsbereichs ausgenommen).
- Referenzlogos: hell = farbige Logos sichtbar und Silhouetten verborgen, dunkel = Silhouetten sichtbar.
- axe WCAG 2.1 A/AA: keine schweren oder kritischen Verstösse auf `/`, `/leistungen`, `/produkte`, `/referenzen`, `/referenzen/allgemein`, `/ueber-uns`, `/team`, `/kontakt` in beiden Modi (iframe der Karte ausgenommen).
- Mobil 390 px: Dialogmenü öffnet, Untermenü, Auswahl schliesst, Zielseite oben, Escape schliesst.
- 320 px: kein horizontaler Überlauf auf fünf Routen.
- Team: 2 Leitung, 4 Technik, Lindi Selimi nicht vorhanden.
- Leistungsbereiche: vier Karten mit geladenen Bildern auf der Startseite, acht Leistungen auf `/leistungen`.
- Bewegung reduzieren (Kontext `reducedMotion: 'reduce'`): Faserwellen bewegen sich, Hero-Zeile sichtbar, `js-einblenden` gesetzt, Elemente werden beim Scrollen sichtbar, Zähler erreichen "1 Mio.+", "1'000+", "40", Logoslider läuft mit doppelter Dauer.
- Kopfzeile: einzeilig und ohne Überlauf bei 375, 1024, 1440, 1920 und 2560 px (Höhen 81 und 113 px).

## Sichtprüfung auf dem PC der Kundschaft (7. Oktober 2026)

`.qa/sicht/screenshots.mjs` mit dem installierten Chrome 154: Startseite, Kopfzeile, Leistungsbereiche und Produkte-Untermenü bei 375, 1920 und 2560 px, jeweils dunkel und hell (24 Bilder in `.qa/sicht/`), keine Konsolenfehler. Produkte-Untermenü: Alle Produkte, Produktentwicklung, 14 Kategorien, Datenblätter und Downloads.

## Viewports und Farbmodi (`.qa/viewports.mjs`)

320, 375, 390, 430, 768, 1024 (mit Reduced Motion), 1440, 1920, 2560 px, jeweils dunkel und hell, auf `/`, `/produkte`, `/referenzen`, `/kontakt`, `/ueber-uns`, `/team`, `/leistungen/muffenspleissungen`, `/referenzen/kamera-tracking-stadion-fc-st-gallen`: kein horizontaler Überlauf, alle Bilder geladen, keine Konsolenfehler. Reduced Motion (`.qa/reduced.mjs`, 1024 px): Faserwellen als Standbild gezeichnet (Canvas gefüllt, keine Schleife), Zähler zeigen sofort die Endwerte ("1 Mio.+", "1'000+", "40"), kein Element mit `data-einblenden` bleibt ausgeblendet.

## Statische Prüfungen

- `npm run typecheck`: ohne Fehler.
- `npm run lint`: ohne Fehler.
- `npm test`: 25 Tests bestanden (Textregeln, Startseitenauswahl, neun V2-Referenzen, Team, Datenblatt-Index gegen PDFs, PDF-Prüfsummen gegen V2, Logoliste, Startseite ohne Heroimage, vier Leistungsbereiche, Schreibziel).
- `node scripts/pruefe-texte.mjs`: keine Fehler, eine Warnung (Floskel "Mehrwert" im AGB-Entwurf aus V3, Rechtstext unverändert belassen).
- `node scripts/pruefe-konfiguration.mjs`: ohne Fehler.
- `npm run verify:repository`: Remote `lwl-techniker/lwl-techniker` passt zu `GITHUB_REPO`, V2 und V3 geschützt.
- `npm run build`: 36 Seiten statisch erzeugt, Keystatic-Routen dynamisch (Node 24.15 auf Windows, `engines` erlaubt 22.18 bis 24).

## PDF-Machbarkeit

Siehe `docs/14-datenblaetter-pflege-und-machbarkeit.md` (Austausch, Fehler, fehlende Datei, erneuter Upload in einer Arbeitskopie geprüft).

## Nicht prüfbar im Arbeitsbereich

- Google-Maps-Einbettung: Der Arbeitsbereich hat keinen Zugang zu google.com, der iframe blieb leer. Einbindung, Abdunklung im Darkmode und Routenlink sind identisch mit V3, wo die Karte laut `docs/06` visuell geprüft wurde. Nach dem ersten Netlify-Deploy im Browser prüfen.
- Netlify Forms: lokal wird nichts gesendet (Testmodus mit Hinweis). Formularerkennung über `public/__forms.html` wie in V2.
- Keystatic-Online-Login: benötigt eine eigene GitHub-App für V4 (`.env.example`).
