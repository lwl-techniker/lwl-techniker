# V4: Offene Entscheidungen und Datenfragen

Stand: 7. Oktober 2026. Keine dieser Fragen blockiert den Betrieb der Website; sie betreffen Inhalte und Freigaben.

| Nr. | Thema | Aktueller Stand in V4 | Entscheidung der Kundschaft |
| --- | --- | --- | --- |
| 1 | Kennzahl Projekte: "1'000+" (V3) oder "100" (früherer Auftrag) | "1'000+" aus V3 übernommen, weil das der zuletzt bestätigte Wert war. Im CMS unter "Startseite > Kennzahlen" änderbar. | Wert bestätigen oder korrigieren. |
| 2 | Kennzahl "1 Mio.+ Meter Kabel verlegt" | Aus V3 übernommen, nicht neu belegt. | Bestätigen. |
| 3 | Referenz "VAR-Support für die Swiss Football League" (nur in V3, nicht in V2) | Als zehnte Referenz übernommen (Foto aus der Unternehmensdarstellung, Kategorie "Sportinfrastruktur", Datum 2019, ohne Datum-Anzeige). Nicht auf der Startseite. | Behalten oder im CMS über "Veröffentlicht" ausblenden. |
| 4 | Referenzlogos "NEP Switzerland" und "Swiss Football League" (nur in V3) | In die zentrale Liste aufgenommen (46 Logos). | Bestätigen, dass beide als Referenzumfeld gezeigt werden dürfen. |
| 5 | AGB | V3-Entwurf vom 22. September 2026, auf der Seite ausdrücklich als "Entwurf zur Prüfung" markiert, nicht in der Sitemap. | Juristische Prüfung und Freigabe; danach Hinweis im Text entfernen und "Für Google freigeben" prüfen. |
| 6 | Kanonische Domain und Indexierung | `SITE_URL` fällt auf `https://lwl-techniker-v4.netlify.app` zurück, `robots` sperrt alle Vorschauen. V2 bleibt unter `https://www.lwl-techniker.ch` unverändert. | Zeitpunkt der Umstellung der Domain auf V4 (dann `SITE_URL=https://www.lwl-techniker.ch` und `SITE_INDEXABLE=true` in Netlify setzen). |
| 7 | Google Maps auf der Kontaktseite | Eingebettet wie in V3, Datenschutzabschnitt vorhanden. Beim Laden stellt der Browser eine Verbindung zu Google her (kein Consent-Banner). | Bestätigen oder auf statische Adresse mit Routenlink reduzieren (Häkchen "Karte zeigen" im Kontaktformular-Block). |
| 8 | Preise | In keinem PDF enthalten, auf der Website bewusst nicht gezeigt. | Keine Aktion, falls Preise weiterhin nur auf Anfrage. |
| 9 | Datenblätter mit alter Adresse Romanshorn (32 von 40, Stand 02.09.19) | Unverändert übernommen, Hinweis unter dem Katalog ("können frühere Kontaktangaben enthalten"). | Bei Gelegenheit neue PDF-Fassungen hochladen; die Website aktualisiert Vorschau und Suche automatisch. |
| 10 | Produkte ohne Datenblatt (LWL-Wandverteiler, LWL-Werkzeuge, LWL-Reinigungsmaterial) | Als "Auf Anfrage" im Katalog. | PDF nachreichen oder so belassen. |
| 11 | Technikerporträts | Nur Lulzim Selimi und Arsel Thuma haben ein Foto; die vier Technikerinnen und Techniker erhalten einen neutralen Platzhalter. | Fotos liefern (800 x 1000 px) oder Platzhalter belassen. |
| 12 | Veröffentlichung | Kein Push, kein Repository auf GitHub erstellt, kein Deployment. Schreibziel in `site.config.ts` ist `infraoneit/lwl-techniker-v4`. | Freigabe für Repository-Erstellung, Push, Netlify-Site und GitHub-App für Keystatic. |

## Vor dem ersten Push (Checkliste)

1. `C:\lwl-techniker-v4`: `git init`, `git remote add origin https://github.com/infraoneit/lwl-techniker-v4.git` (Repository zuerst leer auf GitHub anlegen).
2. `npm run verify:repository` (Remote und `GITHUB_REPO` passen, V2/V3 geschützt).
3. `npm ci`, `npm run pruefen`, `npm run build`.
4. `git status`: keine `.env`, keine `.reference/`, keine `.qa/`.
5. Erster Commit und Push nach ausdrücklicher Freigabe.
