'use client';

import { useEffect, useRef } from 'react';
import { holeAktivesTheme, THEMA_GEAENDERT } from '@/lib/theme';

/**
 * Faserschwung: Der gelb-orange Schwung aus dem Logo, als LWL-Kabel gedacht. Vier Faserbänder laufen
 * in engen, verschieden langen Bögen von links unten über die Bildmitte und enden gestaffelt, jedes
 * Band besteht aus sechs feinen, leicht verdrillten Fasern (Verlauf Gelb zu Orange wie im Logo).
 * Beim Laden ziehen sich die Bänder auf. Danach senden die Fasern Lichtpulse in Schüben, die den Bogen
 * entlanglaufen, und am Faserende blitzt das Licht kurz auf. Ein Leuchtsaum um die Bänder atmet langsam.
 * Liegt fest hinter der ganzen Seite, auf der Startseite füllt der Startbereich den Bildschirm.
 *
 * Rücksicht: Bei "Bewegung reduzieren" wird ein einzelnes, ruhiges Bild gezeichnet.
 * Im Hintergrund-Tab pausiert die Animation. Die Zeichenfläche ist für Screenreader unsichtbar.
 */
type Faser = {
  band: number;
  /** Abstand zur Bandmitte in Pixeln (Bogenrichtung nach aussen) */
  abstand: number;
  /** Verdrillung: Amplitude in Pixeln, Wellen pro Bogen, Phase, Geschwindigkeit */
  amp: number;
  freq: number;
  phase: number;
  tempo: number;
  /** Anfangs- und Endwinkel in Radiant */
  a0: number;
  a1: number;
  /** Verzögerung beim Aufziehen */
  verzug: number;
  alpha: number;
  breite: number;
  kern: boolean;
};

type Puls = { faser: number; pos: number; tempo: number; staerke: number };
type Aufblitzen = { faser: number; leben: number; staerke: number };

/** Vier Bänder wie im Logo: von aussen nach innen kürzer, Winkel in Grad (0 = rechts, 270 = oben) */
const BAENDER = [
  { s: 1, a0: 166, a1: 306 },
  { s: 0.925, a0: 169, a1: 296 },
  { s: 0.855, a0: 172, a1: 288 },
  { s: 0.79, a0: 175, a1: 280 },
];
const FASERN_PRO_BAND = 6;
const PUNKTE = 160;
const AUFBAU_ENDE = 1.2;

const grad = (g: number) => (g * Math.PI) / 180;
const begrenzen = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
const leicht = (x: number) => 1 - Math.pow(1 - x, 3);

/** Liest eine CSS-Farbvariable (z. B. "--color-grund") und gibt sie als "r,g,b" für rgba() zurück. */
function leseFarbvariable(name: string, ersatz: string): string {
  const wert = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const bereinigt = wert.replace('#', '');
  if (bereinigt.length !== 6) return ersatz;
  const r = parseInt(bereinigt.substring(0, 2), 16);
  const g = parseInt(bereinigt.substring(2, 4), 16);
  const b = parseInt(bereinigt.substring(4, 6), 16);
  return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? ersatz : `${r},${g},${b}`;
}

