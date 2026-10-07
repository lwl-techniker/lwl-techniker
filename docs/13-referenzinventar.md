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

## Abgleich mit dem Kundenmaterial vom 16. September 2026 (Stand 7. Oktober 2026)

Ordner `Kundenmaterial_2026-09-16` (sieben Success Stories als E-Mail-Texte mit Bildern und drei Videos, Logos, Teamangaben vom 21. September 2026). Die Texte waren für Social Media geschrieben und sind auf der Website sachlich formuliert (Freigabe der Kundschaft am 21. September 2026).

| Story | Referenz auf der Website | Bilder der Kundschaft | Übernommen | Video |
| --- | --- | --- | --- | --- |
| 1 Fibrolaser (Juli 2026) | `sicherheitssystem-tunnel-kerenzerberg` | 5 | Titelbild und 4 Galeriebilder (2 neu am 7. Oktober 2026) | keines |
| 2 Eishockey-WM, Swiss Life Arena (Juni 2026) | `swiss-life-arena-zuerich` (neu am 7. Oktober 2026, fehlte bisher) | 4 | Titelbild und 2 Galeriebilder; das IIHF-Logo (Bild 1) wird nicht verwendet (fremde Marke) | keines |
| 3 FC St. Gallen (Mai 2026) | `kamera-tracking-stadion-fc-st-gallen` | 6 | Titelbild und 5 Galeriebilder (2 neu) | keines |
| 4 Weissenstein-Tunnel (März 2026) | `weissenstein-tunnel-solothurn` | 3 (zwei davon nur 240 x 320 px) | Titelbild und 1 Galeriebild wie bisher; das Portalbild mit 240 px wurde wegen der Auflösung nicht übernommen | ja, 54 s, 3.4 MB |
| 5 Kabelschaden Bagger (April 2026) | `notfalleinsatz-kabelschaden-bagger` | keine, nur Video | Titelbild aus dem Video (Standbild) | ja, 7 s, 0.6 MB |
| 6 Thurgauer Gemeinden, Bischofszell (November 2025) | `glasfasernetz-thurgauer-gemeinden` | 4 | Titelbild und 3 Galeriebilder (alle neu) | keines |
| 7 Ramsen SH (September 2025) | `ftth-netz-ramsen` | 4 | Titelbild und 3 Galeriebilder (alle neu) | ja, 7 s, 1.3 MB |

Videos: Felder `video`, `videoposter` und `videotext` bei den Referenzen (`src/keystatic.config.ts`), Darstellung über `src/components/ui/Video.tsx` (Standbild mit Abspielsymbol, Laden erst beim Klick, `preload="none"`), strukturierte Daten als `VideoObject`. Komprimiert mit ffmpeg (H.264, höchstens 540 px breit, CRF 27 bis 30, Ton mono 48 bis 64 kbit/s), Originale bleiben im Kundenordner. Bilder auf höchstens 2000 px und unter 330 KB verkleinert (`sharp`, JPEG 80).

Logos: Die 43 Logodateien der Kundschaft sind bis auf Lidl in der zentralen Liste (46 Einträge inklusive NEP und Swiss Football League aus V3). Lidl ist in `scripts/logos-verarbeiten.mjs` bewusst ausgeschlossen (rundes Mehrfarb-Badge ohne Rand ergibt keine erkennbare weisse Silhouette).

Team: Angaben vom 21. September 2026 (Funktion, Mobilnummer, E-Mail der vier Technikerinnen und Techniker) stimmen mit `content/team` überein. Porträt von Zelije Selimi am 7. Oktober 2026 ergänzt: freigestelltes PNG der Kundschaft auf den gleichen hellen Hintergrund wie die anderen Porträts gesetzt (416 x 520 px, WebP). Die Porträts von David Thuma, Christian Colaci und Edwin Stefanov fehlen weiterhin (Platzhalter). m.weber@lwl-techniker.ch ist nicht mehr auf der Website. UID CHE-302.905.008 MWST im Impressum ergänzt.
