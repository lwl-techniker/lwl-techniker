# 4. Netlify verbinden

Voraussetzung: Repository auf GitHub und GitHub-App eingerichtet ([03-github-verbinden.md](03-github-verbinden.md)).

## Schritt 1: Projekt anlegen

1. https://app.netlify.com, **Add new project, Import an existing project, GitHub**
2. Repository auswählen, Branch `main`
3. Die Build-Einstellungen übernimmt Netlify aus `netlify.toml`. Nichts ändern:

| Einstellung | Wert |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node-Version | 22 (aus `netlify.toml` und `.nvmrc`) |

4. **Noch auf derselben Seite** unter **Environment variables, Add environment variables** die vier Werte aus der `.env` eintragen ([03-github-verbinden.md](03-github-verbinden.md), Schritt 3). Erst dann **Deploy** klicken. Ohne die Werte bricht der erste produktive Build bewusst ab. Auf dieser Seite gibt es noch keine Einstellung für geheime Werte. Diese nach dem ersten Deploy wie in Schritt 2 nachholen.

Netlify installiert den Next.js-Adapter (OpenNext) selbst. Ihn nicht in `netlify.toml` als Plugin fixieren.

## Schritt 2: Umgebungsvariablen

Später änderbar unter **Project configuration, Environment variables**.

| Name | Wert aus `.env` | Geheim | Scopes |
| --- | --- | --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | ja | nein | All scopes |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | ja | ja | Builds, Functions, Runtime |
| `KEYSTATIC_SECRET` | ja | ja | Builds, Functions, Runtime |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | ja, nur der Teil vor `#` | nein | All scopes |

- "Geheim" heisst: Häkchen **Contains secret values** setzen. Geheime Werte erlauben den Scope "Post processing" nicht, deshalb dort die drei Scopes einzeln wählen.
- Deploy Contexts: für nicht geheime Werte **Same value for all deploy contexts**. Bei geheimen Werten verlangt Netlify je Context einen Wert: bei Production, Deploy Previews und Branch deploys denselben Wert eintragen, Local development leer lassen.
- Nach jeder Änderung: **Deploys, Trigger deploy, Clear cache and deploy site**. `NEXT_PUBLIC_`-Werte werden beim Build eingebaut.

Die Konfigurationsprüfung (`prebuild`) bricht den produktiven Build ab, wenn:

- eine Variable fehlt, `KEYSTATIC_SECRET` kürzer als 32 Zeichen ist oder ein Wert `#` oder Leerzeichen enthält
- in `src/site.config.ts` noch Platzhalter stehen oder der Keystatic-Modus `lokal` ist
- Inhalte noch Platzhalter der Vorlage enthalten (Muster AG, example.ch, Beispielname)

Die Meldung steht im Deploy-Log. Textverstösse in Inhalten erscheinen dort nur als Warnung, weil die Website sie beim Ausgeben automatisch korrigiert.

## Schritt 3: Domain

1. **Domain management, Add a domain**, z. B. `www.kunde.ch`
2. DNS beim Anbieter der Kundschaft. Bevorzugt:

| Typ | Name | Wert |
| --- | --- | --- |
| ALIAS oder ANAME | `@` | `apex-loadbalancer.netlify.com` |
| CNAME | `www` | `kunde-website.netlify.app` |

   Unterstützt der Anbieter kein ALIAS, stattdessen einen A-Eintrag `@` auf `75.2.60.5`.

3. `www.kunde.ch` als **Primary domain** setzen. Netlify leitet `kunde.ch` automatisch dorthin um.
4. HTTPS stellt Netlify automatisch aus (Let's Encrypt). DNS-Änderungen brauchen bis zu 48 Stunden.
5. `DOMAIN` in `src/site.config.ts` auf die endgültige Adresse setzen und committen.
6. Callback-URL für die neue Domain in der GitHub-App ergänzen ([03-github-verbinden.md](03-github-verbinden.md), Schritt 4).

## Schritt 4: Formulare aktivieren

1. **Forms, Enable form detection**
2. Einmal neu deployen. Unter **Forms** erscheint das Formular `kontakt`.
3. **Project configuration, Notifications, Emails and webhooks, Form submission notifications, Add notification, Email notification**, Formular `kontakt`, Empfänger der Kundschaft eintragen.
4. Online ein Testformular senden und den Eingang prüfen.

Details: [05-formulare.md](05-formulare.md).

## Schritt 5: Täglicher Build (für abgelaufene Stellen)

Stellen mit **gültig bis** verschwinden beim nächsten Build. Damit das auch ohne neue Commits passiert:

1. **Project configuration, Build and deploy, Continuous deployment, Build hooks, Add build hook**, Name `taeglich`, Branch `main`
2. Die angezeigte URL im Repository als Secret speichern: **Settings, Secrets and variables, Actions, New repository secret**, Name `NETLIFY_BUILD_HOOK`
3. Datei `.github/workflows/taeglicher-build.yml` anlegen:

```yaml
name: Täglicher Build
on:
  schedule:
    - cron: '5 23 * * *' # 23:05 UTC, in der Schweiz immer nach Mitternacht (Winter 00:05, Sommer 01:05)
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS -X POST -d '{}' "${{ secrets.NETLIFY_BUILD_HOOK }}"
```

Hinweis: In öffentlichen Repositories pausiert GitHub zeitgesteuerte Abläufe nach 60 Tagen ohne Änderung. Unsere Repositories sind privat, trotzdem gelegentlich prüfen. Unter **Actions** lässt sich der Ablauf wieder aktivieren und mit **Run workflow** von Hand starten.

## Deploy-Vorschau

Jeder Pull Request und jeder andere Branch erhält eine eigene Vorschauadresse. Diese Seiten sind über `robots.txt` für Suchmaschinen gesperrt, weil nur `CONTEXT=production` freigegeben wird. Der Keystatic-Login funktioniert dort nicht (keine Callback-URL).

## Wenn etwas nicht geht

| Problem | Lösung |
| --- | --- |
| Build bricht mit `Konfigurationsprüfung` ab | Meldung im Deploy-Log lesen, sie nennt die Ursache |
| Formular zeigt online einen Fehler | Form detection nicht aktiv, oder das Formular sendet nicht an `/__forms.html` |
| `/keystatic` online meldet fehlende Einrichtung | Umgebungsvariablen fehlen, danach Clear cache and deploy |
| CMS-Änderung erscheint nicht | Deploy-Log prüfen. Der Build dauert 1 bis 3 Minuten |
| Sicherheits-Header fehlen bei Bildern | `netlify.toml` Abschnitt `[[headers]]` prüfen |
