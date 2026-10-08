import type { NextConfig } from 'next';

const entwicklung = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy der Website. Statische Seiten ohne Nonce, deshalb 'unsafe-inline' für Skripte
 * (Next.js schreibt Hydrationsdaten inline) und Styles; externe Skripte sind damit trotzdem gesperrt.
 * - frame-src: nur Google Maps (Karte auf der Kontaktseite, erst auf Klick geladen)
 * - form-action 'self': Netlify Forms sendet an /__forms.html
 * - Entwicklung: zusätzlich 'unsafe-eval' und WebSockets für die Live-Aktualisierung
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${entwicklung ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  'frame-src https://www.google.com',
  `connect-src 'self'${entwicklung ? ' ws: wss:' : ''}`,
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  ...(entwicklung ? [] : ['upgrade-insecure-requests']),
].join('; ');

/** Keystatic (CMS) lädt Bilder und Daten von GitHub und braucht eine lockerere Regel. Nur unter /keystatic. */
const CSP_CMS = "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self'";

const nextConfig: NextConfig = {
  // Kein "X-Powered-By: Next.js" (verrät die Technik, bringt nichts)
  poweredByHeader: false,
  // Die Einrichtung der Keystatic-GitHub-App läuft über http://127.0.0.1:3000/keystatic.
  // Ohne diese Freigabe blockiert der Entwicklungsserver die Live-Aktualisierung für diese Adresse.
  allowedDevOrigins: ['127.0.0.1'],
  // Bildformate wählt auf Netlify das Image CDN selbst (AVIF oder WebP je nach Browser).
  // Die Einstellung gilt nur für npm start ausserhalb von Netlify.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Alte V3-Adressen (nie öffentlich, aber in Vorschauen verlinkt) auf den Datenblattkatalog umleiten
  async redirects() {
    return [
      { source: '/produkte/:slug', destination: '/produkte', permanent: true },
      // Allgemeine Referenzen (Logos) heissen seit 8. Oktober 2026 /kunden
      { source: '/referenzen/allgemein', destination: '/kunden', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
      // Spätere Regeln überschreiben gleichnamige Header der allgemeinen Regel (CSP für das CMS)
      {
        source: '/keystatic/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Content-Security-Policy', value: CSP_CMS },
        ],
      },
      {
        source: '/api/keystatic/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Content-Security-Policy', value: CSP_CMS },
        ],
      },
    ];
  },
};

export default nextConfig;
