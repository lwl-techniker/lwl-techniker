# Gesamtaudit Website V4 (Stand 8. Oktober 2026)

Prüfung der ganzen Website aus Sicht Webentwicklung, Suchmaschinen (SEO), Antwortmaschinen (AEO) und generative KI-Suche (GEO). Grundlage ist der Produktionsbuild mit den produktiven Umgebungswerten (`SITE_URL=https://www.lwl-techniker.ch`, `SITE_INDEXABLE=true`, `CONTEXT=production`), lokal gestartet mit `next start` auf Port 3105. Alle Messwerte stammen von diesem Build, nicht vom Entwicklungsserver.

## Gesamtwertung

| Bereich | Punkte (max. 100) | Kurzfazit |
|---|---|---|
| Technik und Ladezeit | 96 | Lighthouse 100/100/100/100, LCP unter 0.5 s, CLS 0, AVIF, eigene Schriften. |
| On-Page-SEO | 88 | Alles Grundlegende stimmt. Zehn zu lange Titel, zwei Beschreibungen ausserhalb der Norm, dünne Leistungsseiten. |
| Strukturierte Daten | 85 | Sauberer Graph mit Organisation, Service, Article, Produktliste. Es fehlen Geokoordinaten, Öffnungszeiten, Gründungsjahr, UID. |
| Antwortmaschinen (AEO) | 68 | Kein einziger FAQ-Block in Verwendung, Leistungstexte ohne Zwischentitel und ohne Frage-Antwort-Struktur. |
| Generative KI-Suche (GEO) | 86 | llms.txt und llms-full.txt vorhanden, KI-Crawler freigegeben, Fakten zitierfähig. Produkte und Kunden fehlen in der Vollversion. |
| Barrierefreiheit | 98 | axe ohne schwere Verstösse auf neun Routen in beiden Modi, Sprunglink, Tastatur, Fokus. |
| Inhalt und Texte | 80 | Schweizer Schreibweise überall eingehalten, keine Floskeln. Leistungsseiten mit 240 bis 270 Wörtern sind zu knapp, Über uns ohne harte Fakten. |
| Datenschutz und Sicherheit | 84 | Sicherheitsheader gesetzt, Datenschutzerklärung deckt Netlify, Maps, Schriften, Social Media. WhatsApp fehlt, Karte lädt ohne Zustimmung, kein CSP. |
| Mobil und Bedienung | 95 | Kein Überlauf ab 320 px, Kopfzeile einzeilig bis 2560 px, Menüs geprüft. Startseite mit 112 Bildelementen im HTML. |
| CMS und Wartbarkeit | 94 | Keystatic-Abläufe dokumentiert, 25 Tests, Browsertest mit 17 Abschnitten. Keine automatische Prüfung bei jedem Push. |
| **Gesamt (gewichtet)** | **87** | Technisch auf sehr hohem Niveau. Der Abstand zu 100 liegt fast ausschliesslich beim Inhalt: Tiefe, Fragen und Antworten, belegbare Fakten. |

Gewichtung: Technik 15, SEO 15, strukturierte Daten 10, AEO 10, GEO 10, Barrierefreiheit 10, Inhalt 15, Datenschutz 5, Mobil 5, CMS 5.

## Messwerte

| Messung | Ergebnis |
|---|---|
| Geprüfte Seiten (Sitemap plus Impressum, Datenschutz, 404) | 32 |
| Interne Links geprüft / defekt | 73 / 0 |
| Seiten ohne genau ein H1 | 0 |
| Überschriftensprünge (z. B. H1 zu H3) | 0 |
| Bilder ohne Alt-Attribut | 0 |
| Verstösse Textregeln (scharfes S, Gedankenstrich, Ausrufezeichen) | 0 |
| JSON-LD mit Fehlern | 0 |
| Fehlerseite liefert Status 404 mit Inhalt | ja |
| Lighthouse Startseite Desktop / Mobil (Accessibility, Best Practices, SEO, Agentic Browsing) | 100 / 100 / 100 / 100, beide Geräte |
| Lighthouse Leistungsseite Desktop | 100 / 100 / 100 / 100 |
| Startseite: LCP / CLS / Übertragung (Desktop) | 304 ms / 0 / 364 KB (JS 162, Schriften 56, Bilder 43, CSS 15) |
| Startseite: LCP / Übertragung (Mobil) | 344 ms / 356 KB |
| Referenz mit Video (Mobil): LCP / Übertragung | 436 ms / 509 KB (Video lädt erst beim Klick, 28 KB Poster) |
| Startseite HTML roh / gzip | 330 KB / 37 KB |
| Produktkatalog HTML roh / gzip | 264 KB / 45 KB |
| llms.txt / llms-full.txt | 4 KB / 17 KB |
| Open-Graph-Bild | 1200 x 630 px, 81 KB |

