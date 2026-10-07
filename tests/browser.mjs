/**
 * BROWSERPRÜFUNG (echter Chromium)
 *
 * Prüft die Punkte, die im Code allein nicht belegbar sind:
 *   1. Menüwechsel ohne sichtbares nachträgliches Hochscrollen (bekannter V2-Fehler): nach jedem Routenwechsel
 *      steht die Seite sofort oben, auch beim erneuten Klick auf die aktuelle Route.
 *   2. Desktop-Untermenüs: öffnen per Klick, Escape schliesst und setzt den Fokus zurück, Klick ausserhalb schliesst.
 *   3. Mobiles Menü (Dialog): öffnen, Untermenü aufklappen, Link wählen, Dialog geschlossen, Seite oben.
 *   4. Farbmodus: Schalter wechselt data-theme, Wahl bleibt nach Neuladen erhalten, keine Hydrationfehler in der Konsole.
 *   5. Lightmode-Logos: im hellen Modus sind farbige Logos sichtbar, im dunklen Modus die Silhouetten.
 *   6. Accessibility (axe, WCAG 2.1 A/AA) auf den wichtigsten Routen in beiden Modi.
 *   7. Kein horizontaler Überlauf bei 320 px.
 *
 * Aufruf: Website starten (npm run build && npm start) und dann `npm run test:browser`.
 * Basisadresse über TEST_BASE_URL überschreibbar. Chromium über PLAYWRIGHT_CHROMIUM (Pfad) wählbar.
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.TEST_BASE_URL || 'http://localhost:3104';
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
const protokoll = [];
const ok = (text) => protokoll.push(`OK  ${text}`);

try {
  // Desktop -------------------------------------------------------------------------------------------
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const seite = await desktop.newPage();
  const konsole = [];
  seite.on('console', (m) => {
    if (m.type() === 'error' || /hydrat/i.test(m.text())) konsole.push(m.text());
  });
  seite.on('pageerror', (e) => konsole.push(e.message));

  await seite.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(await seite.locator('h1').count(), 1, 'Startseite hat genau einen H1');
  assert.equal(await seite.locator('canvas').count(), 1, 'V2-Hintergrundanimation (Canvas) vorhanden');
  ok('Startseite: ein H1, Canvas-Animation vorhanden');

  // 1. Routenwechsel ohne Hochscrollen
  const ziele = [
    ['Leistungen', '/leistungen'],
    ['Produkte', '/produkte'],
    ['Referenzen', '/referenzen'],
    ['Über uns', '/ueber-uns'],
  ];
  for (const [name, pfad] of ziele) {
    await seite.evaluate(() => window.scrollTo({ top: 1800, behavior: 'instant' }));
    const knopf = seite.getByRole('button', { name: `${name} Untermenü`, exact: true });
    await knopf.click();
    const panel = seite.locator(`#untermenue-${pfad.replace(/\W+/g, '')}`);
    await panel.waitFor({ state: 'visible' });
    await panel.locator(`a[href="${pfad}"]`).first().click();
    await seite.waitForURL(`**${pfad}`);
    await seite.waitForLoadState('networkidle');
    const y = await seite.evaluate(() => window.scrollY);
    assert.equal(y, 0, `${name}: Seite beginnt oben (scrollY=${y})`);
    const yNachher = await seite.evaluate(() => new Promise((r) => setTimeout(() => r(window.scrollY), 400)));
    assert.equal(yNachher, 0, `${name}: kein nachträgliches Scrollen (scrollY=${yNachher})`);
  }
  ok('Routenwechsel über Untermenüs: sofort oben, kein nachträgliches Scrollen');

  // Erneuter Klick auf dieselbe Route
  await seite.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }));
  await seite.getByRole('button', { name: 'Über uns Untermenü', exact: true }).click();
  await seite.locator('#untermenue-ueberuns a[href="/ueber-uns"]').click();
  await seite.waitForTimeout(300);
  assert.equal(await seite.evaluate(() => window.scrollY), 0, 'Gleiche Route: sofort oben');
  ok('Erneuter Klick auf aktuelle Route scrollt sofort nach oben');

  // Direkter Link (Kontakt) und Logo
  await seite.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await seite.locator('header nav a[href="/kontakt"]').click();
  await seite.waitForURL('**/kontakt');
  await seite.waitForLoadState('networkidle');
  assert.equal(await seite.evaluate(() => window.scrollY), 0, 'Kontakt beginnt oben');
  await seite.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await seite.locator('header a[href="/"]').first().click();
  await seite.waitForURL(`${base}/`);
  await seite.waitForLoadState('networkidle');
  assert.equal(await seite.evaluate(() => window.scrollY), 0, 'Startseite über Logo beginnt oben');
  ok('Direkte Links (Kontakt, Logo) beginnen oben');

  // Zurück-Taste: Browser stellt alte Position selbst her, wir greifen nicht ein (Position darf > 0 sein)
  await seite.goBack();
  await seite.waitForLoadState('networkidle');
  ok(`Browser-Zurück funktioniert (Adresse ${new URL(seite.url()).pathname})`);

  // 2. Desktop-Untermenü: Escape und Klick ausserhalb
  await seite.goto(`${base}/`, { waitUntil: 'networkidle' });
  const leistungenKnopf = seite.getByRole('button', { name: 'Leistungen Untermenü', exact: true });
  await leistungenKnopf.click();
  assert.equal(await seite.locator('#untermenue-leistungen a').count(), 9, 'Leistungen-Untermenü: Alle Leistungen plus acht Leistungen');
  await seite.keyboard.press('Escape');
  assert.equal(await seite.locator('#untermenue-leistungen').isVisible(), false, 'Escape schliesst das Untermenü');
  assert.equal(await seite.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Leistungen Untermenü', 'Fokus kehrt zum Menüpunkt zurück');
  await leistungenKnopf.click();
  await seite.mouse.click(720, 700);
  assert.equal(await seite.locator('#untermenue-leistungen').isVisible(), false, 'Klick ausserhalb schliesst das Untermenü');
  await seite.getByRole('button', { name: 'Produkte Untermenü', exact: true }).click();
  const produktLinks = await seite.locator('#untermenue-produkte a').count();
  assert.ok(produktLinks >= 10, `Produkte-Untermenü enthält Kategorien (${produktLinks} Einträge)`);
  await seite.keyboard.press('Escape');
  ok('Desktop-Untermenüs: Escape, Fokusrückgabe, Klick ausserhalb, Produktkategorien');

  // Kategorie-Link filtert den Katalog
  await seite.getByRole('button', { name: 'Produkte Untermenü', exact: true }).click();
  await seite.locator('#untermenue-produkte a[href*="kategorie="]').first().click();
  await seite.waitForURL('**/produkte?kategorie=*');
  await seite.waitForLoadState('networkidle');
  const gewaehlt = await seite.locator('#produkt-kategorie').inputValue();
  assert.notEqual(gewaehlt, 'Alle Kategorien', 'Kategorie aus der Adresse ist vorgewählt');
  ok(`Kategorie-Link filtert den Katalog (${gewaehlt})`);

  // 4. Farbmodus
  await seite.goto(`${base}/`, { waitUntil: 'networkidle' });
  const vorher = await seite.evaluate(() => document.documentElement.dataset.theme ?? '');
  await seite.getByRole('button', { name: /Erscheinungsbild einschalten/ }).click();
  const nachher = await seite.evaluate(() => document.documentElement.dataset.theme ?? '');
  assert.notEqual(vorher, nachher, 'Schalter ändert data-theme');
  await seite.reload({ waitUntil: 'networkidle' });
  assert.equal(await seite.evaluate(() => document.documentElement.dataset.theme), nachher, 'Wahl bleibt nach Neuladen erhalten');
  ok(`Farbmoduswechsel gespeichert (jetzt "${nachher}")`);

  // 5. Logos im hellen Modus sichtbar
  await seite.evaluate(() => {
    localStorage.setItem('lwl-theme', 'hell');
    document.documentElement.dataset.theme = 'hell';
  });
  await seite.goto(`${base}/referenzen/allgemein`, { waitUntil: 'networkidle' });
  const farbigSichtbar = await seite.locator('.logo-farbig').first().evaluate((el) => getComputedStyle(el).display !== 'none');
  const silhouetteVersteckt = await seite.locator('.logo-silhouette:not(.immer)').first().evaluate((el) => getComputedStyle(el).display === 'none');
  assert.ok(farbigSichtbar && silhouetteVersteckt, 'Hell: farbige Logos sichtbar, Silhouetten verborgen');
  await seite.evaluate(() => {
    localStorage.setItem('lwl-theme', 'dunkel');
    document.documentElement.dataset.theme = 'dunkel';
  });
  await seite.reload({ waitUntil: 'networkidle' });
  const silhouetteSichtbar = await seite.locator('.logo-silhouette').first().evaluate((el) => getComputedStyle(el).display !== 'none');
  assert.ok(silhouetteSichtbar, 'Dunkel: Silhouetten sichtbar');
  ok('Referenzlogos: Originalfarben im hellen, Silhouetten im dunklen Modus');

  // 6. axe in beiden Modi
  const routen = ['/', '/leistungen', '/produkte', '/referenzen', '/referenzen/allgemein', '/ueber-uns', '/team', '/kontakt'];
  for (const modus of ['dunkel', 'hell']) {
    await seite.evaluate((m) => localStorage.setItem('lwl-theme', m), modus);
    for (const r of routen) {
      await seite.goto(`${base}${r}`, { waitUntil: 'networkidle' });
      // Einblendanimationen des Startbereichs abwarten, sonst misst axe Farben während der Überblendung
      await seite.waitForTimeout(2200);
      const ergebnis = await new AxeBuilder({ page: seite }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('iframe').analyze();
      const schwer = ergebnis.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      assert.equal(schwer.length, 0, `${modus} ${r}: axe ${schwer.map((v) => `${v.id} (${v.nodes.length})`).join(', ')}`);
    }
  }
  ok('axe (WCAG 2.1 A/AA): keine schweren Verstösse auf acht Routen in beiden Modi');

  assert.deepEqual(
    konsole.filter((t) => !/favicon|net::ERR|Failed to load resource|google\.com/i.test(t)),
    [],
    'keine Konsolenfehler oder Hydrationwarnungen'
  );
  ok('Keine Konsolenfehler, keine Hydrationwarnungen');
  await desktop.close();

  // Mobile --------------------------------------------------------------------------------------------
  const mobil = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true });
  const m = await mobil.newPage();
  await m.goto(`${base}/`, { waitUntil: 'networkidle' });
  await m.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  await m.getByRole('button', { name: 'Menü öffnen' }).click();
  const dialog = m.locator('dialog');
  assert.equal(await dialog.evaluate((d) => d.open), true, 'Mobiles Menü öffnet als Dialog');
  await dialog.getByRole('button', { name: 'Leistungen Untermenü' }).click();
  await dialog.getByRole('link', { name: 'Muffenspleissungen', exact: true }).click();
  await m.waitForURL('**/leistungen/muffenspleissungen');
  await m.waitForLoadState('networkidle');
  assert.equal(await dialog.evaluate((d) => d.open), false, 'Dialog nach Auswahl geschlossen');
  assert.equal(await m.evaluate(() => window.scrollY), 0, 'Mobile Zielseite beginnt oben');
  await m.getByRole('button', { name: 'Menü öffnen' }).click();
  await m.keyboard.press('Escape');
  assert.equal(await dialog.evaluate((d) => d.open), false, 'Escape schliesst das mobile Menü');
  ok('Mobiles Menü: öffnen, Untermenü, Auswahl schliesst, Seite oben, Escape');

  // 7. Kein Überlauf bei 320 px
  const schmal = await browser.newContext({ viewport: { width: 320, height: 640 } });
  const s = await schmal.newPage();
  for (const r of ['/', '/produkte', '/referenzen', '/kontakt', '/team']) {
    await s.goto(`${base}${r}`, { waitUntil: 'networkidle' });
    const breite = await s.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(breite <= 320, `${r}: kein horizontaler Überlauf bei 320 px (${breite})`);
  }
  ok('320 px: kein horizontaler Überlauf auf fünf Routen');
  await schmal.close();
  await mobil.close();

  // Team-Daten
  const t = await browser.newPage();
  await t.goto(`${base}/team`, { waitUntil: 'networkidle' });
  assert.equal(await t.locator('[data-team="leitung"] li').count(), 2, 'Zwei Personen in der Geschäftsleitung');
  assert.equal(await t.locator('[data-team="technik"] li').count(), 4, 'Vier Personen in der Technik');
  assert.equal(await t.getByText('Lindi Selimi').count(), 0, 'Lindi Selimi erscheint nicht');
  ok('Team: 2 Leitung, 4 Technik, keine entfernte Person');
  await t.close();

  console.log(protokoll.join('\n'));
  console.log('\nBrowserprüfung bestanden.');
} finally {
  await browser.close();
}
