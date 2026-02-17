// Branded image generator for social media posts.
//
// Generates 1200x675 PNG cards with varied templates for visual diversity.
// 5 horoscope card layouts + 5 engagement card layouts, multiple color palettes,
// constellation art for each sign, and assorted background patterns.
// Templates rotate daily via a deterministic day seed.

import sharp from 'sharp';
import { existsSync } from 'fs';
import { join } from 'path';
import { SIGNS, HOROSCOPE_RATINGS } from './content.js';

const IMAGE_LIBRARY_DIR = join(process.cwd(), 'data', 'image-library');

const WIDTH = 1200;
const HEIGHT = 675;

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function starGlyphs(n: number): string {
  return '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Simple seeded PRNG (mulberry32) — returns values in [0, 1) */
function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ═══════════════════════════════════════════════════════════
//  COLOR PALETTES  (3 per element = 12 total)
// ═══════════════════════════════════════════════════════════

interface Palette {
  bg: [string, string];
  accent: string;
  secondary: string;
  glow: string;
}

const PALETTES: Record<string, Palette[]> = {
  Fire: [
    { bg: ['#8B1A1A', '#2D1B4E'], accent: '#FF6B35', secondary: '#FFB347', glow: '#FF6B3540' },
    { bg: ['#4A0E0E', '#1A0A2E'], accent: '#FF4444', secondary: '#FF8A65', glow: '#FF444440' },
    { bg: ['#6B2D2D', '#1E0E3A'], accent: '#FFA726', secondary: '#FFCC02', glow: '#FFA72640' },
  ],
  Earth: [
    { bg: ['#1B4332', '#1A1A2E'], accent: '#4CAF50', secondary: '#81C784', glow: '#4CAF5040' },
    { bg: ['#2E4A3E', '#0D1B2A'], accent: '#66BB6A', secondary: '#A5D6A7', glow: '#66BB6A40' },
    { bg: ['#1A3A28', '#1A1A1A'], accent: '#8BC34A', secondary: '#C5E1A5', glow: '#8BC34A40' },
  ],
  Air: [
    { bg: ['#1B3A4B', '#1A1A2E'], accent: '#64B5F6', secondary: '#90CAF9', glow: '#64B5F640' },
    { bg: ['#1A2D4B', '#2D1B4E'], accent: '#42A5F5', secondary: '#7E57C2', glow: '#42A5F540' },
    { bg: ['#0D2137', '#1A1A2E'], accent: '#4DD0E1', secondary: '#80DEEA', glow: '#4DD0E140' },
  ],
  Water: [
    { bg: ['#1B2A5E', '#2D1B4E'], accent: '#7C4DFF', secondary: '#B388FF', glow: '#7C4DFF40' },
    { bg: ['#1A1A4E', '#3A1B4E'], accent: '#E040FB', secondary: '#EA80FC', glow: '#E040FB40' },
    { bg: ['#0D1B3E', '#2A1040'], accent: '#536DFE', secondary: '#8C9EFF', glow: '#536DFE40' },
  ],
};

function getPalette(element: string, seed: number): Palette {
  const list = PALETTES[element] ?? PALETTES.Fire;
  return list[Math.abs(seed) % list.length];
}

// ═══════════════════════════════════════════════════════════
//  CONSTELLATION DATA (simplified star positions per sign)
//  Each entry: { stars: [x,y][], lines: [fromIdx, toIdx][] }
// ═══════════════════════════════════════════════════════════

interface ConstellationData {
  stars: [number, number][];
  lines: [number, number][];
}

const CONSTELLATIONS: Record<string, ConstellationData> = {
  aries: {
    stars: [[0.35,0.25],[0.42,0.38],[0.50,0.50],[0.58,0.48],[0.63,0.38]],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  taurus: {
    stars: [[0.25,0.55],[0.35,0.48],[0.42,0.40],[0.50,0.35],[0.58,0.28],[0.66,0.22],[0.50,0.35],[0.45,0.50],[0.40,0.60]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[7,8]],
  },
  gemini: {
    stars: [[0.30,0.20],[0.32,0.35],[0.34,0.50],[0.36,0.65],[0.38,0.78],[0.60,0.20],[0.62,0.35],[0.64,0.50],[0.66,0.65],[0.68,0.78],[0.47,0.42]],
    lines: [[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[8,9],[2,10],[10,7]],
  },
  cancer: {
    stars: [[0.35,0.30],[0.42,0.40],[0.50,0.48],[0.58,0.40],[0.65,0.30],[0.50,0.48],[0.45,0.60]],
    lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]],
  },
  leo: {
    stars: [[0.25,0.35],[0.32,0.25],[0.40,0.30],[0.35,0.45],[0.42,0.52],[0.52,0.50],[0.60,0.58],[0.68,0.65],[0.72,0.55]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },
  virgo: {
    stars: [[0.25,0.25],[0.33,0.32],[0.40,0.28],[0.48,0.35],[0.42,0.48],[0.50,0.55],[0.58,0.48],[0.65,0.55],[0.60,0.68],[0.52,0.72]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },
  libra: {
    stars: [[0.30,0.30],[0.50,0.22],[0.70,0.30],[0.50,0.48],[0.35,0.65],[0.50,0.65],[0.65,0.65]],
    lines: [[0,1],[1,2],[0,3],[2,3],[4,5],[5,6]],
  },
  scorpio: {
    stars: [[0.15,0.42],[0.25,0.36],[0.35,0.40],[0.45,0.36],[0.55,0.40],[0.65,0.45],[0.72,0.52],[0.78,0.58],[0.82,0.52],[0.86,0.44]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },
  sagittarius: {
    stars: [[0.25,0.68],[0.38,0.52],[0.48,0.42],[0.58,0.32],[0.68,0.22],[0.48,0.42],[0.35,0.35],[0.48,0.42],[0.58,0.58]],
    lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[2,7],[7,8]],
  },
  capricorn: {
    stars: [[0.25,0.32],[0.35,0.28],[0.45,0.32],[0.55,0.40],[0.62,0.50],[0.70,0.58],[0.72,0.50],[0.68,0.38],[0.60,0.34]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },
  aquarius: {
    stars: [[0.22,0.35],[0.32,0.48],[0.42,0.35],[0.52,0.48],[0.62,0.35],[0.72,0.48],[0.82,0.35]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  pisces: {
    stars: [[0.20,0.30],[0.28,0.35],[0.38,0.40],[0.48,0.48],[0.38,0.58],[0.28,0.62],[0.20,0.68],[0.48,0.48],[0.58,0.40],[0.68,0.35],[0.78,0.30],[0.48,0.48],[0.58,0.58],[0.68,0.62],[0.78,0.68]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,7],[7,8],[8,9],[9,10],[3,11],[11,12],[12,13],[13,14]],
  },
};

// ═══════════════════════════════════════════════════════════
//  BACKGROUND PATTERN GENERATORS
// ═══════════════════════════════════════════════════════════

/** Scatter random dots as a starfield */
function bgStarField(rng: () => number, count: number, accent: string): string {
  let svg = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * WIDTH;
    const y = rng() * HEIGHT;
    const r = rng() * 2.5 + 0.5;
    const opacity = rng() * 0.5 + 0.1;
    const fill = rng() > 0.7 ? accent : 'white';
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" opacity="${opacity.toFixed(2)}"/>`;
  }
  return svg;
}

/** Draw the constellation for a sign, scaled to a region */
function bgConstellation(
  slug: string,
  accent: string,
  region: { x: number; y: number; w: number; h: number },
  starSize: number,
): string {
  const data = CONSTELLATIONS[slug];
  if (!data) return '';

  const pts = data.stars.map(([nx, ny]) => [
    region.x + nx * region.w,
    region.y + ny * region.h,
  ]);

  let svg = '';
  // Lines
  for (const [a, b] of data.lines) {
    if (pts[a] && pts[b]) {
      svg += `<line x1="${pts[a][0].toFixed(1)}" y1="${pts[a][1].toFixed(1)}" x2="${pts[b][0].toFixed(1)}" y2="${pts[b][1].toFixed(1)}" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>`;
    }
  }
  // Stars
  for (const [x, y] of pts) {
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${starSize}" fill="${accent}" opacity="0.8"/>`;
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${starSize * 2.5}" fill="${accent}" opacity="0.12"/>`;
  }
  return svg;
}

/** Concentric orbit rings */
function bgOrbitalRings(cx: number, cy: number, accent: string, count: number): string {
  let svg = '';
  for (let i = 1; i <= count; i++) {
    const r = i * 60;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="0.8" opacity="${0.08 + (i % 2) * 0.04}" stroke-dasharray="${4 + i * 2} ${8 + i * 3}"/>`;
  }
  return svg;
}

/** Soft radial glow circles */
function bgNebulaGlow(rng: () => number, colors: string[], count: number): string {
  let svg = '<defs>';
  for (let i = 0; i < count; i++) {
    svg += `<radialGradient id="neb${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors[i % colors.length]}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${colors[i % colors.length]}" stop-opacity="0"/>
    </radialGradient>`;
  }
  svg += '</defs>';
  for (let i = 0; i < count; i++) {
    const cx = rng() * WIDTH;
    const cy = rng() * HEIGHT;
    const r = 150 + rng() * 250;
    svg += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#neb${i})"/>`;
  }
  return svg;
}

/** Decorative cross-sparkles */
function bgSparkles(rng: () => number, accent: string, count: number): string {
  let svg = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * WIDTH;
    const y = rng() * HEIGHT;
    const size = 3 + rng() * 6;
    const opacity = 0.2 + rng() * 0.4;
    svg += `<g transform="translate(${x.toFixed(0)}, ${y.toFixed(0)})" opacity="${opacity.toFixed(2)}">
      <line x1="${-size}" y1="0" x2="${size}" y2="0" stroke="${accent}" stroke-width="1.2"/>
      <line x1="0" y1="${-size}" x2="0" y2="${size}" stroke="${accent}" stroke-width="1.2"/>
    </g>`;
  }
  return svg;
}

/** Zodiac symbols arranged in a decorative arc or ring */
function bgZodiacArc(y: number, opacity: number): string {
  const symbols = SIGNS.map((s) => s.symbol).join('  ');
  return `<text x="${WIDTH / 2}" y="${y}" font-size="26" fill="white" opacity="${opacity}" text-anchor="middle" font-family="serif" letter-spacing="18">${symbols}</text>`;
}

/** Moon phase crescent decoration */
function bgMoonPhase(cx: number, cy: number, r: number, accent: string, phase: number): string {
  // phase 0-1 controls crescent shape (0=new, 0.5=half, 1=full)
  const offset = r * (1 - phase * 2);
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" opacity="0.12"/>
    <circle cx="${cx + offset}" cy="${cy}" r="${r}" fill="black" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  `;
}

/** Geometric hexagonal pattern */
function bgHexGrid(rng: () => number, accent: string): string {
  let svg = '';
  const size = 45;
  const h = size * Math.sqrt(3);
  for (let row = -1; row < HEIGHT / h + 1; row++) {
    for (let col = -1; col < WIDTH / (size * 1.5) + 1; col++) {
      const cx = col * size * 1.5;
      const cy = row * h + (col % 2 === 0 ? 0 : h / 2);
      if (rng() > 0.65) {
        const points = [];
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a - Math.PI / 6;
          points.push(`${(cx + size * 0.4 * Math.cos(angle)).toFixed(1)},${(cy + size * 0.4 * Math.sin(angle)).toFixed(1)}`);
        }
        svg += `<polygon points="${points.join(' ')}" fill="none" stroke="${accent}" stroke-width="0.6" opacity="${(0.05 + rng() * 0.1).toFixed(2)}"/>`;
      }
    }
  }
  return svg;
}

// ═══════════════════════════════════════════════════════════
//  SVG SHELL — wraps content with background gradient
// ═══════════════════════════════════════════════════════════

function svgShell(
  palette: Palette,
  gradDir: 'diagonal' | 'horizontal' | 'vertical' | 'radial',
  inner: string,
): string {
  let gradientDef: string;
  if (gradDir === 'radial') {
    gradientDef = `<radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${palette.bg[0]}"/>
      <stop offset="100%" stop-color="${palette.bg[1]}"/>
    </radialGradient>`;
  } else {
    const coords = {
      diagonal:   { x1: '0', y1: '0', x2: '1', y2: '1' },
      horizontal: { x1: '0', y1: '0.5', x2: '1', y2: '0.5' },
      vertical:   { x1: '0.5', y1: '0', x2: '0.5', y2: '1' },
    }[gradDir];
    gradientDef = `<linearGradient id="bg" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
      <stop offset="0%" stop-color="${palette.bg[0]}"/>
      <stop offset="100%" stop-color="${palette.bg[1]}"/>
    </linearGradient>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    ${gradientDef}
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${palette.accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="black" opacity="0.12"/>
  ${inner}
  <!-- Watermark -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 25}" font-size="16" fill="white" opacity="0.35"
        font-family="system-ui, sans-serif" text-anchor="end">stellera.co</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════
//  HOROSCOPE CARD LAYOUTS (0-4)
// ═══════════════════════════════════════════════════════════

interface SignInfo {
  slug: string;
  name: string;
  symbol: string;
  dates: string;
  element: string;
}
interface Ratings {
  overall: number;
  love: number;
  career: number;
  wellness: number;
}

/** Layout 0: Classic — enhanced version of original with better star placement */
function horoscopeLayout0(sign: SignInfo, ratings: Ratings, pal: Palette, rng: () => number, date: string): string {
  const bg = bgStarField(rng, 45, pal.accent) + bgSparkles(rng, pal.accent, 8);
  return svgShell(pal, 'diagonal', `
    ${bg}
    <!-- Large decorative symbol -->
    <text x="880" y="420" font-size="320" fill="white" opacity="0.06"
          font-family="serif" text-anchor="middle">${sign.symbol}</text>
    <!-- Accent line -->
    <rect x="60" y="180" width="200" height="3" fill="url(#accentLine)" rx="1.5"/>
    <!-- STELLARA brand -->
    <text x="60" y="80" font-size="18" fill="white" opacity="0.5"
          font-family="system-ui, sans-serif" letter-spacing="4" font-weight="600">STELLARA</text>
    <!-- Date -->
    <text x="60" y="120" font-size="20" fill="white" opacity="0.6"
          font-family="system-ui, sans-serif">${escapeXml(date)}</text>
    <!-- Symbol + dates -->
    <text x="60" y="165" font-size="26" fill="${pal.accent}" font-family="serif">${sign.symbol}</text>
    <text x="95" y="165" font-size="26" fill="white" opacity="0.9"
          font-family="system-ui, sans-serif" font-weight="300">${escapeXml(sign.dates)}</text>
    <!-- Sign name -->
    <text x="60" y="260" font-size="72" fill="white"
          font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>
    <!-- Daily Horoscope label -->
    <text x="60" y="300" font-size="22" fill="${pal.accent}"
          font-family="system-ui, sans-serif" font-weight="500" letter-spacing="2">DAILY HOROSCOPE</text>
    <!-- Ratings -->
    <text x="60" y="380" font-size="20" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Love</text>
    <text x="160" y="380" font-size="22" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
    <text x="60" y="420" font-size="20" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Career</text>
    <text x="160" y="420" font-size="22" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
    <text x="60" y="460" font-size="20" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Wellness</text>
    <text x="160" y="460" font-size="22" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
    <!-- CTA -->
    <rect x="60" y="510" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="200" y="541" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
  `);
}

/** Layout 1: Constellation Portrait — sign constellation dominates the card */
function horoscopeLayout1(sign: SignInfo, ratings: Ratings, pal: Palette, rng: () => number, date: string): string {
  const stars = bgStarField(rng, 60, pal.accent);
  const constellation = bgConstellation(sign.slug, pal.accent, { x: 500, y: 50, w: 650, h: 550 }, 4);
  const rings = bgOrbitalRings(825, 325, pal.secondary, 4);

  return svgShell(pal, 'horizontal', `
    ${stars}
    ${rings}
    ${constellation}
    <!-- Left info panel darkener -->
    <rect x="0" y="0" width="480" height="${HEIGHT}" fill="black" opacity="0.25"/>
    <!-- STELLARA -->
    <text x="50" y="65" font-size="16" fill="white" opacity="0.5"
          font-family="system-ui, sans-serif" letter-spacing="4" font-weight="600">STELLARA</text>
    <!-- Date -->
    <text x="50" y="100" font-size="18" fill="white" opacity="0.5"
          font-family="system-ui, sans-serif">${escapeXml(date)}</text>
    <!-- Accent line -->
    <rect x="50" y="120" width="160" height="2" fill="url(#accentLine)" rx="1"/>
    <!-- Sign symbol large -->
    <text x="50" y="220" font-size="80" fill="${pal.accent}" opacity="0.9" font-family="serif">${sign.symbol}</text>
    <!-- Sign name -->
    <text x="50" y="300" font-size="56" fill="white"
          font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>
    <text x="50" y="330" font-size="18" fill="${pal.secondary}" opacity="0.8"
          font-family="system-ui, sans-serif">${escapeXml(sign.dates)}</text>
    <!-- Ratings vertical -->
    <text x="50" y="390" font-size="14" fill="white" opacity="0.4"
          font-family="system-ui, sans-serif" letter-spacing="2">DAILY RATINGS</text>
    <text x="50" y="425" font-size="17" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Overall</text>
    <text x="170" y="425" font-size="19" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.overall)}</text>
    <text x="50" y="458" font-size="17" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Love</text>
    <text x="170" y="458" font-size="19" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
    <text x="50" y="491" font-size="17" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Career</text>
    <text x="170" y="491" font-size="19" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
    <text x="50" y="524" font-size="17" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Wellness</text>
    <text x="170" y="524" font-size="19" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
    <!-- CTA -->
    <rect x="50" y="560" width="240" height="44" rx="22" fill="${pal.accent}" opacity="0.9"/>
    <text x="170" y="589" font-size="16" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
  `);
}

/** Layout 2: Centered Medallion — symbol in an ornate circle, info below */
function horoscopeLayout2(sign: SignInfo, ratings: Ratings, pal: Palette, rng: () => number, date: string): string {
  const stars = bgStarField(rng, 40, pal.accent);
  const sparkles = bgSparkles(rng, pal.secondary, 10);
  const cx = WIDTH / 2;
  const cy = 220;
  const r = 120;

  // Decorative rings around the central symbol
  let rings = '';
  for (let i = 0; i < 3; i++) {
    const ri = r + 15 + i * 12;
    const dashLen = 4 + i * 3;
    rings += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="${pal.accent}" stroke-width="1" opacity="${0.15 + i * 0.05}" stroke-dasharray="${dashLen} ${dashLen * 2}"/>`;
  }

  return svgShell(pal, 'radial', `
    ${stars}
    ${sparkles}
    <!-- Subtle glow behind medallion -->
    <circle cx="${cx}" cy="${cy}" r="200" fill="${pal.glow}"/>
    <!-- Outer rings -->
    ${rings}
    <!-- Central circle -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${pal.accent}" stroke-width="2" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="black" opacity="0.3"/>
    <!-- Symbol -->
    <text x="${cx}" y="${cy + 35}" font-size="100" fill="${pal.accent}" text-anchor="middle"
          font-family="serif">${sign.symbol}</text>
    <!-- Sign name below medallion -->
    <text x="${cx}" y="405" font-size="58" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>
    <!-- Dates -->
    <text x="${cx}" y="440" font-size="20" fill="${pal.secondary}" opacity="0.7" text-anchor="middle"
          font-family="system-ui, sans-serif">${escapeXml(sign.dates)}</text>
    <!-- Accent line -->
    <rect x="${cx - 150}" y="455" width="300" height="2" fill="url(#accentLine)" rx="1"/>
    <!-- Horizontal ratings row -->
    <text x="270" y="500" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Love</text>
    <text x="330" y="500" font-size="17" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
    <text x="520" y="500" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Career</text>
    <text x="590" y="500" font-size="17" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
    <text x="780" y="500" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Wellness</text>
    <text x="860" y="500" font-size="17" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
    <!-- CTA -->
    <rect x="${cx - 140}" y="540" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="${cx}" y="571" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
    <!-- Brand -->
    <text x="${cx}" y="625" font-size="14" fill="white" opacity="0.3" text-anchor="middle"
          font-family="system-ui, sans-serif" letter-spacing="3">STELLARA</text>
  `);
}

/** Layout 3: Bold Typography — huge sign name, minimal layout */
function horoscopeLayout3(sign: SignInfo, ratings: Ratings, pal: Palette, rng: () => number, date: string): string {
  const stars = bgStarField(rng, 30, pal.accent);
  const moon = bgMoonPhase(WIDTH - 160, 140, 80, pal.secondary, rng() * 0.8 + 0.1);
  const constellation = bgConstellation(sign.slug, pal.accent, { x: 600, y: 200, w: 500, h: 400 }, 3);

  return svgShell(pal, 'vertical', `
    ${stars}
    ${moon}
    ${constellation}
    <!-- STELLARA -->
    <text x="60" y="55" font-size="14" fill="white" opacity="0.4"
          font-family="system-ui, sans-serif" letter-spacing="5" font-weight="600">STELLARA</text>
    <!-- Date -->
    <text x="60" y="85" font-size="16" fill="${pal.secondary}" opacity="0.6"
          font-family="system-ui, sans-serif">${escapeXml(date)}</text>
    <!-- HUGE sign name -->
    <text x="55" y="220" font-size="110" fill="white" opacity="0.95"
          font-family="system-ui, sans-serif" font-weight="800">${escapeXml(sign.name.toUpperCase())}</text>
    <!-- Accent underline -->
    <rect x="60" y="240" width="350" height="4" rx="2" fill="${pal.accent}" opacity="0.8"/>
    <!-- DAILY HOROSCOPE label -->
    <text x="60" y="280" font-size="18" fill="${pal.accent}" opacity="0.7"
          font-family="system-ui, sans-serif" letter-spacing="3">DAILY HOROSCOPE</text>
    <!-- Symbol + dates -->
    <text x="60" y="330" font-size="40" fill="${pal.accent}" font-family="serif">${sign.symbol}</text>
    <text x="110" y="328" font-size="22" fill="white" opacity="0.6"
          font-family="system-ui, sans-serif" font-weight="300">${escapeXml(sign.dates)}</text>
    <!-- Ratings in a row at bottom -->
    <rect x="40" y="400" width="${WIDTH - 80}" height="1" fill="white" opacity="0.08"/>
    <text x="60" y="450" font-size="15" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Love</text>
    <text x="110" y="450" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
    <text x="300" y="450" font-size="15" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Career</text>
    <text x="360" y="450" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
    <text x="550" y="450" font-size="15" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Wellness</text>
    <text x="620" y="450" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
    <!-- CTA -->
    <rect x="60" y="500" width="260" height="44" rx="22" fill="${pal.accent}" opacity="0.9"/>
    <text x="190" y="529" font-size="16" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
  `);
}

/** Layout 4: Cosmic Split — left info, right nebula glow with symbol */
function horoscopeLayout4(sign: SignInfo, ratings: Ratings, pal: Palette, rng: () => number, date: string): string {
  const stars = bgStarField(rng, 50, pal.accent);
  const nebula = bgNebulaGlow(rng, [pal.accent, pal.secondary, pal.glow], 5);
  const hexes = bgHexGrid(rng, pal.accent);

  return svgShell(pal, 'horizontal', `
    ${stars}
    <!-- Right side glow zone -->
    <rect x="550" y="0" width="${WIDTH - 550}" height="${HEIGHT}" fill="black" opacity="0.15"/>
    ${nebula}
    ${hexes}
    <!-- Right side: large symbol -->
    <text x="860" y="400" font-size="280" fill="${pal.accent}" opacity="0.1"
          text-anchor="middle" font-family="serif">${sign.symbol}</text>
    <text x="860" y="360" font-size="120" fill="${pal.accent}" opacity="0.5"
          text-anchor="middle" font-family="serif">${sign.symbol}</text>
    <!-- Left panel -->
    <text x="50" y="60" font-size="14" fill="white" opacity="0.4"
          font-family="system-ui, sans-serif" letter-spacing="4" font-weight="600">STELLARA</text>
    <text x="50" y="95" font-size="16" fill="${pal.secondary}" opacity="0.5"
          font-family="system-ui, sans-serif">${escapeXml(date)}</text>
    <rect x="50" y="110" width="120" height="2" fill="${pal.accent}" opacity="0.5" rx="1"/>
    <!-- Sign name -->
    <text x="50" y="190" font-size="62" fill="white"
          font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>
    <text x="50" y="225" font-size="20" fill="${pal.secondary}" opacity="0.7"
          font-family="system-ui, sans-serif">${escapeXml(sign.dates)}</text>
    <!-- DAILY HOROSCOPE -->
    <text x="50" y="270" font-size="16" fill="${pal.accent}"
          font-family="system-ui, sans-serif" letter-spacing="2" font-weight="500">DAILY HOROSCOPE</text>
    <!-- Ratings -->
    <text x="50" y="320" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Overall</text>
    <text x="50" y="345" font-size="24" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.overall)}</text>
    <text x="50" y="385" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Love</text>
    <text x="50" y="410" font-size="24" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
    <text x="50" y="450" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Career</text>
    <text x="50" y="475" font-size="24" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
    <text x="50" y="515" font-size="16" fill="white" opacity="0.5" font-family="system-ui, sans-serif">Wellness</text>
    <text x="50" y="540" font-size="24" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
    <!-- CTA -->
    <rect x="50" y="575" width="260" height="44" rx="22" fill="${pal.accent}" opacity="0.9"/>
    <text x="180" y="604" font-size="16" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
  `);
}

const HOROSCOPE_LAYOUTS = [horoscopeLayout0, horoscopeLayout1, horoscopeLayout2, horoscopeLayout3, horoscopeLayout4];
const GRAD_DIRS: Array<'diagonal' | 'horizontal' | 'vertical' | 'radial'> = ['diagonal', 'horizontal', 'vertical', 'radial'];

// ═══════════════════════════════════════════════════════════
//  ENGAGEMENT CARD LAYOUTS (0-4)
// ═══════════════════════════════════════════════════════════

/** Engagement 0: Classic wordmark with zodiac ring */
function engagementLayout0(pal: Palette, rng: () => number): string {
  const stars = bgStarField(rng, 35, pal.accent);
  const sparkles = bgSparkles(rng, pal.accent, 8);
  return svgShell(pal, 'diagonal', `
    ${stars}
    ${sparkles}
    <!-- Large decorative glyphs -->
    <text x="200" y="350" font-size="400" fill="white" opacity="0.04"
          font-family="serif" text-anchor="middle">&#x2726;</text>
    <text x="900" y="500" font-size="300" fill="white" opacity="0.03"
          font-family="serif" text-anchor="middle">&#x2727;</text>
    <!-- Zodiac symbol ring -->
    ${bgZodiacArc(220, 0.12)}
    <!-- STELLARA wordmark -->
    <text x="${WIDTH / 2}" y="340" font-size="80" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="700" letter-spacing="6">STELLARA</text>
    <!-- Accent line -->
    <rect x="400" y="360" width="400" height="3" fill="url(#accentLine)" rx="1.5"/>
    <!-- Tagline -->
    <text x="${WIDTH / 2}" y="410" font-size="24" fill="white" opacity="0.6" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="300" letter-spacing="3">YOUR STARS, DECODED</text>
    <!-- CTA -->
    <rect x="460" y="470" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="${WIDTH / 2}" y="501" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Explore Free</text>
  `);
}

/** Engagement 1: Zodiac Wheel — 12 symbols in a circle */
function engagementLayout1(pal: Palette, rng: () => number): string {
  const stars = bgStarField(rng, 50, pal.accent);
  const cx = WIDTH / 2;
  const cy = 310;
  const r = 220;

  let wheel = '';
  SIGNS.forEach((s, i) => {
    const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    wheel += `<text x="${x.toFixed(0)}" y="${(y + 12).toFixed(0)}" font-size="34" fill="${pal.accent}" opacity="0.6" text-anchor="middle" font-family="serif">${s.symbol}</text>`;
  });

  // Connecting circle
  let ringDots = '';
  for (let i = 0; i < 72; i++) {
    const angle = (Math.PI * 2 * i) / 72;
    const x = cx + (r - 25) * Math.cos(angle);
    const y = cy + (r - 25) * Math.sin(angle);
    ringDots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1" fill="${pal.accent}" opacity="0.2"/>`;
  }

  return svgShell(pal, 'radial', `
    ${stars}
    <!-- Glow -->
    <circle cx="${cx}" cy="${cy}" r="160" fill="${pal.glow}"/>
    <!-- Ring dots -->
    ${ringDots}
    <!-- Wheel symbols -->
    ${wheel}
    <!-- Center wordmark -->
    <text x="${cx}" y="${cy - 10}" font-size="42" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="700" letter-spacing="3">STELLARA</text>
    <rect x="${cx - 100}" y="${cy + 5}" width="200" height="2" fill="url(#accentLine)" rx="1"/>
    <text x="${cx}" y="${cy + 35}" font-size="14" fill="white" opacity="0.5" text-anchor="middle"
          font-family="system-ui, sans-serif" letter-spacing="2">YOUR STARS, DECODED</text>
    <!-- CTA -->
    <rect x="${cx - 130}" y="${cy + 250}" width="260" height="44" rx="22" fill="${pal.accent}" opacity="0.9"/>
    <text x="${cx}" y="${cy + 279}" font-size="16" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Explore Free</text>
  `);
}

/** Engagement 2: Nebula — soft overlapping glows with bold text */
function engagementLayout2(pal: Palette, rng: () => number): string {
  const nebula = bgNebulaGlow(rng, [pal.accent, pal.secondary, '#ffffff'], 6);
  const sparkles = bgSparkles(rng, 'white', 12);

  return svgShell(pal, 'diagonal', `
    ${nebula}
    ${sparkles}
    <!-- Large faded star -->
    <text x="${WIDTH / 2}" y="420" font-size="500" fill="white" opacity="0.03"
          text-anchor="middle" font-family="serif">&#x2726;</text>
    <!-- STELLARA -->
    <text x="${WIDTH / 2}" y="250" font-size="18" fill="white" opacity="0.4" text-anchor="middle"
          font-family="system-ui, sans-serif" letter-spacing="6" font-weight="600">STELLARA</text>
    <!-- Big tagline -->
    <text x="${WIDTH / 2}" y="340" font-size="52" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="700">Your Stars, Decoded</text>
    <!-- Accent line -->
    <rect x="${(WIDTH - 300) / 2}" y="360" width="300" height="3" fill="url(#accentLine)" rx="1.5"/>
    <!-- Sub text -->
    <text x="${WIDTH / 2}" y="405" font-size="20" fill="${pal.secondary}" opacity="0.7" text-anchor="middle"
          font-family="system-ui, sans-serif">Birth charts, horoscopes &amp; compatibility</text>
    <!-- CTA -->
    <rect x="${(WIDTH - 280) / 2}" y="460" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="${WIDTH / 2}" y="491" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Get Your Free Chart</text>
  `);
}

/** Engagement 3: Geometric Web — hex grid with connected constellation overlay */
function engagementLayout3(pal: Palette, rng: () => number): string {
  const stars = bgStarField(rng, 25, pal.accent);
  const hexes = bgHexGrid(rng, pal.accent);
  // Pick a random constellation for decoration
  const signSlugs = Object.keys(CONSTELLATIONS);
  const decorSlug = signSlugs[Math.floor(rng() * signSlugs.length)];
  const constellation = bgConstellation(decorSlug, pal.secondary, { x: 100, y: 50, w: WIDTH - 200, h: HEIGHT - 100 }, 3);

  return svgShell(pal, 'vertical', `
    ${hexes}
    ${stars}
    ${constellation}
    <!-- Dark overlay for readability -->
    <rect x="250" y="180" width="700" height="320" rx="16" fill="black" opacity="0.35"/>
    <!-- STELLARA -->
    <text x="${WIDTH / 2}" y="260" font-size="60" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="700" letter-spacing="4">STELLARA</text>
    <!-- Accent -->
    <rect x="${(WIDTH - 240) / 2}" y="278" width="240" height="3" fill="url(#accentLine)" rx="1.5"/>
    <!-- Tagline -->
    <text x="${WIDTH / 2}" y="325" font-size="22" fill="${pal.accent}" opacity="0.9" text-anchor="middle"
          font-family="system-ui, sans-serif" letter-spacing="2">YOUR STARS, DECODED</text>
    <!-- Zodiac ring -->
    ${bgZodiacArc(385, 0.25)}
    <!-- CTA -->
    <rect x="${(WIDTH - 280) / 2}" y="420" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="${WIDTH / 2}" y="451" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Explore Free</text>
  `);
}

/** Engagement 4: Moon & Stars — crescent moon with starfield */
function engagementLayout4(pal: Palette, rng: () => number): string {
  const stars = bgStarField(rng, 80, pal.accent);
  const phase = rng() * 0.6 + 0.2;
  const moon = bgMoonPhase(900, 180, 120, pal.accent, phase);
  const sparkles = bgSparkles(rng, pal.secondary, 15);
  const rings = bgOrbitalRings(900, 180, pal.accent, 3);

  return svgShell(pal, 'diagonal', `
    ${stars}
    ${sparkles}
    ${rings}
    ${moon}
    <!-- Left-aligned content -->
    <text x="70" y="100" font-size="16" fill="white" opacity="0.4"
          font-family="system-ui, sans-serif" letter-spacing="5" font-weight="600">STELLARA</text>
    <!-- Large tagline -->
    <text x="70" y="200" font-size="56" fill="white"
          font-family="system-ui, sans-serif" font-weight="700">Your Stars,</text>
    <text x="70" y="265" font-size="56" fill="${pal.accent}"
          font-family="system-ui, sans-serif" font-weight="700">Decoded.</text>
    <!-- Accent line -->
    <rect x="70" y="285" width="250" height="3" fill="${pal.accent}" opacity="0.6" rx="1.5"/>
    <!-- Sub text -->
    <text x="70" y="330" font-size="20" fill="white" opacity="0.5"
          font-family="system-ui, sans-serif">Daily horoscopes &amp; birth charts</text>
    <!-- Zodiac mini symbols -->
    <text x="70" y="390" font-size="22" fill="${pal.accent}" opacity="0.4"
          font-family="serif" letter-spacing="10">${SIGNS.map((s) => s.symbol).join(' ')}</text>
    <!-- CTA -->
    <rect x="70" y="440" width="280" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
    <text x="210" y="471" font-size="18" fill="white" text-anchor="middle"
          font-family="system-ui, sans-serif" font-weight="600">Get Your Free Chart</text>
  `);
}

const ENGAGEMENT_LAYOUTS = [engagementLayout0, engagementLayout1, engagementLayout2, engagementLayout3, engagementLayout4];

// ═══════════════════════════════════════════════════════════
//  DEFAULT ENGAGEMENT PALETTE
// ═══════════════════════════════════════════════════════════

const ENGAGEMENT_PALETTES: Palette[] = [
  { bg: ['#2D1B4E', '#1A1A2E'], accent: '#A78BFA', secondary: '#C4B5FD', glow: '#A78BFA30' },
  { bg: ['#1A1A3E', '#0D0D1A'], accent: '#818CF8', secondary: '#A5B4FC', glow: '#818CF830' },
  { bg: ['#2A1040', '#0D1B2A'], accent: '#C084FC', secondary: '#E9D5FF', glow: '#C084FC30' },
  { bg: ['#1E1B4B', '#0C0A1D'], accent: '#F472B6', secondary: '#FBCFE8', glow: '#F472B630' },
  { bg: ['#1A2744', '#0F0A1A'], accent: '#38BDF8', secondary: '#7DD3FC', glow: '#38BDF830' },
];

// ═══════════════════════════════════════════════════════════
//  SVG TEXT OVERLAYS (transparent bg — composited on AI backgrounds)
// ═══════════════════════════════════════════════════════════

/** Horoscope text overlay — transparent background, dark gradient strip for readability */
function horoscopeTextOverlay(sign: SignInfo, ratings: Ratings, pal: Palette, date: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="40%" stop-color="black" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.75"/>
    </linearGradient>
    <linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="black" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="black" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Readability overlays -->
  <rect x="0" y="${HEIGHT * 0.35}" width="${WIDTH}" height="${HEIGHT * 0.65}" fill="url(#bottomFade)"/>
  <rect x="0" y="0" width="${WIDTH * 0.5}" height="${HEIGHT}" fill="url(#leftFade)"/>
  <!-- STELLARA brand -->
  <text x="50" y="55" font-size="16" fill="white" opacity="0.7"
        font-family="system-ui, sans-serif" letter-spacing="4" font-weight="600">STELLARA</text>
  <!-- Date -->
  <text x="50" y="88" font-size="18" fill="white" opacity="0.6"
        font-family="system-ui, sans-serif">${escapeXml(date)}</text>
  <!-- Sign symbol -->
  <text x="50" y="170" font-size="60" fill="${pal.accent}" opacity="0.9" font-family="serif">${sign.symbol}</text>
  <!-- Sign name -->
  <text x="50" y="260" font-size="68" fill="white"
        font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>
  <!-- Dates -->
  <text x="50" y="295" font-size="20" fill="white" opacity="0.7"
        font-family="system-ui, sans-serif">${escapeXml(sign.dates)}</text>
  <!-- DAILY HOROSCOPE label -->
  <text x="50" y="340" font-size="16" fill="${pal.accent}"
        font-family="system-ui, sans-serif" letter-spacing="2" font-weight="500">DAILY HOROSCOPE</text>
  <!-- Ratings -->
  <text x="50" y="395" font-size="16" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Love</text>
  <text x="130" y="395" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.love)}</text>
  <text x="50" y="430" font-size="16" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Career</text>
  <text x="130" y="430" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.career)}</text>
  <text x="50" y="465" font-size="16" fill="white" opacity="0.6" font-family="system-ui, sans-serif">Wellness</text>
  <text x="130" y="465" font-size="20" fill="${pal.accent}" font-family="serif">${starGlyphs(ratings.wellness)}</text>
  <!-- CTA -->
  <rect x="50" y="500" width="260" height="44" rx="22" fill="${pal.accent}" opacity="0.9"/>
  <text x="180" y="529" font-size="16" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>
  <!-- Watermark -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 25}" font-size="16" fill="white" opacity="0.5"
        font-family="system-ui, sans-serif" text-anchor="end">stellera.co</text>