Lokale Werte ohne Netzlatenz. Auf Netlify kommen Netzwerkzeit und CDN-Cache dazu, die Grössenordnung bleibt.

## Befunde und Verbesserungen nach Bereich

### 1. Technik und Ladezeit (96)

Stärken: Next.js 16 mit statischem Export aller öffentlichen Seiten, Bilder über `next/image` mit AVIF und WebP, Schriften selbst gehostet (keine Verbindung zu Google), Video erst auf Klick, Canvas-Animation zeitbasiert und bei "Bewegung reduzieren" gedrosselt, kein Layoutsprung.

Verbesserungen:

1. **Startseite mit 112 Bildelementen** im HTML (Logoslider in zwei Farbvarianten plus Verdoppelung für die Endlosschleife, dazu Produktvorschauen). Der gzip-Wert von 37 KB ist unkritisch, der DOM ist es aber: Lighthouse warnt ab etwa 800 Knoten, die Startseite liegt darüber. Empfehlung: im Logoslider nur die Logos der aktiven Farbvariante rendern (Theme ist beim Hydrieren bekannt) oder die zweite Hälfte der Laufschrift per CSS-Verdoppelung statt per DOM lösen. Aufwand: 2 Stunden.
2. **Header `X-Powered-By: Next.js`** wird ausgeliefert. `poweredByHeader: false` in `next.config.ts`. Aufwand: 5 Minuten.
3. **Keine Content-Security-Policy und kein HSTS** in `netlify.toml`. Netlify liefert HSTS nicht automatisch. Empfehlung: `Strict-Transport-Security: max-age=31536000; includeSubDomains` und eine CSP, die Google Maps (frame-src), Netlify Forms und Inline-Skripte für das Theme (Nonce oder Hash) erlaubt. Aufwand: 2 bis 3 Stunden inklusive Test, weil Keystatic unter `/keystatic` eine eigene, lockerere CSP braucht.
4. **Sitemap ohne `lastmod`.** Google nutzt `lastmod` als Signal für Neu-Crawls, `changefreq` und `priority` ignoriert es. Empfehlung: `lastmod` aus dem Datum der Referenz bzw. dem Git-Datum der Inhaltsdatei setzen. Aufwand: 1 Stunde.

### 2. On-Page-SEO (88)

Stärken: Jede Seite mit eigenem Titel, Beschreibung, Canonical auf den eigenen Pfad, Open Graph und Twitter Card, `lang="de-CH"`, Brotkrumen mit BreadcrumbList, saubere Adressen, 308-Weiterleitungen für alte Pfade, robots.txt mit Sitemap und Host, keine "Mehr erfahren"-Links.

Verbesserungen:

