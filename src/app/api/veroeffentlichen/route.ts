import { timingSafeEqual } from 'node:crypto';
import { GITHUB_REPO } from '@/site.config';

/**
 * Veröffentlichung auslösen: startet den GitHub-Workflow "Prüfung und Veröffentlichung" (workflow_dispatch).
 * Der Workflow prüft und baut den aktuellen Stand von main und ruft erst bei grünem Lauf den Netlify-Build-Hook auf.
 *
 * Schutz: Kennwort aus der Umgebungsvariable VEROEFFENTLICHEN_KENNWORT (Netlify), Vergleich in konstanter Zeit,
 * Wartezeit bei falschem Kennwort. Der GitHub-Zugriff läuft über GITHUB_WORKFLOW_TOKEN (nur Actions: write).
 * Beide Werte stehen nur in Netlify, nie im Code. Fehlen sie, meldet die Seite "nicht eingerichtet".
 */
export const dynamic = 'force-dynamic';

const WORKFLOW = 'pruefung.yml';

function gleich(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function antwort(status: number, text: string) {
  return Response.json({ ok: status < 300, text }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(anfrage: Request) {
  const kennwort = process.env.VEROEFFENTLICHEN_KENNWORT ?? '';
  const token = process.env.GITHUB_WORKFLOW_TOKEN ?? '';
  if (kennwort.length < 12 || !token) {
    return antwort(503, 'Die Veröffentlichung ist noch nicht eingerichtet (VEROEFFENTLICHEN_KENNWORT und GITHUB_WORKFLOW_TOKEN in Netlify, siehe docs/18-veroeffentlichung.md).');
  }

  let eingabe = '';
  try {
    const daten = await anfrage.json();
    eingabe = typeof daten?.kennwort === 'string' ? daten.kennwort : '';
  } catch {
    return antwort(400, 'Ungültige Anfrage.');
  }

  if (!gleich(eingabe, kennwort)) {
    await new Promise((r) => setTimeout(r, 1500));
    return antwort(401, 'Das Kennwort stimmt nicht.');
  }

  const github = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main', inputs: { veroeffentlichen: true } }),
  });

  if (github.status !== 204) {
    const text = await github.text().catch(() => '');
    console.error('GitHub workflow_dispatch fehlgeschlagen', github.status, text.slice(0, 300));
    return antwort(502, `GitHub hat die Veröffentlichung nicht angenommen (Status ${github.status}). Bitte den Webmaster informieren.`);
  }

  return antwort(200, 'Die Prüfung läuft. Bei Erfolg ist die Website in etwa zehn Minuten aktualisiert. Bei einem Fehler erhält der Webmaster eine E-Mail von GitHub, die bisherige Website bleibt online.');
}
