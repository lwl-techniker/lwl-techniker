# Prüfung bei jedem Push (GitHub Actions)

Seit 8. Oktober 2026 prüft GitHub jeden Push auf `main`, also auch jedes Speichern im CMS. Die Veröffentlichung bleibt wie gewohnt: Netlify baut bei jedem Push und schaltet den neuen Stand frei. Die Prüfung läuft parallel dazu als Kontrolle; bei Rot gibt es eine E-Mail.

## Ablauf

| Schritt | Was passiert | Wo |
|---|---|---|
| Speichern im CMS | Commit auf `main` (GitHub-Modus) | Keystatic |
| Veröffentlichung | Netlify baut und veröffentlicht den Stand, wie bisher | Netlify |
| Prüfung | `npm run pruefen`, `npm run build`, Lighthouse (Accessibility, Best Practices, SEO je 100, Performance mindestens 90 als Warnung) | `.github/workflows/pruefung.yml`, Lauf unter "Actions" |
| Rot | E-Mail von GitHub an die Person, die gespeichert hat, und an den Webmaster. Der Fehler wird im nächsten Speichern oder lokal behoben. | GitHub |

Von Hand starten: GitHub, Actions, "Prüfung", Run workflow.

## Einrichtung

Nichts im Code, keine Secrets. Nur die Benachrichtigung einschalten: GitHub, Settings des Kontos webmaster@lwl-techniker.ch, Notifications, "Actions: Send notifications for failed workflows".

Der tägliche Build für abgelaufene Stellen (`.github/workflows/taeglicher-build.yml`) braucht weiterhin das Secret `NETLIFY_BUILD_HOOK` (docs/04, Schritt 5).

## Was die Prüfung abfängt

- Textregeln (scharfes S, Gedankenstriche, Floskeln), fehlende Pflichtfelder, zu grosse Bilder, kaputte Verweise im CMS
- TypeScript- und Lint-Fehler, Fehler in den 25 Tests
- Build-Fehler (z. B. ein Produkt mit beschädigtem PDF im produktiven Kontext)
- Lighthouse unter 100 bei Barrierefreiheit, Best Practices oder SEO (z. B. fehlender Alt-Text, zu geringer Kontrast)

Nicht abgefangen: inhaltliche Fehler (falsche Zahlen, Tippfehler), die Browserprüfung (`npm run test:browser`, braucht Chrome, läuft lokal vor jeder Übergabe).

## Lighthouse lokal

```bash
SITE_INDEXABLE=true CONTEXT=production SITE_URL=https://www.lwl-techniker.ch npm run build && npx --yes @lhci/cli@0.15.1 autorun
```

Konfiguration in `lighthouserc.json` (fünf Seiten, Desktop, Berichte unter `.lighthouseci/`). Unter Windows `CHROME_PATH` auf Chrome setzen.

## Erkenntnis aus dem ersten Lauf

Lighthouse auf dem Linux-Runner bewertete das Logo im geschlossenen mobilen Menü mit falschem Seitenverhältnis (lokal nie sichtbar). Seither wird das Logo im Dialog nur bei offenem Menü gerendert.