export function Faserwellen() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let breite = 0;
    let hoehe = 0;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let fasern: Faser[] = [];
    let pulse: Puls[] = [];
    let blitze: Aufblitzen[] = [];
    let t = 0;
    let aufbau = ruhig ? AUFBAU_ENDE : 0;
    let naechsterSchub = 0;
    let anfrage = 0;
    let aktiv = true;
    // Erscheinungsbild: Im hellen Modus verblasst das Bild zu Weiss statt zu Nachtblau, die Farben
    // sind kräftiger und die Lichtpulse leuchten normal statt additiv (additiv verschwindet auf hellem Grund).
    let hell = holeAktivesTheme() === 'hell';
    let grundFarbe = leseFarbvariable('--color-grund', hell ? '244,245,250' : '8,17,46');

    const zufall = (min: number, max: number) => min + Math.random() * (max - min);
    const punkt = { x: 0, y: 0 };

    /** Ort einer Faser bei u (0 = Anfang, 1 = Ende): Bogen des Bandes plus Abstand plus Verdrillung */
    const setzePunkt = (f: Faser, u: number) => {
      const b = BAENDER[f.band];
      const a = f.a0 + (f.a1 - f.a0) * u + Math.sin(t * 0.25 + f.band) * 0.012;
      const r = f.abstand + Math.sin(u * f.freq * Math.PI * 2 + f.phase + t * f.tempo) * f.amp;
      punkt.x = mx + (rx * b.s + r) * Math.cos(a);
      punkt.y = my + Math.sin(t * 0.3) * hoehe * 0.012 + (ry * b.s + r) * Math.sin(a);
    };

    /** Wie weit die Faser schon aufgezogen ist (0 bis 1) */
    const fortschritt = (f: Faser) => leicht(begrenzen((aufbau - f.band * 0.08 - f.verzug) / 0.7, 0, 1));

    const spurZiehen = (f: Faser, von: number, bis: number) => {
      const n = Math.max(2, Math.ceil(PUNKTE * (bis - von)));
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        setzePunkt(f, von + ((bis - von) * i) / n);
        if (i === 0) ctx.moveTo(punkt.x, punkt.y);
        else ctx.lineTo(punkt.x, punkt.y);
      }
    };

    const aufbauen = () => {
      const spreizung = Math.max(8, hoehe * 0.011);
      fasern = [];
      BAENDER.forEach((b, band) => {
        for (let i = 0; i < FASERN_PRO_BAND; i++) {
          const kern = i === Math.floor(FASERN_PRO_BAND / 2);
          fasern.push({
            band,
            abstand: (i / (FASERN_PRO_BAND - 1) * 2 - 1) * spreizung + zufall(-1.5, 1.5),
            amp: kern ? 1 : zufall(1.2, 3.2),
            freq: zufall(2, 5),
            phase: Math.random() * Math.PI * 2,
            tempo: zufall(0.4, 1) * (Math.random() < 0.5 ? -1 : 1),
            a0: grad(b.a0 + zufall(-2, 2)),
            a1: grad(b.a1 + zufall(-3, 3)),
            verzug: zufall(0, 0.06),
            alpha: kern ? 0.8 : zufall(0.3, 0.55),
            breite: kern ? 1.7 : zufall(0.7, 1.2),
            kern,
          });
        }
      });
      pulse = [];
      blitze = [];
      naechsterSchub = 0;
    };

    const groesse = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      breite = window.innerWidth;
      hoehe = window.innerHeight;
      canvas.width = Math.round(breite * dpr);
      canvas.height = Math.round(hoehe * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Mittelpunkt des grossen Kreises liegt unter dem Bildschirm, der Scheitel des äusseren Bandes bei rund 47 % der Höhe
      mx = breite * 0.55;
      my = hoehe * 1.09;
      rx = Math.max(breite * 0.62, hoehe * 0.42);
      ry = hoehe * 0.62;
      aufbauen();
    };

    /**
     * Zufälliges Tempo für einen einzelnen Puls: die meisten liegen im mittleren Bereich,
     * einzelne sind sehr langsam oder sehr schnell unterwegs (Faktor 10 zwischen den Extremen),
     * wie unterschiedliche Datenpakete im selben Kabel.
     */
    const pulsTempo = () => {
      const r = Math.random();
      if (r < 0.12) return zufall(0.0012, 0.0022); // sehr langsam
      if (r > 0.88) return zufall(0.012, 0.02); // sehr schnell
      return zufall(0.0025, 0.005); // normal
    };

    /** Ein Schub: mehrere Fasern senden fast gleichzeitig einen Puls, mit stark unterschiedlichem Tempo */
    const schub = () => {
      const anzahl = Math.round(zufall(4, 8));
      for (let i = 0; i < anzahl && pulse.length < 70; i++) {
        pulse.push({ faser: Math.floor(Math.random() * fasern.length), pos: -0.02 - Math.random() * 0.06, tempo: pulsTempo(), staerke: zufall(0.5, 1) });
      }
      naechsterSchub = t + zufall(2, 3.6);
    };

    const zeichnen = (bewegt: boolean) => {
      ctx.clearRect(0, 0, breite, hoehe);
      if (bewegt) {
        t += 0.012;
        if (aufbau < AUFBAU_ENDE) aufbau += 0.006;
      }
      // Atmen des ganzen Bildes
      const atem = 0.5 + 0.5 * Math.sin(t * 1.3);
      const hellFaktor = hell ? 1.4 : 1;
      const gelb = hell ? '214,158,0' : '240,214,0';
      const orange = hell ? '204,96,8' : '240,128,16';

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Leuchtsaum: drei sehr dünne Lagen ergeben einen weichen Rand ohne harte Kante, Anfang und Ende bleiben frei
      ctx.lineCap = 'butt';
      for (const f of fasern) {
        if (!f.kern) continue;
        const p = fortschritt(f);
        if (p < 0.3) continue;
        const lagen = [
          { breite: Math.max(44, hoehe * 0.055), alpha: 0.006 },
          { breite: Math.max(24, hoehe * 0.03), alpha: 0.01 },
          { breite: Math.max(11, hoehe * 0.013), alpha: 0.014 },
        ];
        for (const lage of lagen) {
          spurZiehen(f, 0.22, p - 0.06);
          ctx.strokeStyle = `rgba(240,180,0,${(lage.alpha + lage.alpha * atem) * hellFaktor})`;
          ctx.lineWidth = lage.breite;
          ctx.stroke();
        }
      }
      ctx.lineCap = 'round';

      // Fasern: Verlauf von Gelb zu Orange, am Anfang weich eingeblendet und am Ende zart auslaufend
      for (const f of fasern) {
        const p = fortschritt(f);
        if (p < 0.01) continue;
        setzePunkt(f, 0);
        const x0 = punkt.x;
        const y0 = punkt.y;
        setzePunkt(f, p);
        const verlauf = ctx.createLinearGradient(x0, y0, punkt.x, punkt.y);
        const alpha = Math.min(1, f.alpha * hellFaktor * (0.85 + 0.15 * atem));
        verlauf.addColorStop(0, `rgba(${gelb},0)`);
        verlauf.addColorStop(0.3, `rgba(${gelb},${alpha})`);
        verlauf.addColorStop(0.85, `rgba(${orange},${alpha})`);
        verlauf.addColorStop(1, `rgba(${orange},${alpha * 0.3})`);
        spurZiehen(f, 0, p);
        ctx.strokeStyle = verlauf;
        ctx.lineWidth = f.breite;
        ctx.stroke();
      }

      // Lichtpulse: Schweif entlang der Faser und leuchtender Kopf.
      // Additiv gemischt im dunklen Modus (leuchtet auf Nachtblau), normal gemischt im hellen Modus
      // (additiv verschwindet auf hellem Grund) mit kräftigerer Bernstein-Farbe statt Fast-Weiss.
      if (bewegt && aufbau > 0.6 && t >= naechsterSchub) schub();
      ctx.globalCompositeOperation = hell ? 'source-over' : 'lighter';
      const schweifKopf = hell ? '200,120,0' : '255,230,120';
      const glutKern = hell ? '190,115,0' : '255,250,220';
      for (const pl of pulse) {
        if (bewegt) pl.pos += pl.tempo;
        const f = fasern[pl.faser];
        const kopf = Math.min(pl.pos, 1);
        // Pulse blenden am Anfang weich ein
        const huelle = Math.min(1, kopf / 0.14);
        if (kopf <= 0 || kopf > fortschritt(f)) continue;
        // Schnelle Pulse ziehen einen längeren Schweif, langsame einen kurzen
        const start = Math.max(0, kopf - (0.06 + Math.min(pl.tempo, 0.02) * 4));
        setzePunkt(f, start);
        const sx = punkt.x;
        const sy = punkt.y;
        setzePunkt(f, kopf);
        const schweif = ctx.createLinearGradient(sx, sy, punkt.x, punkt.y);
        schweif.addColorStop(0, 'rgba(240,200,0,0)');
        schweif.addColorStop(1, `rgba(${schweifKopf},${0.5 * pl.staerke * huelle})`);
        spurZiehen(f, start, kopf);
        ctx.strokeStyle = schweif;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const radius = 6 + 5 * pl.staerke;
        const glut = ctx.createRadialGradient(punkt.x, punkt.y, 0, punkt.x, punkt.y, radius);
        glut.addColorStop(0, `rgba(${glutKern},${0.75 * pl.staerke * huelle})`);
        glut.addColorStop(0.35, `rgba(240,200,0,${0.32 * pl.staerke * huelle})`);
        glut.addColorStop(1, 'rgba(240,168,0,0)');
        ctx.fillStyle = glut;
        ctx.beginPath();
        ctx.arc(punkt.x, punkt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Am Faserende tritt das Licht aus und blitzt kurz auf
      for (const pl of pulse) if (pl.pos >= 1 && bewegt) blitze.push({ faser: pl.faser, leben: 1, staerke: pl.staerke });
      pulse = pulse.filter((pl) => pl.pos < 1);
      for (const b of blitze) {
        if (bewegt) b.leben -= 0.02;
        if (b.leben <= 0) continue;
        setzePunkt(fasern[b.faser], 1);
        const radius = 9 + 20 * (1 - b.leben);
        const glut = ctx.createRadialGradient(punkt.x, punkt.y, 0, punkt.x, punkt.y, radius);
        glut.addColorStop(0, `rgba(${glutKern},${0.5 * b.leben * b.staerke})`);
        glut.addColorStop(0.4, `rgba(240,190,0,${0.22 * b.leben * b.staerke})`);
        glut.addColorStop(1, 'rgba(240,168,0,0)');
        ctx.fillStyle = glut;
        ctx.beginPath();
        ctx.arc(punkt.x, punkt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      blitze = blitze.filter((b) => b.leben > 0);
      ctx.globalCompositeOperation = 'source-over';

      // Verlauf von oben zur Seitenfläche, damit Text und Navigation lesbar bleiben
      const g = ctx.createLinearGradient(0, 0, 0, hoehe);
      g.addColorStop(0, `rgba(${grundFarbe},0.97)`);
      g.addColorStop(0.3, `rgba(${grundFarbe},0.5)`);
      g.addColorStop(0.6, `rgba(${grundFarbe},0.15)`);
      g.addColorStop(1, `rgba(${grundFarbe},0.08)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, breite, hoehe);
    };

    const schleife = () => {
      if (!aktiv) return;
      zeichnen(true);
      anfrage = requestAnimationFrame(schleife);
    };

    const sichtbarkeit = () => {
      aktiv = document.visibilityState === 'visible' && !ruhig;
      cancelAnimationFrame(anfrage);
      if (aktiv) anfrage = requestAnimationFrame(schleife);
    };

    /** Beim Wechsel des Erscheinungsbilds (Schalter oder Geräteeinstellung) Farben neu lesen und, im ruhigen Standbild, sofort neu zeichnen */
    const themenwechsel = () => {
      hell = holeAktivesTheme() === 'hell';
      grundFarbe = leseFarbvariable('--color-grund', hell ? '244,245,250' : '8,17,46');
      if (ruhig) zeichnen(false);
    };

    groesse();
    if (ruhig) {
      // Ruhiges Standbild mit einem Lichtschub mitten in den Bändern
      for (let i = 0; i < 10; i++) pulse.push({ faser: Math.floor(Math.random() * fasern.length), pos: 0.45 + Math.random() * 0.15, tempo: 0, staerke: zufall(0.5, 1) });
      zeichnen(false);
    } else {
      anfrage = requestAnimationFrame(schleife);
    }

    const geraet = window.matchMedia('(prefers-color-scheme: light)');
    window.addEventListener('resize', groesse);
    document.addEventListener('visibilitychange', sichtbarkeit);
    document.addEventListener(THEMA_GEAENDERT, themenwechsel);
    geraet.addEventListener('change', themenwechsel);
    return () => {
      aktiv = false;
      cancelAnimationFrame(anfrage);
      window.removeEventListener('resize', groesse);
      document.removeEventListener('visibilitychange', sichtbarkeit);
      document.removeEventListener(THEMA_GEAENDERT, themenwechsel);
      geraet.removeEventListener('change', themenwechsel);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />;
}