1. **Zehn Titel länger als 65 Zeichen** (bis 84), weil der Firmenname per Vorlage angehängt wird. Betroffen: drei Leistungen (Muffenspleissungen 69, Serverräume 75, Fehlerlokalisation 67) und sieben Referenzen (Kerenzerberg 79, Swiss Life Arena 73, FC St. Gallen 84, Weissenstein 69, Thurgau 70, Unternehmen 75, Nationalstrassen 80). Google schneidet nach etwa 60 Zeichen ab, der Firmenname geht verloren. Empfehlung: in Keystatic pro Seite einen kurzen SEO-Titel pflegen (Feld existiert) oder die Vorlage bei langen Titeln auf "| LWL-Techniker" kürzen. Aufwand: 1 Stunde.
2. **Meta-Beschreibung /kunden mit 297 Zeichen** (Google zeigt etwa 155). Die Seite nimmt den Einleitungstext als Ersatz. Empfehlung: eigenes SEO-Feld für /kunden in "Übersichtsseiten > Referenzen" oder Kürzung in `generateMetadata`. Aufwand: 20 Minuten.
3. **Meta-Beschreibung /jobs mit 66 Zeichen** zu kurz, **drei Seiten mit identischer Beschreibung** (Startseite, Impressum, Datenschutz nutzen den Firmenstandard). Aufwand: 20 Minuten.
4. **Impressum und Datenschutz auf noindex.** Beide Seiten sind Vertrauenssignale (UID, Adresse, Verantwortliche). Suchmaschinen und KI-Systeme bewerten die Prüfbarkeit der Firma. Empfehlung: index erlauben, aber aus der Sitemap lassen. Aufwand: 10 Minuten.
5. **Leistungsseiten mit 240 bis 270 Wörtern** und ohne H2 im Fliesstext (nur "Auf einen Blick", "Weitere Leistungen", "Kontakt"). Für Suchanfragen wie "Muffenspleissung Kosten Schweiz" oder "FTTH Installation St. Gallen" fehlt die Tiefe. Siehe Abschnitt Inhalt.
6. **Keine Ortsbezüge in Titeln und H1.** "FTTH-Installation" ohne "Schweiz" oder "St. Gallen" verschenkt lokale Nachfrage. Empfehlung: SEO-Titel mit Region ("FTTH-Installation in der Ostschweiz und schweizweit"), H1 bleibt kurz. Aufwand: 1 Stunde für alle acht Leistungen.

### 3. Strukturierte Daten (85)

Stärken: Ein Graph mit `Organization` und `LocalBusiness` (gemeinsame `@id`), `WebSite`, `Service` je Leistung mit Anbieter, `Article` je Referenz mit `VideoObject`, `ItemList` für Leistungen, Referenzen, Team und Produkte, `BreadcrumbList` auf allen Unterseiten, `Product` mit `DigitalDocument` für Datenblätter. Keine erfundenen Bewertungen oder Preise. Kein Fehler in 32 Seiten.

Verbesserungen:

1. **LocalBusiness ohne `geo`, `openingHoursSpecification`, `hasMap`, `foundingDate`, `vatID`, `numberOfEmployees`.** Alle Werte sind bekannt (UID CHE-302.905.008 steht im Impressum, Adresse Langgasse 136). Diese Felder sind die wichtigsten für Google Maps, Bing Places und KI-Antworten zu "Glasfaserfirma St. Gallen". Empfehlung: Felder in "Einstellungen > Firma" ergänzen (Öffnungszeiten existieren schon, Liste ist leer) und im Graph ausgeben. Aufwand: 2 Stunden.
2. **Service ohne `hasOfferCatalog` und ohne `areaServed` auf Kantonsebene.** Empfehlung: `areaServed` als Liste der Kantone (SG, TG, AR, AI, ZH, SH, GL, GR, FL) plus "Schweiz". Aufwand: 1 Stunde.
3. **Kein `WebPage`-Knoten** je Seite mit `isPartOf`, `primaryImageOfPage`, `dateModified`. Hilft KI-Suchsystemen bei der Aktualität. Aufwand: 1 Stunde.
4. **Teamseite: Personen ohne `knowsAbout` und ohne Verknüpfung zu LinkedIn** (`sameAs`), Über uns ohne Personenknoten. Aufwand: 1 Stunde.

### 4. Antwortmaschinen AEO (68)

Der grösste Abstand zum Maximum. Antwortmaschinen (Google AI Overviews, Bing Copilot, Perplexity) bevorzugen Seiten, die eine konkrete Frage in einem Absatz beantworten und mit Zahlen, Schritten und Definitionen belegen.

Befunde:

