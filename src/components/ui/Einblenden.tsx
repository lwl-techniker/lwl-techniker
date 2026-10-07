'use client';

import { useEffect } from 'react';

/**
 * Blendet alle Elemente mit dem Attribut data-einblenden beim Scrollen weich ein.
 * Einmal im Layout eingebunden, keine weitere Bibliothek nötig.
 *
 * Verwendung in beliebigen (auch Server-)Komponenten:
 *   <div data-einblenden>...</div>
 *
 * Geschwister mit data-einblenden (z. B. Kacheln in einem Raster) werden automatisch gestaffelt.
 * Eigene Staffelung: style={{ '--einblenden-index': i } as React.CSSProperties}
 */
export function Einblenden() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (eintrag.isIntersecting) {
            eintrag.target.setAttribute('data-einblenden', 'sichtbar');
            beobachter.unobserve(eintrag.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const anmelden = (wurzel: ParentNode = document) => {
      wurzel.querySelectorAll<HTMLElement>('[data-einblenden]:not([data-einblenden="sofort"], [data-einblenden="sichtbar"])').forEach((el) => {
        // Was beim Laden schon im Bild ist, bleibt ruhig stehen (kein Aufblitzen)
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.setAttribute('data-einblenden', 'sofort');
          return;
        }
        // Automatische Staffelung innerhalb eines Rasters, höchstens 4 Stufen pro Reihe
        if (!el.style.getPropertyValue('--einblenden-index') && el.parentElement) {
          const geschwister = [...el.parentElement.children].filter((k) => k.hasAttribute('data-einblenden'));
          const index = geschwister.indexOf(el);
          if (index > 0) el.style.setProperty('--einblenden-index', String(index % 4));
        }
        beobachter.observe(el);
      });
    };

    anmelden();
    document.documentElement.classList.add('js-einblenden');

    // Nach einem Seitenwechsel im Browser nur die neu eingefügten Teile prüfen
    const aenderungen = new MutationObserver((liste) => {
      for (const eintrag of liste) {
        eintrag.addedNodes.forEach((knoten) => {
          if (!(knoten instanceof Element)) return;
          if (knoten.matches('[data-einblenden]') && knoten.parentElement) anmelden(knoten.parentElement);
          else anmelden(knoten);
        });
      }
    });
    aenderungen.observe(document.body, { childList: true, subtree: true });

    return () => {
      beobachter.disconnect();
      aenderungen.disconnect();
    };
  }, []);

  return null;
}
