# 3. GitHub verbinden und Keystatic-GitHub-App einrichten

Online speichert Keystatic über eine **GitHub-App**. Die App wird einmal pro Website eingerichtet. Keystatic erledigt das fast automatisch, aber **nur lokal im Entwicklungsmodus** (`npm run dev`).

## Schritt 1: Repository anlegen

`GITHUB_REPO` in `src/site.config.ts` muss vorher stimmen.

```bash
gh repo create infraoneit/kunde-website --private --source . --remote origin --push
```

Danach:

```bash
npm run pruefen:konfiguration
```

Die Zeile `GITHUB_REPO passt zum Git-Remote` muss erscheinen.

## Schritt 2: GitHub-App erstellen

1. In `src/site.config.ts` vorübergehend `KEYSTATIC_MODUS = 'github'` setzen.
2. `npm run dev` starten und http://127.0.0.1:3000/keystatic öffnen.
3. Keystatic zeigt einen Einrichtungsdialog:
   - **GitHub organization (if any):** `infraoneit` eintragen. Bleibt das Feld leer, gehört die App dem persönlichen Konto der Person, die gerade angemeldet ist.
   - **Deployed App URL:** die spätere Domain, z. B. `https://www.kunde.ch`. Dann wird die Callback-URL gleich mit eingetragen.
4. **Create GitHub App** klicken. GitHub öffnet sich mit einem vorausgefüllten Formular. Namen prüfen (z. B. `kunde-website-cms`) und **Create GitHub App** bestätigen.
5. GitHub leitet zurück. Keystatic schreibt dabei vier Werte in die Datei **`.env`** im Projektordner.
6. Keystatic zeigt jetzt **Install GitHub App**. Klicken, **Only select repositories** wählen, das Repository der Website auswählen und installieren.
7. Server neu starten (`Ctrl+C`, dann `npm run dev`), `/keystatic` öffnen, mit GitHub anmelden. Die Inhalte erscheinen.
8. **`KEYSTATIC_MODUS` wieder auf `automatisch` setzen.**

Keystatic legt die App mit diesen Rechten an: Inhalte lesen und schreiben, Metadaten lesen, Pull Requests lesen. Die App ist technisch "öffentlich", kann aber nur Repositories verändern, auf denen sie installiert ist.

`.env` ist in `.gitignore` und darf nie committet werden. Die Konfigurationsprüfung schlägt Alarm, falls doch.

## Schritt 3: Werte sicher ablegen

Die `.env` sieht so aus:

```
KEYSTATIC_GITHUB_CLIENT_ID=Iv23li...
KEYSTATIC_GITHUB_CLIENT_SECRET=4f1c...
KEYSTATIC_SECRET=9b7e...
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=kunde-website-cms # https://github.com/apps/kunde-website-cms
```

- Die vier Werte im Passwortmanager (Keeper) beim Kundenprojekt speichern. Sie werden in Netlify gebraucht und sind auf GitHub später nicht mehr einsehbar.
- **Nur den Wert vor dem `#` kopieren.** Der Kommentar hinter dem App-Namen gehört nicht dazu.
- `KEYSTATIC_SECRET` muss mindestens 32 Zeichen lang sein.

## Schritt 4: Callback-URLs prüfen

Auf GitHub unter **Settings, Developer settings, GitHub Apps, App auswählen, General** im Feld **Callback URL**:

| Callback-URL | Wofür |
| --- | --- |
| `http://127.0.0.1/api/keystatic/github/oauth/callback` | lokales Testen im GitHub-Modus |
| `https://www.kunde.ch/api/keystatic/github/oauth/callback` | produktive Domain |
| `https://kunde-website.netlify.app/api/keystatic/github/oauth/callback` | feste Netlify-Adresse |

Für jede Adresse, unter der `/keystatic` benutzt wird, braucht es eine Callback-URL. Fehlt sie, erscheint beim Login `redirect_uri is not associated with this application`.

Auf Deploy-Vorschauen (`deploy-preview-12--kunde-website.netlify.app`) funktioniert der Login deshalb nicht. Inhalte werden immer auf der Hauptdomain bearbeitet.

## Zugriff für die Kundschaft

Wer online Inhalte bearbeiten will, braucht:

1. ein eigenes GitHub-Konto
2. Schreibrechte auf das Repository (**Settings, Collaborators, Add people**, Rolle Write)

Danach meldet sich die Person unter `https://www.kunde.ch/keystatic` mit GitHub an. Anleitung für die Kundschaft: [10-anleitung-kundschaft.md](10-anleitung-kundschaft.md).

## Wenn etwas nicht geht

| Problem | Lösung |
| --- | --- |
| Dialog "Create GitHub App" erscheint nicht | Modus steht nicht auf `github`, oder Server nicht neu gestartet |
| `App setup only allowed in development` | Einrichtung nur mit `npm run dev`, nicht mit `npm start` oder online |
| App gehört dem falschen Konto | App löschen und mit ausgefülltem Feld "GitHub organization" neu erstellen |
| Nach Login "Repo not found" | App ist nicht auf dem Repository installiert, oder `GITHUB_REPO` stimmt nicht |
| `KEYSTATIC_SECRET must be at least 32 characters long` | Wert unvollständig kopiert |
| Werte verloren | In der GitHub-App ein neues Client Secret erzeugen. `KEYSTATIC_SECRET` selbst neu setzen (zufällige Zeichenfolge mit mindestens 32 Zeichen, z. B. aus dem Passwortmanager). Überall ersetzen |