1. **Der FAQ-Block existiert im CMS, wird aber auf keiner Seite verwendet.** Jede Leistungsseite sollte vier bis sechs echte Kundenfragen beantworten (Beispiele: "Wie lange dauert eine Muffenspleissung?", "Was kostet ein FTTH-Anschluss im Mehrfamilienhaus?", "Welche Messprotokolle liefern Sie?", "Arbeiten Sie auch nachts im Tunnel?"). Die Antworten dürfen Preise nennen, sonst genügt eine Spanne oder "auf Anfrage, Faktoren sind …". Aufwand: 1 Tag Text mit der Kundschaft, 1 Stunde Einbau.
2. **Leistungstexte ohne Frage-Antwort-Struktur und ohne Zwischentitel.** Empfehlung je Leistung: H2 "Wann Sie diese Leistung brauchen", H2 "So läuft der Auftrag ab" (nummerierte Schritte), H2 "Was Sie von uns bekommen" (Messprotokoll, Dokumentation, Garantie), H2 "Häufige Fragen". Ziel 500 bis 800 Wörter. Aufwand: 2 bis 3 Tage Text.
3. **Keine Definitionen** von Fachbegriffen (OTDR, Muffe, FTTH, Spleiss, Dämpfung). Ein kurzes Glossar (eigene Seite oder Block "Begriffe") liefert zitierfähige Ein-Satz-Definitionen, die Antwortmaschinen direkt übernehmen. Aufwand: halber Tag.
4. **Referenzen ohne messbare Ergebnisse.** Die Texte beschreiben die Aufgabe, selten Zahlen (Kilometer Kabel, Anzahl Spleisse, Dauer, Teamgrösse). Antwortmaschinen zitieren Zahlen. Empfehlung: pro Referenz eine Faktenzeile "Umfang" (bereits Felder für Ort, Datum, Kategorie; "Umfang" ergänzen). Aufwand: 2 Stunden Einbau, Zahlen von der Kundschaft.
5. **Block "Kundenstimmen" vorhanden, aber ohne Inhalt.** Zitate von Auftraggebern (mit Freigabe) sind für AEO und für Vertrauen gleich wertvoll. Erst nach Bestätigung durch die Kundschaft (docs/16).

### 5. Generative KI-Suche GEO (86)

Stärken: `/llms.txt` und `/llms-full.txt` werden beim Build aus dem CMS erzeugt (nichts von Hand gepflegt), robots.txt erlaubt GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Applebot-Extended und weitere ausdrücklich, Lighthouse "Agentic Browsing" 100, Kennzahlen und Firmenangaben als klare Sätze, Sprache und Einsatzgebiet genannt, Hinweis "Preise auf Anfrage" (verhindert Halluzinationen).

Verbesserungen:

1. **llms-full.txt ohne Produkte, Team, Kunden und Über uns.** Die Vollversion enthält Leistungen, Referenzen und Stellen. Empfehlung: Produktkategorien mit Datenblatt-Links, Kundenlogos als Liste der Firmennamen, Über-uns-Text und Team ergänzen. Aufwand: 1 Stunde.
2. **Kein "Zuletzt aktualisiert" je Seite** (weder sichtbar noch in `dateModified`). KI-Systeme bewerten Aktualität. Lösung über Git-Datum der Inhaltsdatei beim Build. Aufwand: 2 Stunden (gemeinsam mit Sitemap-`lastmod`).
3. **Expertise-Signale fehlen** (E-E-A-T): keine Angaben zu Gründungsjahr, Anzahl Mitarbeitende, Ausbildungen, Zertifikaten, Mitgliedschaften (z. B. Swissfibre, VSEI), Herstellerschulungen. Über uns spricht von "Erfahrung" ohne Zahl. Empfehlung: einen Abschnitt "Zahlen und Fakten" mit belegbaren Angaben, abgestimmt mit der Kundschaft. Aufwand: 2 Stunden nach Lieferung der Fakten.
4. **Keine Autorenzuordnung bei Referenzen** (Article hat die Firma als Autor, keine Person). Für Fachtexte ist eine Person mit Funktion glaubwürdiger. Optional.

### 6. Barrierefreiheit (98)

Stärken: axe (WCAG 2.1 A/AA) ohne schwere Verstösse auf neun Routen in hell und dunkel, Sprunglink, sichtbarer Fokus, Tastaturbedienung der Menüs geprüft (Escape, Fokusrückgabe), "Bewegung reduzieren" wird respektiert, Mindestgrösse 44 px für Bedienelemente, Kontraste geprüft, Formular mit Labels, Pflichtkennzeichnung und Autocomplete.

Verbesserungen:

