# 1. Neues Projekt aus der Vorlage starten

Die Reihenfolge ist wichtig. Wer Schritte überspringt, bekommt später Fehler bei Keystatic oder Netlify.

## Voraussetzungen

- Node.js 22.18 oder neuer in Version 22 (`node -v`)
- Git und GitHub CLI (`gh auth status` zeigt eine Anmeldung)
- Zugang zum GitHub-Konto `infraoneit` und zum Netlify-Team
- Editor: VS Code mit den Erweiterungen ESLint, Tailwind CSS IntelliSense und Prettier

## Schritt 1: Vorlage kopieren

Ordnernamen immer klein, mit Bindestrichen, ohne Umlaute: `muster-ag-website`.

Windows (PowerShell):

```powershell
cd C:\Webprojekte
robocopy _vorlage-website kunde-website /E /XD node_modules .next .git .netlify /XF .env .env.local *.tsbuildinfo
cd kunde-website
git init -b main
npm install
```

`robocopy` meldet Erfolg mit dem Rückgabewert 1. Das ist kein Fehler.

macOS oder Linux:

```bash
cd ~/Webprojekte
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude .netlify --exclude .env --exclude .env.local --exclude '*.tsbuildinfo' _vorlage-website/ kunde-website/
cd kunde-website
git init -b main
npm install
```

## Schritt 2: Projekt einstellen

In `src/site.config.ts`:

| Wert | Beispiel | Hinweis |
| --- | --- | --- |
| `PROJEKT_NAME` | `Muster AG` | Erscheint oben im CMS |
| `DOMAIN` | `https://www.muster.ch` | Mit https, ohne Schrägstrich am Ende |
| `GITHUB_REPO` | `infraoneit/muster-website` | Muss exakt dem Repository entsprechen |
| `KEYSTATIC_MODUS` | `automatisch` | Nur zum Einrichten der GitHub-App kurz auf `github` |

Weiter:

- `package.json`: `name` anpassen
- `src/app/globals.css`: Markenfarben unter `@theme`
- `src/app/schriften.ts`: Schriften, falls die Firma eigene hat
- `src/app/icon.svg`: Favicon durch das Signet der Firma ersetzen (quadratisch, SVG). Optional `src/app/apple-icon.png` (180 x 180 px)
- `src/app/layout.tsx`: `themeColor` auf die Hintergrundfarbe setzen

Details zu Farben und Schriften: [08-design-und-qualitaet.md](08-design-und-qualitaet.md).

## Schritt 3: Inhalte lokal erfassen

```bash
npm run dev
```

Unter http://localhost:3000/keystatic zuerst **Firma und Kontakt** und **Navigation** ausfüllen, dann Startseite, Seiten, Leistungen, Referenzen und Stellen.

Alle Beispielinhalte der Muster AG ersetzen oder löschen, auch die Bilder in `public/bilder`. Die Konfigurationsprüfung listet übrig gebliebene Platzhalter auf und verhindert den produktiven Deploy, solange welche vorhanden sind.

Lokal schreibt Keystatic direkt in die Dateien unter `content/` und `public/bilder/`. Diese Änderungen werden normal committet.

## Schritt 4: Prüfen und erster Commit

```bash
npm run pruefen
git add -A
git commit -m "Projekt eingerichtet"
```

`next dev` legt beim ersten Start die Dateien `AGENTS.md` und `CLAUDE.md` an oder ergänzt sie um einen Hinweis zu Next.js. Diesen Block unverändert committen, er wird sonst bei jedem Start neu geschrieben.

## Schritt 5: GitHub verbinden

Siehe [03-github-verbinden.md](03-github-verbinden.md).

## Schritt 6: Netlify verbinden

Siehe [04-netlify.md](04-netlify.md).

## Schritt 7: Abnahme

Checkliste [09-checkliste-go-live.md](09-checkliste-go-live.md) vollständig abarbeiten. Danach die Kundschaft mit [10-anleitung-kundschaft.md](10-anleitung-kundschaft.md) einführen.
