const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** YYYY-MM-DD zu "März 2026" */
export function monatJahr(iso: string | null | undefined): string {
  if (!iso) return '';
  const [jahr, monat] = iso.split('-');
  const index = Number(monat) - 1;
  if (!jahr || index < 0 || index > 11) return '';
  return `${MONATE[index]} ${jahr}`;
}

/** YYYY-MM-DD zu "16. März 2026" */
export function datumLang(iso: string | null | undefined): string {
  if (!iso) return '';
  const [jahr, monat, tag] = iso.split('-');
  const index = Number(monat) - 1;
  if (!jahr || !tag || index < 0 || index > 11) return '';
  return `${Number(tag)}. ${MONATE[index]} ${jahr}`;
}

/** Heutiges Datum als YYYY-MM-DD in Schweizer Zeit. Wird beim Build ausgewertet. */
export function heuteIso(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date());
}