1. **Google-Maps-iframe**: Titel und Tastaturfalle prüfen (axe schliesst iframes aus). Mit Klick-zum-Laden (siehe Datenschutz) entfällt das Problem bis zur Zustimmung.
2. **Logoslider**: Die Verdoppelung für die Endlosschleife ist `aria-hidden`, gut. Die Pause bei Hover und Fokus ist vorhanden, ein sichtbarer Pause-Knopf (WCAG 2.2.2) fehlt. Aufwand: 1 Stunde.

### 7. Inhalt und Texte (80)

Stärken: Durchgehend Schweizer Schreibweise (0 Verstösse auf 32 Seiten), keine Superlative, keine Ausrufezeichen, keine Werbefloskeln, Knöpfe beschreiben die Handlung, AGB final mit Teuerungsklausel, Referenzen vollständig aus dem Kundenmaterial übernommen, Video mit Poster und Beschreibung.

Verbesserungen (Priorität nach Wirkung):

1. **Leistungsseiten zu knapp** (siehe AEO 2). Das ist der wichtigste einzelne Hebel für Rankings und KI-Zitate.
2. **Über uns ohne Fakten**: Gründungsjahr, Teamgrösse, Fahrzeuge und Geräte (OTDR-Typ, Spleissgeräte), Einsatzradius, Reaktionszeit bei Notfällen. Alles belegbar, nichts erfinden.
3. **Jobs-Seite mit 110 Wörtern** und ohne offene Stelle: ein Absatz "So arbeiten wir" und "Initiativbewerbung" mit konkreten Angaben (Pensum, Einsatzgebiet, Anforderungen) hält die Seite auch ohne Inserat relevant.
4. **Kontaktseite mit 193 Wörtern**: Erreichbarkeit (Zeiten, Notfallnummer), Reaktionszeit, was eine Anfrage enthalten sollte (Ort, Umfang, Termin). Senkt Rückfragen und ist AEO-relevant.
5. **Startseite**: Textblock "Fachwissen hat ein Gesicht" entfernt, dadurch fehlt der Startseite ein Vertrauensabschnitt. Ein kurzer Block "Warum LWL-Techniker" mit vier Fakten (ohne Superlative) schliesst die Lücke. Aufwand: 1 Stunde.

### 8. Datenschutz und Sicherheit (84)

