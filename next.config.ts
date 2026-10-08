import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
        ],
      },
      {
        source: '/keystatic/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/api/keystatic/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },
};

export default nextConfig;
