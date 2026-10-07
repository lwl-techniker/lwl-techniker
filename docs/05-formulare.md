# 5. Formulare mit Netlify Forms

Netlify Forms nimmt Formulardaten entgegen, filtert Spam und verschickt E-Mails. Mit Next.js gilt eine feste Regel, die in älteren Projekten oft falsch umgesetzt ist: **Formulare senden an `/__forms.html`**.

## Warum das so ist

Netlify erkennt Formulare nur in statischem HTML, das beim Deploy vorliegt. Next.js-Seiten werden aber von React erzeugt. Deshalb gibt es:

1. eine versteckte statische Datei `public/__forms.html`, in der jedes Formular mit allen Feldnamen steht
2. das sichtbare React-Formular, das per `fetch` an genau diese statische Datei sendet

Sendet ein Formular an `/`, an eine Seite oder an `/.netlify/forms`, landet die Anfrage bei Next.js statt bei Netlify und kann verloren gehen. Quelle: https://opennext.js.org/netlify/forms

## So ist es in der Vorlage gelöst

| Datei | Aufgabe |
| --- | --- |
| `src/formulare/formulare.json` | **Einzige Stelle**, an der Formulare und Felder definiert werden |
| `scripts/erzeuge-formulare.mjs` | Erzeugt daraus `public/__forms.html`, läuft vor jedem Build automatisch |
| `src/components/formulare/NetlifyFormular.tsx` | Zeigt das Formular an und sendet es korrekt |

Weil beide Seiten aus derselben JSON-Datei entstehen, können Feldnamen nie auseinanderlaufen.

## Feld hinzufügen

In `src/formulare/formulare.json`:

```json
{ "name": "adresse", "typ": "text", "label": "Adresse der Liegenschaft", "pflicht": false, "autocomplete": "street-address", "breite": "voll" }
```

Typen: `text`, `email`, `tel`, `auswahl`, `textbereich`, `zustimmung`. Danach `npm run formulare` ausführen oder `npm run dev` neu starten. Sonst ist nichts anzupassen.

## Neues Formular (z. B. Offertanfrage)

1. In `formulare.json` einen neuen Schlüssel anlegen, z. B. `"offerte": { "emailBetreff": "...", "felder": [...] }`. Name nur Kleinbuchstaben und Bindestriche.
2. Verwenden: `<NetlifyFormular name="offerte" kontaktEmail={...} kontaktTelefon={...} />`
3. Deployen. In Netlify erscheint das neue Formular. E-Mail-Benachrichtigung dafür einrichten.

## Pflichtregeln

1. `netlify`, `data-netlify` und `netlify-honeypot` gehören **nur** in `public/__forms.html`, nie in React-Code. Dort bewirken sie nichts und führen zur falschen Annahme, das Formular sei angebunden. Die Konfigurationsprüfung bricht den Build in diesem Fall ab.
2. Senden immer so:

```ts
await fetch('/__forms.html', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(formData).toString(),
});
```

3. Jedes Formular enthält das versteckte Feld `form-name` mit dem Formularnamen.
4. Spamschutz über das Honigtopf-Feld `bot-field`. Es ist für Menschen unsichtbar und muss leer bleiben. Zusätzlich prüft Netlify jede Einsendung mit Akismet.
5. Das versteckte Feld `subject` setzt den Betreff der Benachrichtigung.
6. Ein Feld mit dem Namen `email` wird in der Benachrichtigung automatisch als Antwortadresse verwendet.
7. Checkbox für die Einwilligung immer mit `name`, sonst wird sie nicht übermittelt.
8. Fehlermeldung mit Telefon und E-Mail-Adresse anzeigen, damit keine Anfrage verloren geht.
9. Den Text nach dem Senden im CMS pflegen (Block Kontaktformular). Nur versprechen, was eingehalten wird.

Die Konfigurationsprüfung findet Verstösse gegen Regel 1 und 2 automatisch.

## Lokal testen

Unter `npm run dev` gibt es kein Netlify. Das Formular zeigt deshalb einen **Testmodus**-Hinweis und schreibt die Daten in die Browser-Konsole. Echte Tests erst auf einer Netlify-Deploy-Vorschau oder online.

## Dateiuploads

Netlify erlaubt Dateien bis 8 MB pro Anfrage. Dafür muss das Formular als `multipart/form-data` ohne eigenen Content-Type-Header gesendet werden. Die Vorlage unterstützt das bewusst nicht, weil Bewerbungen per E-Mail datenschutzfreundlicher sind. Falls nötig, zuerst mit der Kundschaft den Datenschutz klären.

## Netlify-Einstellungen

- **Forms, Enable form detection** (einmalig)
- **Notifications, Form submission notifications** mit Empfängeradresse
- Spam landet unter **Forms, Spam submissions** und kann dort freigegeben werden
