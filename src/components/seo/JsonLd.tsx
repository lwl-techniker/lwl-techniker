/** Gibt strukturierte Daten für Google sicher aus (verhindert das Schliessen des Script-Tags). */
export function JsonLd({ daten }: { daten: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(daten).replaceAll('<', '\\u003c') }} />;
}