Stärken: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` gesetzt, Keystatic und API auf noindex und `no-store`, Schriften lokal, keine Tracker, kein Cookie-Banner nötig (keine Analyse-Cookies), Datenschutzerklärung nennt Netlify, Google Maps, Cookies, Schriften, Kontaktformular, Social Media, Auskunftsrecht, USA-Übermittlung.

Verbesserungen:

1. **WhatsApp fehlt in der Datenschutzerklärung**, obwohl in der Fusszeile verlinkt (Meta Platforms, Datenübermittlung). Aufwand: 15 Minuten Text.
2. **Google-Maps-iframe lädt ohne Zustimmung** auf /kontakt (IP-Adresse geht an Google). Nach revidiertem DSG vertretbar mit Hinweis, sauberer ist Klick-zum-Laden mit statischem Vorschaubild. Aufwand: 2 Stunden.
3. **Datenschutzerklärung ohne Verweis auf das DSG** (Schweizer Datenschutzgesetz, revidiert 1. September 2023) und ohne Hinweis auf die Rolle als Verantwortliche nach DSG. Aufwand: 30 Minuten, Text durch die Kundschaft prüfen lassen.
4. **CSP und HSTS** siehe Technik 3.
5. **Formular**: Honeypot vorhanden, aber kein Rate-Limit und kein Spam-Filter. Netlify Forms bietet Akismet-Filter kostenlos, in Netlify aktivieren. Aufwand: 10 Minuten.

### 9. Mobil und Bedienung (95)

Stärken: kein horizontaler Überlauf ab 320 px, Kopfzeile einzeilig von 375 bis 2560 px, mobiles Menü mit Untermenüs und Knöpfen wie V2, Theme-Schalter, Kacheln mit grossen Klickflächen, Video im Hochformat tauglich, Logoslider pausiert bei Berührung.

Verbesserungen:

1. **Logoslider auf Mobil**: 46 Logos in zwei Varianten werden geladen, obwohl nur eine sichtbar ist (siehe Technik 1).
2. **Produktkatalog mit 264 KB HTML**: 43 Produkte mit Bild und JSON-LD. Auf Mobil akzeptabel (45 KB gzip), bei Wachstum auf 100 Produkte Paginierung oder Laden pro Kategorie vorsehen.
3. **Telefonnummer in der Kopfzeile nur im mobilen Menü** sichtbar, nicht direkt im Header. Für Notfalleinsätze (eine beworbene Leistung) ist ein Anruf-Knopf im Header auf Mobil üblich. Aufwand: 1 Stunde.

### 10. CMS und Wartbarkeit (94)

Stärken: Keystatic mit Singletons und Sammlungen, Team per Ziehen sortierbar, neue Referenz erscheint automatisch auf der Startseite, Produkte per Name und PDF, Bilder automatisch optimiert, `npm run pruefen` mit Konfiguration, Texten, Bildern, TypeScript, ESLint und 25 Tests, Browsertest mit 17 Abschnitten, Dokumentation docs/01 bis 16, Schreibziel-Schutz für V2 und V3.

Verbesserungen:

1. **Keine Prüfung bei jedem Push** (GitHub Actions). Die Kundschaft committet über Keystatic direkt auf `main`, ein fehlerhafter Inhalt (z. B. scharfes S) fällt erst beim nächsten lokalen `npm run pruefen` auf. Empfehlung: Workflow mit `npm run pruefen` und `npm run build` bei Push, Netlify-Deploy nur bei grünem Lauf (Netlify-Build-Hook statt automatischem Deploy). Aufwand: 2 Stunden.
2. **Lighthouse nicht automatisiert.** Lighthouse CI mit Schwellen (Performance 90, Rest 100) im selben Workflow. Aufwand: 1 Stunde.
3. **Bildcache des Entwicklungsservers** liefert bis zu vier Stunden alte Bilder (docs/06 dokumentiert). Ein npm-Skript `dev:frisch`, das `.next/dev/cache/images` leert, spart Rückfragen. Aufwand: 10 Minuten.

## Priorisierte Massnahmen

| Nr. | Massnahme | Wirkung | Aufwand | Bereich |
|---|---|---|---|---|
| 1 | Leistungsseiten ausbauen: Zwischentitel, Ablauf, Lieferumfang, 4 bis 6 Fragen und Antworten je Seite (FAQ-Block) | sehr hoch | 3 Tage (Text mit Kundschaft) | AEO, SEO, Inhalt |
| 2 | LocalBusiness vervollständigen: geo, Öffnungszeiten, hasMap, foundingDate, vatID, areaServed Kantone | hoch | 3 Stunden | Strukturierte Daten, GEO |
| 3 | Zu lange Titel kürzen (10 Seiten), Beschreibungen /kunden und /jobs, drei Dubletten | hoch | 1.5 Stunden | SEO |
| 4 | Über uns mit Zahlen und Fakten, Kennzahlen belegen, Kundenstimmen mit Freigabe | hoch | 1 Tag (Fakten von Kundschaft) | GEO, Inhalt |
| 5 | Sitemap lastmod und dateModified je Seite aus Git-Datum | mittel | 2 Stunden | SEO, GEO |
| 6 | llms-full.txt um Produkte, Kunden, Team, Über uns ergänzen | mittel | 1 Stunde | GEO |
| 7 | Google Maps Klick-zum-Laden, WhatsApp und DSG-Verweis in Datenschutzerklärung | mittel | 3 Stunden | Datenschutz |
| 8 | CSP, HSTS, poweredByHeader aus | mittel | 3 Stunden | Sicherheit |
| 9 | Logoslider: nur aktive Farbvariante rendern, Pause-Knopf | mittel | 3 Stunden | Technik, Barrierefreiheit |
| 10 | GitHub Actions mit pruefen, build und Lighthouse CI | mittel | 3 Stunden | Wartbarkeit |
| 11 | Impressum und Datenschutz indexierbar | klein | 10 Minuten | SEO |
| 12 | Glossar Glasfaserbegriffe | mittel | halber Tag | AEO |
| 13 | Anruf-Knopf im mobilen Header, Kontaktseite mit Erreichbarkeit | klein | 2 Stunden | Mobil, Inhalt |
| 14 | Akismet-Spamfilter in Netlify Forms aktivieren | klein | 10 Minuten | Sicherheit |

Mit Massnahmen 1 bis 6 steigt die Gesamtwertung nach dieser Skala auf etwa 94. Die restlichen Punkte bringen sie auf 97 bis 98. 100 Punkte setzen Inhalte voraus, die nur die Kundschaft liefern kann: belegte Zahlen, Kundenstimmen mit Freigabe, Zertifikate.

## Was nicht geprüft werden konnte

- Echte Ladezeiten über Netlify (CDN, Brotli, Image CDN): nur lokal gemessen. Nach dem ersten produktiven Deploy mit PageSpeed Insights von aussen messen.
- Search Console und Bing Webmaster Tools: erst nach Freigabe der Domain. Beide einrichten, Sitemap einreichen, Rich-Results-Test für Service, Article und LocalBusiness ausführen.
- Google Business Profile: Verknüpfung mit `hasMap` und identischen Firmendaten (Name, Adresse, Telefon) prüfen, sobald der Eintrag bestätigt ist.

## Prüfmittel

- `.qa/audit.mjs`: Crawl aller Sitemap-Seiten mit Playwright (Metadaten, Überschriften, JSON-LD, Alt-Texte, Links, Textregeln), Ergebnis in `.qa/audit.json`.
- `.qa/perf.mjs`: LCP, CLS, TTFB und Übertragung nach Ressourcentyp, Desktop und Mobil.
- Lighthouse über Chrome DevTools (Navigation, Desktop und Mobil).
- `npm run pruefen`, `npm run build`, `npm run test:browser` (alle bestanden, Stand d05589d).

## Stand der Umsetzung (8. Oktober 2026, Block B)

| Nr. | Massnahme | Stand |
|---|---|---|
| 2 | LocalBusiness vervollständigt: geo (OpenStreetMap), Öffnungszeiten Mo bis Fr 07:00 bis 17:00 (aus dem Google-Profil), hasMap, UID, Personenzahl aus dem Team, Einsatzgebiet "Deutschschweiz und Liechtenstein" (auch im Service je Leistung). WebPage-Knoten mit dateModified und primaryImageOfPage auf allen Seiten. | umgesetzt; Gründungsjahr und Google-Profil-Link als CMS-Felder vorbereitet (docs/16 Nr. 18) |
| 3 | Titelvorlage auf Kurznamen "LWL-Techniker" umgestellt, 13 SEO-Titel gekürzt und mit Region versehen, Beschreibungen für /kunden, /jobs, Impressum und Datenschutz eigenständig. | umgesetzt, längster Titel jetzt 64 Zeichen |
| 5 | Sitemap lastmod und dateModified aus der Git-Historie (`scripts/aktualisiert.mjs`, `content/aktualisiert.json`). | umgesetzt |
| 6 | llms-full.txt um Über uns, Kunden, Produkte je Kategorie mit PDF-Links und Team ergänzt; llms.txt mit Einsatzgebiet, Erreichbarkeit und UID. | umgesetzt |
| 7 | Google Maps erst auf Klick, Datenschutzerklärung mit DSG, WhatsApp und Datenherausgabe. | umgesetzt, Text prüfen lassen (docs/16 Nr. 19) |
| 8 | Content-Security-Policy (next.config.ts, eigene Regel für /keystatic), HSTS (netlify.toml), X-Powered-By entfernt. Akismet nur in der Netlify-Oberfläche möglich (docs/16 Nr. 20). | umgesetzt |
| 9 | Logoslider | bewusst unverändert: kein Pausenknopf (Vorgabe der Kundschaft), DOM-Verkleinerung ohne messbaren Nutzen bei LCP 0.3 s |
| 11 | Impressum und Datenschutz indexierbar (neuer Schalter "In Suchmaschinen anzeigen"), bleiben ausserhalb der Sitemap. | umgesetzt |
| 12 | GitHub Actions | offen, Entscheid der Kundschaft (docs/16 Nr. 21) |
| 13 | Anruf-Knopf in der Kopfzeile auf Mobil, Kontaktseite mit Erreichbarkeit und Angaben für Offerten, Jobs-Seite mit Initiativbewerbung, Startseite mit Block "Warum LWL-Techniker" (vier Punkte aus Über uns). | umgesetzt |
