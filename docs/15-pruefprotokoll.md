# V4: Prüfprotokoll

Stand: 7. Oktober 2026, Arbeitsbereich Linux (Node 22.22, Chromium 1194 über Playwright). Alle Browserprüfungen liefen gegen den lokalen Produktionsbuild (`npm run build && npm start`, Port 3104). Keine fiktiven Prüfungen; die Skripte liegen im Repository (`tests/browser.mjs`) bzw. in `.qa/` (lokal, nicht versioniert).

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

## Viewports und Farbmodi (`.qa/viewports.mjs`)

320, 375, 390, 430, 768, 1024 (mit Reduced Motion), 1440, 1920, 2560 px, jeweils dunkel und hell, auf `/`, `/produkte`, `/referenzen`, `/kontakt`, `/ueber-uns`, `/team`, `/leistungen/muffenspleissungen`, `/referenzen/kamera-tracking-stadion-fc-st-gallen`: kein horizontaler Überlauf, alle Bilder geladen, keine Konsolenfehler. Reduced Motion (`.qa/reduced.mjs`, 1024 px): Faserwellen als Standbild gezeichnet (Canvas gefüllt, keine Schleife), Zähler zeigen sofort die Endwerte ("1 Mio.+", "1'000+", "40"), kein Element mit `data-einblenden` bleibt ausgeblendet.

## Statische Prüfungen

- `npm run typecheck`: ohne Fehler.
- `npm run lint`: ohne Fehler.
- `npm test`: 24 Tests bestanden (Textregeln, Startseitenauswahl, neun V2-Referenzen, Team, Datenblatt-Index gegen PDFs, PDF-Prüfsummen gegen V2, Logoliste, Startseite ohne Heroimage, Schreibziel).
- `node scripts/pruefe-texte.mjs`: keine Fehler, eine Warnung (Floskel "Mehrwert" im AGB-Entwurf aus V3, Rechtstext unverändert belassen).
- `node scripts/pruefe-konfiguration.mjs`: ohne Fehler (Warnung "kein Git-Remote", solange das V4-Repository nicht verbunden ist).
- `npm run build`: 35 Seiten statisch erzeugt, Keystatic-Routen dynamisch.

## PDF-Machbarkeit

Siehe `docs/14-datenblaetter-pflege-und-machbarkeit.md` (Austausch, Fehler, fehlende Datei, erneuter Upload in einer Arbeitskopie geprüft).

## Nicht prüfbar im Arbeitsbereich

- Google-Maps-Einbettung: Der Arbeitsbereich hat keinen Zugang zu google.com, der iframe blieb leer. Einbindung, Abdunklung im Darkmode und Routenlink sind identisch mit V3, wo die Karte laut `docs/06` visuell geprüft wurde. Nach dem ersten Netlify-Deploy im Browser prüfen.
- Netlify Forms: lokal wird nichts gesendet (Testmodus mit Hinweis). Formularerkennung über `public/__forms.html` wie in V2.
- Keystatic-Online-Login: benötigt eine eigene GitHub-App für V4 (`.env.example`).