</svg>`;
}

/** Engagement text overlay — transparent background */
function engagementTextOverlay(pal: Palette): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="centerFade" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="30%" stop-color="black" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="black" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="olAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${pal.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${pal.accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${pal.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Center readability band -->
  <rect x="0" y="${HEIGHT * 0.2}" width="${WIDTH}" height="${HEIGHT * 0.6}" fill="url(#centerFade)"/>
  <!-- STELLARA wordmark -->
  <text x="${WIDTH / 2}" y="310" font-size="72" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="700" letter-spacing="5">STELLARA</text>
  <!-- Accent line -->
  <rect x="${(WIDTH - 350) / 2}" y="330" width="350" height="3" fill="url(#olAccent)" rx="1.5"/>
  <!-- Tagline -->
  <text x="${WIDTH / 2}" y="375" font-size="22" fill="white" opacity="0.7" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="300" letter-spacing="3">YOUR STARS, DECODED</text>
  <!-- CTA -->
  <rect x="${(WIDTH - 260) / 2}" y="420" width="260" height="48" rx="24" fill="${pal.accent}" opacity="0.9"/>
  <text x="${WIDTH / 2}" y="451" font-size="18" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="600">Explore Free</text>
  <!-- Watermark -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 25}" font-size="16" fill="white" opacity="0.5"
        font-family="system-ui, sans-serif" text-anchor="end">stellera.co</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════
//  MAIN EXPORTS
// ═══════════════════════════════════════════════════════════

/**
 * Generate a branded horoscope card for a zodiac sign.
 * Prefers AI-generated backgrounds (from data/image-library/) with SVG text overlay.
 * Falls back to full SVG templates when no AI images are available.
 */
export async function generateHoroscopeCard(slug: string): Promise<Buffer> {
  const sign = SIGNS.find((s) => s.slug === slug) ?? SIGNS[0];
  const ratings = HOROSCOPE_RATINGS[slug] ?? HOROSCOPE_RATINGS.aries;
  const seed = daySeed();
  const signIdx = SIGNS.findIndex((s) => s.slug === slug);
  const palette = getPalette(sign.element, seed + signIdx);
  const date = formatDate();

  // Try AI background composite
  const variant = (seed + signIdx) % 3;
  const bgPath = join(IMAGE_LIBRARY_DIR, `horoscope-${slug}-${variant}.png`);

  if (existsSync(bgPath)) {
    const overlaySvg = horoscopeTextOverlay(sign, ratings, palette, date);
    const overlayBuf = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

    return sharp(bgPath)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .png()
      .toBuffer();
  }

  // Fallback: pure SVG generation with varied templates
  const layoutIdx = (seed + signIdx) % HOROSCOPE_LAYOUTS.length;
  const rng = seededRng(seed * 100 + signIdx);
  const layoutFn = HOROSCOPE_LAYOUTS[layoutIdx];
  const svg = layoutFn(sign, ratings, palette, rng, escapeXml(date));

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Generate a branded engagement card.
 * Prefers AI-generated backgrounds with SVG text overlay.
 * Falls back to full SVG templates when no AI images are available.
 */
export async function generateEngagementCard(): Promise<Buffer> {
  const seed = daySeed();
  const palette = ENGAGEMENT_PALETTES[seed % ENGAGEMENT_PALETTES.length];

  // Try AI background composite
  const variant = seed % 14;
  const bgPath = join(IMAGE_LIBRARY_DIR, `engagement-${variant}.png`);

  if (existsSync(bgPath)) {
    const overlaySvg = engagementTextOverlay(palette);
    const overlayBuf = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

    return sharp(bgPath)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .png()
      .toBuffer();
  }

  // Fallback: pure SVG generation
  const layoutIdx = seed % ENGAGEMENT_LAYOUTS.length;
  const rng = seededRng(seed * 77);
  const layoutFn = ENGAGEMENT_LAYOUTS[layoutIdx];
  const svg = layoutFn(palette, rng);

  return sharp(Buffer.from(svg)).png().toBuffer();
}
