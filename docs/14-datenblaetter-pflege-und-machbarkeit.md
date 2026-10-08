# V4: Datenblätter pflegen und PDF-Machbarkeitsnachweis

## Entscheidung: Variante B (schlanker Datenblattkatalog)

Die PDF-Datenblätter sind die zentrale Quelle. Die Website leitet alles, was zuverlässig automatisch ableitbar ist, beim Build aus den PDFs ab und verzichtet auf separat gepflegte Produkttexte, Eigenschaften und Preise. Manuell bleiben nur drei Angaben pro Produkt: stabiler Anzeigename, Kategorie, Reihenfolge (plus optionaler Hinweis für Produkte ohne Datenblatt).

Begründung aus der Analyse der 40 vorhandenen PDFs (alle textbasiert, Word-Export, kein Scan; Details unten):

- Keine Artikelnummern in den 32 Hausdatenblättern. Eine stabile Produkt-ID im Dokument, wie sie Variante A für die Zuordnung verlangt, existiert nicht. Nur die Transceiver-Datenblätter eines Drittherstellers enthalten Part-Nummern.
- Keine Preise in keinem PDF. Preise können daher weder angezeigt noch automatisch aktualisiert werden; sie bleiben Sache der Anfrage.
- Drei Layoutfamilien: Hausdatenblatt mit "Spezifikationen: Schlüssel: Wert" (Patchkabel), Hausdatenblatt mit Aufzählung "Eigenschaften" plus Prosa "Beschreibung" (Boxen, Dosen), englische Hersteller-Datenblätter und Übersichtstabellen (SmartOptics). Eine regelbasierte Extraktion von Eigenschaftsfeldern wäre nur für die erste Familie halbwegs stabil und bei jeder Layoutänderung still falsch.
- Ein reines Bild-PDF (`patchkabel-rj45-cat6.pdf`): ausser Briefkopf kein Text. Variante A müsste hier OCR einsetzen.
- Keine ältere und neuere Fassung desselben Datenblatts vorhanden. Eine Änderungserkennung auf Feldebene liess sich nicht am realen Fall belegen.

Variante A (automatisch gepflegte Eigenschaftsfelder) wäre damit eine scheinbar automatische, aber fehleranfällige Produktdatenbank. Variante B ist robust: Was angezeigt wird, stammt direkt und nachweisbar aus dem PDF.

## Was automatisch passiert (scripts/erzeuge-datenblaetter.mjs)

Beim Build (`prebuild`) und mit `npm run datenblaetter`. Im Entwicklungsmodus (`npm run dev`) zusätzlich sofort beim ersten Aufruf von `/produkte` oder `/downloads`, wenn ein Produkt ein Datenblatt hat, das noch nicht oder in anderer Grösse im Index steht (`datenblattIndexLesen` in `src/lib/cms.ts`, seit 8. Oktober 2026). Ein im CMS neu angelegtes Produkt zeigt damit Vorschau, Seitenzahl und Suchtext ohne Neustart; die erste Anfrage dauert ein bis zwei Sekunden länger.

1. Jedes Produkt in `content/produkte` mit Feld `dokument` wird gelesen. Dateien über 15 MB oder fehlende Dateien werden gemeldet, der letzte gültige Index-Eintrag bleibt erhalten.
2. SHA-256-Prüfsumme. Unveränderte PDFs (gleiche Prüfsumme, Vorschau vorhanden) werden übersprungen; ein erneuter Upload derselben Datei erzeugt keine Duplikate und keine Änderung.
3. Text der ersten sechs Seiten (mupdf, WASM, ohne externe Dienste): Suchtext, Textauszug, im Dokument erkannter Titel (erste Zeile ausserhalb von Briefkopf und Fusszeile), Artikelnummern (Muster `XX-XXXX-...`), Dokumentdatum (Fusszeile `02.09.19 / AT`).
4. Vorschau der ersten Seite als WebP (720 px breit) nach `public/dokumente/vorschau/<slug>.webp`.
5. Produktabbildung: grösstes Bild der ersten Seite, ausgeschlossen werden Bilder, die in mindestens drei Dokumenten identisch vorkommen (Briefkopf, Logos) sowie seitenähnliche Bilder (Scans). Ergebnis nach `<slug>-bild.webp`. Ohne zuverlässigen Treffer zeigt die Website die Dokumentvorschau. Beide sind auf der Kachel beschriftet ("Bild aus dem Datenblatt" bzw. "Dokumentvorschau"), nichts wird als freigestelltes Produktfoto ausgegeben.
6. Ergebnis in `src/generated/datenblaetter.json` (committet). Kennzahl "Datenblätter" auf der Startseite = Anzahl eindeutiger Prüfsummen.

