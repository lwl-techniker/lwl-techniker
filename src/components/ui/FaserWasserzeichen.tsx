import { useId, type CSSProperties } from 'react';

/**
 * Wasserzeichen aus V3 (fiber-hero.tsx, FiberWatermark): Der Faserschwung des Firmenlogos, die Konturen kommen
 * als Maske direkt aus dem Logo. Lichtimpulse laufen die Fasern entlang und lassen die Spitzen aufleuchten.
 * Rein dekorativ (aria-hidden). Steht bei "Bewegung reduzieren" still (globals.css).
 */
const FASERN = [
  { pfad: 'M78 297 C-8 252 -16 161 31 87 C73 17 166 -25 237 28', x: 237, y: 28 },
  { pfad: 'M52 289 C-6 232 -8 160 33 93 C73 30 142 1 202 23', x: 202, y: 23 },
  { pfad: 'M48 263 C-4 205 1 146 42 94 C91 32 174 16 232 58', x: 232, y: 58 },
  { pfad: 'M78 297 C-8 252 -17 172 34 95 C103 -5 243 3 293 109', x: 293, y: 109 },
];

export function FaserWasserzeichen({ className }: { className?: string }) {
  const id = useId().replaceAll(':', '');
  return (
    <div className={['faser-wasserzeichen', className].filter(Boolean).join(' ')} aria-hidden>
      <svg className="faser-fluss" viewBox="0 0 370 350">
        <defs>
          <filter id={`${id}-weich`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={`${id}-farbe`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 -1 0 0  1 0 -1 0 0  1 0 -1 0 0  0 0 0 1 0" />
          </filter>
          <mask id={`${id}-maske`} x="0" y="0" width="305" height="302" maskUnits="userSpaceOnUse" style={{ maskType: 'luminance' }}>
            <image href="/bilder/firma/logohell.png" width="724" height="302" filter={`url(#${id}-farbe)`} />
          </mask>
          <linearGradient id={`${id}-basis`} x1="0" y1="1" x2="1" y2="0">
            <stop className="fluss-start" />
            <stop className="fluss-ende" offset="1" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop className="fluss-halo" stopOpacity=".9" />
            <stop className="fluss-halo" offset=".35" stopOpacity=".35" />
            <stop className="fluss-halo" offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(30 22)">
          <g mask={`url(#${id}-maske)`}>
            <path fill={`url(#${id}-basis)`} d="M0 0h305v302H0z" />
            {FASERN.map((f, i) => (
              <g key={i} filter={`url(#${id}-weich)`} style={{ '--fluss-verzug': `${-i * 0.82}s` } as CSSProperties}>
                <path className="fluss-paket fluss-paket-schweif" d={f.pfad} pathLength="100" />
                <path className="fluss-paket fluss-paket-kern" d={f.pfad} pathLength="100" />
              </g>
            ))}
          </g>
          {FASERN.map((f, i) => (
            <g className="fluss-ankunft" key={i} style={{ '--fluss-verzug': `${-i * 0.82}s` } as CSSProperties}>
              <circle cx={f.x} cy={f.y} r="25" fill={`url(#${id}-halo)`} />
              <circle className="fluss-spitze" cx={f.x} cy={f.y} r="3.2" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
