import { llmsVoll } from '@/lib/llms';

/** /llms-full.txt: vollständige Texte der Leistungen, Referenzen und Stellen für Sprachmodelle (src/lib/llms.ts). */
export const dynamic = 'force-static';

export async function GET() {
  return new Response(await llmsVoll(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
