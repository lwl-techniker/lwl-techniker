# 11. Wartung und Aktualisierungen

## Git-Arbeitsweise

- Die Kundschaft speichert online direkt auf `main`. Deshalb **vor jeder lokalen Arbeit `git pull`**.
- Kleine Korrekturen direkt auf `main`, grössere Umbauten in einem Branch (`git switch -c umbau-kopfzeile`). Netlify erstellt eine Deploy-Vorschau, die Kundschaft kann sie vor der Übernahme ansehen.
- Commit-Nachrichten auf Deutsch, kurz und sachlich: "Kontaktformular um Feld Adresse ergänzt".
- Vor jedem Push: `npm run pruefen`.

## Abhängigkeiten aktualisieren

Alle Versionen sind in `package.json` fest eingetragen, damit jede Website reproduzierbar baut. Aktualisierung etwa alle drei Monate, Sicherheitsupdates sofort.

```bash
git pull
npm outdated
```

Reihenfolge:

1. **Next.js und eslint-config-next** immer gemeinsam auf dieselbe Version heben. Vorher die Hinweise in `node_modules/next/dist/docs/` zu Änderungen lesen.
2. **Keystatic** (`@keystatic/core`, `@keystatic/next`): danach die Version von `@markdoc/markdoc` angleichen. Sie muss exakt der Version entsprechen, die Keystatic selbst verwendet:

   ```bash
   npm ls @markdoc/markdoc
   ```

   Steht dort nicht `deduped` bei beiden Einträgen, die Version in `package.json` anpassen und `npm install` ausführen.
3. **React, Tailwind, TypeScript**, übrige Pakete.

Nach jeder Aktualisierung:

```bash
npm install
npm run pruefen
npm run build
npm run dev
```

Dann im Browser prüfen: Startseite, eine Detailseite, `/keystatic` öffnen und einen Eintrag speichern, danach mit `git diff` kontrollieren, dass Keystatic das Dateiformat nicht verändert hat.

## Node.js

- Die Vorlage verlangt Node 22.18 oder neuer (TypeScript-Dateien werden von den Prüfskripten direkt ausgeführt).
- Node 22 wird bis April 2027 unterstützt. Der Wechsel auf Node 24 betrifft `.nvmrc`, `netlify.toml` (`NODE_VERSION`), `package.json` (`engines`) und die Prüfung in `scripts/pruefe-konfiguration.mjs`.

## Vorlage weiterentwickeln

Verbesserungen, die für alle Websites gelten, zuerst in `C:\Webprojekte\_vorlage-website` umsetzen, prüfen und committen. Danach bei Bedarf in bestehende Projekte übernehmen. Die Dokumentation in `docs/` im selben Commit anpassen.
