# Prüfung und Veröffentlichung (GitHub Actions, Netlify-Build-Hook)

Seit 8. Oktober 2026 wird die Website nicht mehr bei jedem Speichern im CMS neu gebaut. Speichern in Keystatic erzeugt einen Commit auf `main`; GitHub prüft diesen Stand automatisch. Veröffentlicht wird erst, wenn jemand die Veröffentlichung auslöst und die Prüfung grün ist.

## Ablauf

| Schritt | Was passiert | Wo |
|---|---|---|
| Speichern im CMS | Commit auf `main` (GitHub-Modus) | Keystatic |
| Prüfung | `npm run pruefen`, `npm run build`, Lighthouse (Accessibility, Best Practices, SEO je 100, Performance mindestens 90 als Warnung) | `.github/workflows/pruefung.yml`, Lauf unter "Actions" |
| Rot | GitHub schickt eine E-Mail an die Person, die den Commit gemacht hat, und an den Webmaster. Website bleibt unverändert. | GitHub |
| Veröffentlichen | Seite `/veroeffentlichen` der Website mit Kennwort, oder bei GitHub "Actions, Prüfung und Veröffentlichung, Run workflow" | Website oder GitHub |
| Build | Nach grüner Prüfung ruft der Lauf den Netlify-Build-Hook auf. Netlify baut den aktuellen Stand von `main` und schaltet ihn frei. | Netlify |

Netlify baut von sich aus nichts mehr: `netlify.toml` enthält `ignore = "test -z \"$INCOMING_HOOK_URL\""`. Bei Builds über einen Hook ist diese Variable gesetzt, nur dann wird gebaut. Der tägliche Build für abgelaufene Stellen (`taeglicher-build.yml`) nutzt denselben Hook.

## Einrichtung (einmalig)

1. **Netlify, Build-Hook**: Project configuration, Build and deploy, Continuous deployment, Build hooks, Add build hook. Name `veroeffentlichung`, Branch `main`. Die URL kopieren.
2. **GitHub, Secret**: Repository `lwl-techniker/lwl-techniker`, Settings, Secrets and variables, Actions, New repository secret. Name `NETLIFY_BUILD_HOOK`, Wert die Hook-URL.
3. **GitHub, Token für die Veröffentlichungsseite**: Settings des Kontos webmaster@lwl-techniker.ch, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token. Repository access nur `lwl-techniker/lwl-techniker`, Permission "Actions: Read and write". Ablauf möglichst lang wählen und den Termin im Kalender notieren; nach Ablauf funktioniert die Seite `/veroeffentlichen` nicht mehr (GitHub "Run workflow" weiterhin).
4. **Netlify, Umgebungsvariablen** (beide "Contains secret values", Scopes Functions und Runtime):
   - `VEROEFFENTLICHEN_KENNWORT`: mindestens 12 Zeichen, aus dem Passwortmanager. Dieses Kennwort erhält die Kundschaft.
   - `GITHUB_WORKFLOW_TOKEN`: der Token aus Schritt 3.
5. Einmal "Clear cache and deploy site" bei Netlify, damit die Variablen gelten.
6. **E-Mail bei Rot**: GitHub, Settings des Kontos, Notifications, "Actions: Send notifications for failed workflows" aktivieren.

Keine dieser Werte gehört in den Code oder in `.env`. Lokal (`npm run dev`) meldet `/veroeffentlichen` "nicht eingerichtet", das ist richtig so.

## Für die Kundschaft

1. Im CMS so viel ändern und speichern wie nötig.
2. `https://www.lwl-techniker.ch/veroeffentlichen` öffnen, Kennwort eingeben, "Prüfen und veröffentlichen".
3. Nach etwa zehn Minuten ist die Website aktualisiert. Bei einem Fehler bleibt die alte Website online und der Webmaster meldet sich.

Die Seite ist nicht im Menü, nicht in der Sitemap und für Suchmaschinen gesperrt (robots.txt, X-Robots-Tag, noindex).

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

## Wenn etwas nicht geht

| Problem | Ursache | Lösung |
|---|---|---|
| Veröffentlichungsseite meldet "nicht eingerichtet" | Variablen fehlen in Netlify oder zu kurzes Kennwort | Schritt 4 und 5 |
| "GitHub hat die Veröffentlichung nicht angenommen (Status 401 oder 403)" | Token abgelaufen oder ohne Actions-Recht | Schritt 3 wiederholen, Variable ersetzen, neu deployen |
| Lauf grün, aber Website unverändert | Secret `NETLIFY_BUILD_HOOK` fehlt oder Hook gelöscht | Schritt 1 und 2 |
| Netlify baut trotz Push nicht | gewollt (`ignore` in `netlify.toml`) | Veröffentlichung auslösen |
| Lighthouse rot wegen Performance | nur Warnung, bricht nicht ab | Bericht unter "Artifacts" des Laufs ansehen |
