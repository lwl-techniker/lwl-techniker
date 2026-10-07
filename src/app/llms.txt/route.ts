import { llmsKurz } from '@/lib/llms';

/** /llms.txt: Übersicht der Website für Sprachmodelle, beim Build statisch erzeugt (src/lib/llms.ts). */
export const dynamic = 'force-static';

export async function GET() {
  return new Response(await llmsKurz(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
