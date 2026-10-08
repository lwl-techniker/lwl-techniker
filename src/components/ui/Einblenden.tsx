'use client';

import { useEffect } from 'react';

/**
 * Blendet alle Elemente mit dem Attribut data-einblenden beim Scrollen weich ein.
 * Einmal im Layout eingebunden, keine weitere Bibliothek nötig.
 *
 * Verwendung in beliebigen (auch Server-)Komponenten:
 *   <div data-einblenden>...</div>
 *
 * Geschwister mit data-einblenden (z. B. Kacheln in einem Raster) werden über :nth-child in globals.css gestaffelt.
 * Eigene Staffelung: style={{ '--einblenden-index': i } as React.CSSProperties}
 *
 * Bei "Bewegung reduzieren" übernimmt globals.css eine reine Überblendung ohne Verschiebung (sanfter statt aus).
 */
export function Einblenden() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

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
        // Die automatische Staffelung innerhalb eines Rasters regelt globals.css über :nth-child (kein Inline-Stil:
        // ein vor der Hydration gesetztes style-Attribut meldet React im Entwicklungsmodus als Abweichung)
        beobachter.observe(el);
      });
    };

    // Erst nach dem Laden der Seite starten: Teile in Suspense-Grenzen (z. B. der Produktkatalog) werden später hydriert,
    // und ein vorher geändertes data-einblenden meldet React im Entwicklungsmodus als Abweichung.
    let startVerzug = 0;
    const starten = () => {
      startVerzug = window.setTimeout(() => {
        anmelden();
        document.documentElement.classList.add('js-einblenden');
      }, 0);
    };
    if (document.readyState === 'complete') starten();
    else window.addEventListener('load', starten, { once: true });

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
      window.clearTimeout(startVerzug);
      window.removeEventListener('load', starten);
      beobachter.disconnect();
      aenderungen.disconnect();
    };
  }, []);

  return null;
}
