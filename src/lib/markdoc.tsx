import 'server-only';
import React from 'react';
import Link from 'next/link';
import Markdoc, { type Config, type Node, type RenderableTreeNode } from '@markdoc/markdoc';
import { sauberText } from './text';

/**
 * Wandelt Keystatic Markdoc-Inhalte in React um.
 *
 * Wichtig: @markdoc/markdoc ist auf die Version fixiert, die @keystatic/core selbst verwendet.
 * Bei einem Keystatic-Update die Version in package.json angleichen (npm ls @markdoc/markdoc).
 */

const config: Config = {
  nodes: {
    text: {
      transform(node) {
        return sauberText(String(node.attributes.content ?? ''));
      },
    },
    heading: {
      render: 'Ueberschrift',
      attributes: { level: { type: Number, required: true } },
    },
    link: {
      render: 'Verweis',
      attributes: { href: { type: String, required: true }, title: { type: String } },
    },
    image: {
      render: 'Abbildung',
      attributes: { src: { type: String, required: true }, alt: { type: String }, title: { type: String } },
    },
    table: { render: 'Tabelle' },
  },
};

function Ueberschrift({ level, children }: { level: number; children: React.ReactNode }) {
  const Tag = (`h${Math.min(Math.max(level, 2), 4)}`) as 'h2' | 'h3' | 'h4';
  return <Tag>{children}</Tag>;
}

function Verweis({ href, title, children }: { href: string; title?: string; children: React.ReactNode }) {
  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} title={title ? sauberText(title) : undefined}>
        {children}
      </Link>
    );
  }
  const extern = href.startsWith('http');
  return (
    <a href={href} title={title ? sauberText(title) : undefined} {...(extern ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

/**
 * Markdoc setzt Bilder in einen Absatz (<p>). Ein <figure> darin wäre ungültiges HTML und würde
 * die Hydration der ganzen Seite stören. Deshalb nur <span>-Elemente, als Block dargestellt.
 */
function Abbildung({ src, alt, title }: { src: string; alt?: string; title?: string }) {
  return (
    <span className="abbildung">
      {/* eslint-disable-next-line @next/next/no-img-element -- Masse sind bei Bildern im Fliesstext unbekannt */}
      <img src={src} alt={sauberText(alt ?? '')} loading="lazy" decoding="async" />
      {title ? <span className="abbildung-text">{sauberText(title)}</span> : null}
    </span>
  );
}

function Tabelle({ children }: { children: React.ReactNode }) {
  return (
    <div className="tabelle-scroll">
      <table>{children}</table>
    </div>
  );
}

type MarkdocWert = { node: Node } | (() => Promise<{ node: Node }>) | null | undefined;

/** Markdoc als HTML-Text, z. B. für die Stellenbeschreibung in strukturierten Daten (Google Jobs). */
export async function markdocAlsHtml(wert: MarkdocWert): Promise<string> {
  if (!wert) return '';
  const aufgeloest = typeof wert === 'function' ? await wert() : wert;
  const htmlConfig: Config = { nodes: { text: config.nodes!.text! } };
  const html = Markdoc.renderers.html(Markdoc.transform(aufgeloest.node, htmlConfig));
  // Markdoc umschliesst das Dokument mit <article>, das braucht es in strukturierten Daten nicht
  return html.replace(/^<article>/, '').replace(/<\/article>$/, '');
}

/** Nimmt den Wert eines Keystatic Markdoc-Feldes (auch die Lazy-Funktion) und gibt React zurück. */
export async function renderMarkdoc(wert: MarkdocWert): Promise<React.ReactNode> {
  if (!wert) return null;
  const aufgeloest = typeof wert === 'function' ? await wert() : wert;
  const fehler = Markdoc.validate(aufgeloest.node, config);
  if (fehler.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Markdoc Hinweise:', fehler.map((f) => f.error.message));
  }
  const baum: RenderableTreeNode = Markdoc.transform(aufgeloest.node, config);
  return Markdoc.renderers.react(baum, React, {
    components: { Ueberschrift, Verweis, Abbildung, Tabelle },
  });
}
