# V4: Referenzinventar

Alle Referenzen aus V2 (Commit `f2127e0`) sind vollständig übernommen: Frontmatter, Projektbeschrieb (Markdoc), Titelbild, Galerie, Fakten (Bauherrschaft, Ort, Kategorie, Abschluss), Reihenfolge (neuste zuerst über `datum`) und interne Verlinkung (`/referenzen/<slug>`, "Weitere Referenzen"). Die Darstellung stammt aus V2 (`Karten.tsx`, `ReferenzenBlock.tsx`, `Galerie.tsx`, `referenzen/[slug]/page.tsx`); Kopf- und Fusszeile aus V3.

Die Bilddateien wurden byteidentisch aus V2 übernommen (`public/bilder/referenzen/...`). Der Inhaltstest `tests/inhalte.test.mjs` prüft bei jedem `npm test`, dass alle neun V2-Slugs vorhanden, veröffentlicht und ihre Bilder erreichbar sind.

| Referenz | Slug | Datum | Kategorie | Titelbild | Galerie | Herkunft | Übernommen |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FTTH-Netz für die Gemeinde Ramsen SH | `ftth-netz-ramsen` | 2025-09-01 | FTTH-Ausbau | nein | 0 | V2 | ja |
| FTTH-Projekte in der Ostschweiz, im Raum Zürich und in Liechtenstein | `ftth-projekte-ostschweiz` | 2019-11-21 | FTTH-Projekte | ja | 0 | V2 | ja |
| Fünfjahres-Auftrag für das Glasfasernetz in vier Thurgauer Gemeinden | `glasfasernetz-thurgauer-gemeinden` | 2025-11-01 | FTTH-Ausbau | nein | 0 | V2 | ja |
| Anlagen für Unternehmen, Bahnhöfe und öffentliche Bauten | `inhouse-installationen-fuer-unternehmen` | 2019-11-19 | Inhouse-Installationen | ja | 0 | V2 | ja |
| Kamera- und Trackingsystem im Stadion des FC St. Gallen | `kamera-tracking-stadion-fc-st-gallen` | 2026-05-01 | Sportinfrastruktur | ja | 3 | V2 | ja |
| Notfalleinsatz nach Kabelschaden durch einen Bagger | `notfalleinsatz-kabelschaden-bagger` | 2026-04-01 | Notfalleinsatz | nein | 0 | V2 | ja |
| Sicherheitssystem mit Glasfaser im Tunnel Kerenzerberg | `sicherheitssystem-tunnel-kerenzerberg` | 2026-07-01 | Tunnel-Sicherheitstechnik | ja | 2 | V2 | ja |
| Verkehrstechnik auf Nationalstrassen und in Tunnels | `verkehrstechnik-nationalstrassen-und-tunnel` | 2019-11-19 | Verkehrstechnik | ja | 0 | V2 | ja |
| Glasfaserarbeiten im Weissenstein-Tunnel bei Solothurn | `weissenstein-tunnel-solothurn` | 2026-03-01 | Verkehrstechnik | ja | 1 | V2 | ja |
| VAR-Support für die Swiss Football League | `var-support-swiss-football-league` | 2019-07-21 | Sportinfrastruktur | ja | 0 | V3 (Ergänzung) | ja, siehe offene Entscheidungen |

Startseite: Block "Referenzen" zeigt automatisch die vier neusten (Kerenzerberg, FC St. Gallen, Notfalleinsatz, Weissenstein), identisch mit der V2-Liveansicht. Mit dem Häkchen "Auf Startseite zeigen" lässt sich die Auswahl im CMS steuern.

Links geprüft: Alle internen Links der Referenzen (Übersicht, Detailseiten, "Weitere Referenzen", Logoslider nach `/referenzen/allgemein`) wurden im Browser aufgerufen (Prüfprotokoll). In den Referenztexten gibt es keine externen Links; defekte Links wurden keine gefunden.

Referenzlogos: 44 Logos aus V2 plus "NEP Switzerland" und "Swiss Football League" aus V3 (Dateien PNG als Silhouette, WebP in Farbe). Die zentrale Liste liegt in `content/einstellungen/uebersichten.json` unter `referenzen.logos` und speist Logoslider, `/referenzen` und `/referenzen/allgemein`.
