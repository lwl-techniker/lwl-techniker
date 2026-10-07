# 6. Bilder

Grosse Bilder sind der häufigste Grund für langsame Websites. In älteren Projekten liegen Fotos mit über 4 MB im Repository. Das passiert in neuen Projekten nicht mehr.

## Grössen und Formate

| Verwendung | Breite | Dateigrösse | Format |
| --- | --- | --- | --- |
| Startbereich, volle Breite | 2400 px | unter 400 KB | WebP oder JPG |
| Inhaltsbild, halbe Breite | 1600 px | unter 250 KB | WebP oder JPG |
| Kachel, Referenz | 1600 px | unter 200 KB | WebP oder JPG |
| Porträt Team | 800 x 1000 px (4:5) | unter 120 KB | WebP oder JPG |
| Logo | Vektor | unter 30 KB | SVG, sonst PNG |
| Social-Media-Vorschau | 1200 x 630 px | unter 200 KB | JPG |

Nicht erlaubt: HEIC (Fotos vom iPhone), TIFF, BMP, PSD. Browser zeigen diese nicht zuverlässig an.

Grenzen der automatischen Prüfung (`npm run pruefen:bilder`):

| Prüfung | Warnung | Fehler |
| --- | --- | --- |
| Dateigrösse | ab 500 KB | ab 1.5 MB |
| Abmessung | über 2560 px | |
| Name | Grossbuchstaben | Leerzeichen, Umlaute, Sonderzeichen |
| Format | GIF | HEIC, TIFF, BMP, PSD |

Zu grosse Bilder verkleinern:

```bash
git add -A
git commit -m "vor Bildoptimierung"
npm run bilder:optimieren
```

Das Skript verkleinert auf 2560 px, komprimiert neu und behält Dateiname und Endung, damit alle Verweise gültig bleiben.

## Dateinamen

Für Bilder, die **von Hand** abgelegt werden (Logos, Icons, feste Grafiken):

- nur Kleinbuchstaben, Zahlen, Bindestrich
- keine Umlaute, keine Leerzeichen: `ae`, `oe`, `ue` schreiben
- beschreibend, auf Deutsch: `schaltanlage-neubau-schulhaus-romanshorn.webp`
- Endung klein: `.jpg`, nicht `.JPG`
- Ablage in `public/bilder/statisch/` (Ordner bei Bedarf anlegen)

Falsch: `IMG_4032.JPG`, `Firmengebäude.jpeg`, `hero bild final2.png`

Bilder, die **im CMS hochgeladen** werden, benennt Keystatic selbst (siehe [02-keystatic.md](02-keystatic.md), Abschnitt Bilder). Dort zählt für Google der Alt-Text.

**Wichtig:** Windows unterscheidet nicht zwischen `Bild.jpg` und `bild.jpg`, Netlify schon. Ein falsch geschriebener Pfad funktioniert lokal und fehlt online. Die Konfigurationsprüfung vergleicht deshalb die exakte Schreibweise.

## Alt-Texte

- Pflicht für jedes Inhaltsbild (im CMS erzwungen, auch im Fliesstext)
- sachlich beschreiben, was zu sehen ist: "Monteur verdrahtet eine Unterverteilung im Technikraum"
- nicht "Bild von", keine Aufzählung von Suchbegriffen
- reine Stimmungsbilder hinter Text (Startbereich) dürfen leer bleiben

## Im Code

- Immer `next/image` verwenden, nie `<img>` (Ausnahme: Fliesstext aus Markdoc)
- Bei `fill` immer `sizes` angeben, passend zum Raster. Beispiele in `src/components/karten/Karten.tsx`
- Nur das grösste Bild im sichtbaren Bereich beim Laden bevorzugen: `loading="eager"` und `fetchPriority="high"`. Das frühere `priority` ist seit Next.js 16 veraltet
- Netlify optimiert `next/image` automatisch über das Image CDN und liefert AVIF oder WebP aus
- SVG-Logos mit `unoptimized` einbinden

## Fotos von der Kundschaft

Fotos kommen oft direkt vom Handy (4 bis 12 MB, teils HEIC). Vor dem Hochladen im CMS verkleinern, z. B. mit https://squoosh.app (WebP, Qualität 75 bis 80, Breite 2400 px). Der Hinweis steht auch im CMS beim Bildfeld und in [10-anleitung-kundschaft.md](10-anleitung-kundschaft.md).
