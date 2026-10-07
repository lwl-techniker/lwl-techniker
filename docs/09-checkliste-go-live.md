# 9. Checkliste vor der Veröffentlichung

Alle Punkte abhaken. Offene Punkte mit der Projektleitung klären.

## Konfiguration

- [ ] `src/site.config.ts`: `PROJEKT_NAME`, `DOMAIN`, `GITHUB_REPO` gesetzt
- [ ] `KEYSTATIC_MODUS` steht auf `automatisch`
- [ ] `package.json`: Name angepasst
- [ ] Markenfarben, Schriften und `themeColor` gesetzt, Kontraste geprüft
- [ ] Favicon `src/app/icon.svg` durch das Signet der Firma ersetzt
- [ ] Beispielinhalte und Beispielbilder der Muster AG vollständig entfernt (die Konfigurationsprüfung meldet keine Platzhalter mehr)
- [ ] `npm run pruefen` ohne Fehler, Warnungen begründet

## GitHub und Keystatic

- [ ] Repository privat unter `infraoneit`
- [ ] GitHub-App gehört `infraoneit` und ist nur auf diesem Repository installiert
- [ ] Callback-URLs für Domain, Netlify-Adresse und 127.0.0.1 eingetragen
- [ ] Vier Werte im Passwortmanager abgelegt
- [ ] `.env` ist nicht im Repository (`git ls-files .env` gibt nichts aus)
- [ ] Kundschaft hat ein GitHub-Konto mit Schreibrechten und kann sich unter `/keystatic` anmelden
- [ ] Test: online im CMS einen Text ändern, nach 3 Minuten online sichtbar, danach zurückändern

## Netlify

- [ ] Vier Umgebungsvariablen gesetzt (geheime Werte mit richtigen Scopes), danach Clear cache and deploy
- [ ] Domain verbunden, HTTPS aktiv, `www` ist Primary domain
- [ ] Form detection aktiv, E-Mail-Benachrichtigung an die Kundschaft eingerichtet
- [ ] Test: Formular online abgeschickt, E-Mail angekommen, Antwortadresse korrekt
- [ ] Täglicher Build eingerichtet, falls Stellen mit Ablaufdatum genutzt werden

## Inhalte

- [ ] Impressum und Datenschutzerklärung von der Kundschaft geprüft
- [ ] Alle Texte gegengelesen ([07-texte.md](07-texte.md)), keine erfundenen Angaben
- [ ] Kundenstimmen und Teamfotos mit Einverständnis
- [ ] Alle Inhaltsbilder mit Alt-Text
- [ ] SEO-Titel und SEO-Beschreibung für jede Seite
- [ ] Social-Media-Vorschaubild gesetzt (Test: https://www.opengraph.xyz)

## Qualität

- [ ] Geprüft bei 375, 768, 1280, 1920 und 2560 px
- [ ] Lighthouse gegen den Produktionsbuild: Performance mindestens 90, übrige 100
- [ ] Keine Konsolenfehler
- [ ] Tastaturbedienung funktioniert, auch Menü und Formular
- [ ] Rich Results Test ohne Fehler (Startseite, eine Stelle)
- [ ] 404-Seite getestet (`/gibt-es-nicht`)

## Nach der Veröffentlichung

- [ ] Google Search Console: Domain bestätigen, Sitemap `https://www.kunde.ch/sitemap.xml` einreichen
- [ ] Alte Website: Weiterleitungen alter Adressen in `public/_redirects` eintragen (Format `/alte-seite /neue-seite 301`)
- [ ] Kundschaft in Keystatic eingeführt ([10-anleitung-kundschaft.md](10-anleitung-kundschaft.md))
