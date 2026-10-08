# LWL-Techniker Schweiz V4

Zusammenführung von V2 (Markencharakter, Hintergrundanimation, Buttons, Schriften, Referenzen, Kontaktseite) und V3 (Struktur, Kopf- und Fusszeile, Lightmode, Logoslider, Kennzahlen, gelbe Kontaktbänder, Über uns und Team). Next.js 16, React 19, TypeScript, Tailwind 4, Keystatic. Produkte werden PDF-geführt gepflegt.

Dokumentation zu V4 in `docs/12` bis `docs/16`:

- `docs/12-herkunftsmatrix-v4.md`: welche Teile aus V2 und V3 stammen, Architektur, Routenwechsel
- `docs/13-referenzinventar.md`: alle Referenzen aus V2 mit Nachweis
- `docs/14-datenblaetter-pflege-und-machbarkeit.md`: Datenblatt ersetzen, automatische Verarbeitung, PDF-Machbarkeitsnachweis
- `docs/15-pruefprotokoll.md`: Build-, Browser- und Accessibility-Prüfungen
- `docs/16-offene-entscheidungen.md`: Datenfragen, Freigaben, Checkliste vor dem ersten Push
- `docs/17-gesamtaudit-2026-10-08.md`: Gesamtaudit (Technik, SEO, AEO, GEO, Barrierefreiheit, Inhalt) mit Punktzahlen und priorisierten Massnahmen

Die Dokumente `docs/01` bis `docs/11` stammen aus der InfraOne-Vorlage (V2) und beschreiben Keystatic, Netlify, Formulare, Bilder und Texte allgemein. Wo sie Port 3000 nennen, gilt für V4 Port 3104.

## Lokal

Node 22.18 bis 24.x. `npm ci`, dann `npm run dev` (Port 3104, erzeugt vorher Formulare und Datenblatt-Index) oder `start-dev.cmd` bzw. `start-vorschau.cmd` (Produktionsbuild). Vorschau: http://localhost:3104, Keystatic: http://localhost:3104/keystatic (lokal direkt in Dateien). Strg+C im Serverfenster beendet den Server.

## Qualität

- `npm run pruefen`: Formulare, Datenblatt-Index, Konfiguration, Texte, Bilder, TypeScript, ESLint, Unit- und Inhaltstests.
- `npm run build`: Produktionsbuild (prebuild erzeugt `public/__forms.html` und `src/generated/datenblaetter.json`).
- `npm run test:browser`: Browserprüfung gegen eine laufende Website (`npm start`), Chromium über `PLAYWRIGHT_CHROMIUM` wählbar. Prüft Routenwechsel ohne Hochscrollen, Menüs, mobiles Menü, Farbmodus, Logos im Lightmode, axe, 320 px, Team, Leistungsbereiche, Animationen bei "Bewegung reduzieren" und die Kopfzeile ohne Umbruch bei 375 bis 2560 px.
- `npm run verify:repository`: Schreibziel `lwl-techniker/lwl-techniker`, V2 und V3 geschützt.

## Inhalte

- `content/startseite`, `content/seiten`: Seitenbaukasten mit Blöcken (Hero, Logoslider, Kennzahlen, Leistungen, Leistungsbereiche mit Bild, Ablauf, Referenzen, Text mit Bild, Datenblätter, Team, Kontaktband, Kontaktformular mit Karte, Fliesstext ...).
- `content/leistungen`: acht Leistungen (Markdoc).
- `content/referenzen`: neun Referenzen aus V2 plus VAR-Support aus V3.
- `content/produkte`: 43 Produkte, davon 40 mit PDF-Datenblatt. Technische Angaben, Vorschau und Suchtext kommen automatisch aus dem PDF (`docs/14`).
- `content/team`: sechs Personen (Leitung und Technik).
- `content/einstellungen`: Firma, Navigation (Untermenüs), Übersichtsseiten mit zentraler Referenzlogo-Liste.

## Netlify

`netlify.toml`: Build `npm run build`, Publish `.next`, Node 22. Umgebungsvariablen: `SITE_URL` (kanonische Adresse), `SITE_INDEXABLE=true` nur für die freigegebene produktive Seite, vier `KEYSTATIC_*`-Werte einer eigenen GitHub-App für V4 (`.env.example`). Netlify Forms über `public/__forms.html`.

## Schutz von V2 und V3

Einziges Schreibziel ist `lwl-techniker/lwl-techniker` (Konto webmaster@lwl-techniker.ch, eigener Credential-Eintrag über `useHttpPath`). V2 (`f2127e0`) und V3 (`ecf9333`) wurden nur gelesen; Lesekopien liegen in `.reference/` (gitignored). Kein Deployment ohne ausdrückliche Freigabe.
