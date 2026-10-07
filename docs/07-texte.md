# 7. Texte und Sprache

Die Texte entscheiden, ob Besucherinnen und Besucher Vertrauen fassen. Sie sollen klingen wie ein erfahrener Fachbetrieb, der weiss, wovon er spricht. Nicht wie Werbung und nicht wie ein generierter Text.

## Harte Regeln (werden automatisch geprüft)

| Regel | Falsch | Richtig |
| --- | --- | --- |
| Kein scharfes S (Schweizer Schreibweise) | Strasse und gross mit Eszett geschrieben | Strasse, gross, Grüsse |
| Keine Gedankenstriche | Einschub mit langem Strich | Komma, Klammer oder zwei Sätze |
| Kein Bindestrich mit Leerzeichen als Einschub | Planung (Leerzeichen, Strich, Leerzeichen) Ausführung | Planung und Ausführung |
| Zeiträume mit "bis" | Zahl, Strich, Zahl | Montag bis Freitag, 07:30 bis 17:00 |
| Keine mehrfachen Ausrufezeichen | Jetzt anfragen!! | Anfrage senden |

Durchgesetzt an drei Stellen:

1. **im CMS**: Textfelder lassen sich mit diesen Zeichen nicht speichern
2. **beim Ausgeben**: Was trotzdem in einen Fliesstext gelangt, wird automatisch korrigiert (scharfes S zu ss, Strich zwischen Zahlen zu "bis", Gedankenstrich zu Komma)
3. **bei der Prüfung**: `npm run pruefen:texte` meldet Verstösse in Inhalten, Code und Dokumentation als Fehler. Im Netlify-Build erscheinen Verstösse in Inhalten als Warnung, damit eine Korrektur der Kundschaft nicht blockiert wird

## Bindestriche richtig setzen

Zusammengesetzte Wörter mit Abkürzungen, Fremdwörtern oder Zahlen werden mit Bindestrich gekoppelt, **ohne** Leerzeichen:

| Falsch | Richtig |
| --- | --- |
| E-Mail Adresse | E-Mail-Adresse |
| SEO Titel | SEO-Titel |
| Alt Text | Alt-Text |
| 3 Zimmer Wohnung | 3-Zimmer-Wohnung |
| Elektro Projektleiter | Elektro-Projektleiter |

Ergänzungsstriche bleiben ebenfalls: "Vor- und Nachname", "Sanitär- und Heizungsinstallation".

## Tonalität

- **Konkret statt allgemein.** Zahlen, Orte, Abläufe. "Wir melden uns innert eines Arbeitstages" statt "Wir sind schnell für Sie da".
- **Belegbar.** Nur schreiben, was stimmt und die Kundschaft bestätigen kann. Keine erfundenen Kennzahlen, Kundenstimmen oder Auszeichnungen.
- **Ruhig.** Keine Superlative, keine Ausrufezeichen, keine künstliche Dringlichkeit.
- **Sie-Form**, ausser die Kundschaft wünscht ausdrücklich Du (z. B. Stelleninserate für Lernende).
- **Vollständige Sätze.** Keine Satzfragmente wie "Mit eigenem Team, klaren Terminen und einer Ansprechperson."
- **Keine Slogan-Paare.** "Verbindlich im Ablauf, sorgfältig im Detail" klingt generiert. Besser ein sachlicher Titel: "So arbeiten wir mit Ihnen zusammen".
- **Kurze Sätze.** Ein Gedanke pro Satz. Absätze mit höchstens vier Sätzen.
- **Aktiv.** "Wir prüfen die Anlage" statt "Die Anlage wird von uns geprüft".
- **Nutzen vor Eigenlob.** Was hat die Kundschaft davon, nicht wie gut die Firma ist.
- **Einheitlich und inklusiv.** Neutrale Formen bevorzugen: Bauherrschaft, Kundschaft, Mitarbeitende. Innerhalb einer Website nicht wechseln.
- **Schweizer Begriffe.** innert, Offerte, Pikett, Lernende, Verwaltung. Keine Anglizismen, wenn es ein gebräuchliches deutsches Wort gibt.

## Floskeln vermeiden

Diese Wörter und Wendungen wirken austauschbar oder generiert. `npm run pruefen:texte` warnt, wenn sie in Inhalten vorkommen:

| Vermeiden | Stattdessen zum Beispiel |
| --- | --- |
| In der heutigen schnelllebigen Zeit | direkt mit der Aussage beginnen |
| Ihr zuverlässiger Partner für | was die Firma konkret macht und für wen |
| ganzheitliche, innovative Lösungen | die tatsächliche Leistung benennen |
| alles aus einer Hand | "Planung, Ausführung und Service durch dasselbe Team" |
| höchste Qualität, erstklassig | woran man die Qualität erkennt (Prüfprotokolle, Garantie) |
| mit Leidenschaft und Herzblut | weglassen |
| massgeschneidert, nahtlos, optimal, perfekt | weglassen oder konkret sagen, was angepasst wird |
| Entdecken Sie, Tauchen Sie ein | "Referenzen ansehen" |
| Zögern Sie nicht, uns zu kontaktieren | "Rufen Sie uns an: 071 000 00 00" |

Die vollständige Liste steht in `scripts/pruefe-texte.mjs` und kann ergänzt werden.

## Aufbau von Seitentexten

- **Haupttitel (H1)**: die wichtigste Aussage, konkret. "Elektroinstallationen für Neubauten im Thurgau" statt "Willkommen".
- **Einleitung**: 1 bis 2 Sätze, wer, was, wo.
- **Knöpfe und Links**: die Handlung beschreiben. "Offerte anfragen", "Referenzen ansehen", "Zur Leistung". Nicht "Mehr", "Mehr erfahren" oder "Hier klicken".
- **SEO-Titel**: höchstens 60 Zeichen, Leistung und Ort. Der Firmenname wird automatisch angehängt.
- **SEO-Beschreibung**: 120 bis 160 Zeichen, ein vollständiger Satz.

## Texte mit KI erstellen

KI darf Entwürfe liefern. Vor der Veröffentlichung gilt:

1. Jede Aussage mit der Kundschaft prüfen, nichts erfinden
2. Floskeln, Satzfragmente und Slogan-Paare entfernen, Sätze kürzen
3. `npm run pruefen:texte` ohne Fehler und mit begründeten Warnungen
4. Einmal laut lesen. Klingt es wie ein Mensch aus dem Betrieb, passt es.