Grenzen: 15 MB pro Datei, Text aus 6 Seiten, Bilder aus 2 Seiten, 300 Bildblöcke. Im Netlify-Production-Kontext bricht der Build bei fehlerhaften Datenblättern ab (fehlende Datei, zu gross, nicht lesbar als PDF), in Vorschauen wird nur gewarnt.

## Anleitung: Datenblatt ersetzen

1. Im CMS (`/keystatic`) unter "Inhalte > Produkte und Datenblätter" das Produkt öffnen.
2. Beim Feld "Datenblatt" die neue PDF-Datei hochladen (ersetzt die alte) und speichern. Online erzeugt Keystatic einen Commit in `infraoneit/lwl-techniker-v4`.
3. Netlify baut die Website neu. Der Build erzeugt Vorschau, Bild, Suchtext und Kennzahl automatisch. Der Download zeigt immer auf dieselbe Datei wie die angezeigten Angaben (gleicher Pfad aus dem Produktdatensatz).
4. Nichts weiter ist zu pflegen. Wenn der Anzeigename ändern soll, das Feld "Produktname" anpassen; die Adresse (Slug) nicht ändern.

Neues Produkt: Eintrag anlegen mit Produktname, Kategorie (gleicher Wortlaut wie bestehende Kategorie), Reihenfolge und PDF. Produkte ohne Datenblatt: PDF leer lassen und im Feld "Hinweis" z. B. "Auf Anfrage" eintragen.

Versionierung und Rückkehr: Jede CMS-Änderung ist ein Git-Commit. Eine frühere Fassung lässt sich über GitHub (Datei-Historie) wiederherstellen; Netlify erlaubt zudem das Zurückrollen auf einen früheren Deploy.

## Machbarkeitsnachweis (7. Oktober 2026, 40 PDFs aus V2 = V3)

| Prüfung | Ergebnis |
| --- | --- |
| Text auslesen | 39 von 40 PDFs lesbar; `patchkabel-rj45-cat6.pdf` enthält nur Briefkopf-Text (Bild-PDF), Suche nutzt dort Produktname und Kategorie. |
| Titel erkennen | 39 von 40 (alle lesbaren), z. B. "LWL-Patchkabel LCD-LCD, 9/125 OS2 SM", "SO-QSFP28-AOCXM", "OVERVIEW SFP+ TRANSCEIVERS". Wird nur als Zusatz "Im Datenblatt: ..." gezeigt, der stabile Name bleibt der CMS-Name. |
| Seitenvorschau | 40 von 40. |
| Produktabbildung | 34 von 40 automatisch (Kontaktbogen `.qa`-Prüfung: Fotos korrekt, bei den SmartOptics-Kabeln technische Zeichnungen). 6 ohne verlässliches Bild (Übersichtstabellen, zwei Hersteller-Datenblätter, Bild-PDF, Haubenmuffe, SO-QSFP-4SFP-PCU) zeigen die Dokumentvorschau. |
| Artikelnummern | nur in 8 Hersteller-PDFs (1 bis 34 Part-Nummern), in Hausdatenblättern keine. |
| Dokumentdatum | 32 Hausdatenblätter "02.09.19", Hersteller-PDFs ohne. |
| Preise | in keinem PDF (zwei Treffer "Preis/Leistungs-Verhältnis" sind Fliesstext). |
| Austausch eines Datenblatts | geprüft: anderes PDF unter gleichem Slug ergibt neue Prüfsumme, neue Vorschau und neuen Suchtext; der alte Eintrag wird ersetzt. |
| Erneuter Upload derselben Datei | geprüft: zweiter Lauf meldet "40 unverändert", keine neuen Dateien, keine Duplikate. |
| Fehlerhaftes PDF | geprüft (Textdatei als .pdf): Fehler wird gemeldet, letzte gültige Fassung bleibt im Index, Build in Vorschauen läuft weiter. |
| Fehlende Datei | geprüft: Meldung "Datei fehlt", letzte gültige Fassung bleibt. |
| Mehrprodukt-Dokumente | die zwei Übersichtstabellen bleiben je ein Eintrag (ein Datenblatt = ein Katalogeintrag); ihre Part-Nummern sind über die Suche findbar. |
| Laufzeit | 40 PDFs in rund 8 s, unveränderte Läufe unter 1 s. Keine externen Dienste, keine Geheimnisse. |

Die Prüfläufe für Austausch, Fehler und fehlende Datei wurden in einer Arbeitskopie ausgeführt; die Original-PDFs blieben unverändert (Prüfsummen in `tests/pdf-pruefsummen.json`, Test `tests/inhalte.test.mjs`).
