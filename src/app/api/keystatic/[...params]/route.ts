import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '@/keystatic.config';

/**
 * Keystatic-API.
 *
 * makeRouteHandler prüft im GitHub-Modus sofort, ob die Umgebungsvariablen vorhanden sind,
 * und wirft sonst einen Fehler. Würde das beim Laden der Datei passieren, bräche jeder Build
 * ohne .env ab. Deshalb wird der Handler erst bei der ersten Anfrage erzeugt.
 * Auf Netlify stellt scripts/pruefe-konfiguration.mjs sicher, dass die Variablen gesetzt sind.
 */

export const dynamic = 'force-dynamic';

type Handler = ReturnType<typeof makeRouteHandler>;
let handler: Handler | null = null;

function ausfuehren(methode: 'GET' | 'POST', anfrage: Request) {
  try {
    handler ??= makeRouteHandler({ config });
  } catch (fehler) {
    console.error(fehler);
    return new Response(
      'Keystatic ist nicht vollständig eingerichtet. Es fehlen die Umgebungsvariablen KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET, KEYSTATIC_SECRET und NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG. Anleitung: docs/03-github-verbinden.md',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
  return handler[methode](anfrage);
}

export function GET(anfrage: Request) {
  return ausfuehren('GET', anfrage);
}

export function POST(anfrage: Request) {
  return ausfuehren('POST', anfrage);
}
