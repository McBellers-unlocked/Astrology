import { Router } from 'express';
import sharp from 'sharp';

const router = Router();

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
  leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
  sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water',
};

const ELEMENT_COLORS: Record<string, [string, string]> = {
  Fire:  ['#8B1A1A', '#2D1B4E'],
  Earth: ['#1B4332', '#1A1A2E'],
  Air:   ['#1B3A4B', '#1A1A2E'],
  Water: ['#1B2A5E', '#2D1B4E'],
};

const ELEMENT_ACCENT: Record<string, string> = {
  Fire:  '#FF6B35',
  Earth: '#4CAF50',
  Air:   '#64B5F6',
  Water: '#7C4DFF',
};

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * GET /charts/big3-card
 *
 * Generate a branded Big 3 PNG card for social sharing.
 * Query params: sun, moon, rising, name (optional)
 */
router.get('/big3-card', async (req, res) => {
  try {
    const sun = (req.query.sun as string || 'aries').toLowerCase();
    const moon = (req.query.moon as string || 'taurus').toLowerCase();
    const rising = (req.query.rising as string || 'gemini').toLowerCase();
    const name = req.query.name as string || '';

    const sunElement = SIGN_ELEMENTS[sun] || 'Fire';
    const [gradStart, gradEnd] = ELEMENT_COLORS[sunElement] || ELEMENT_COLORS.Fire;
    const accent = ELEMENT_ACCENT[sunElement] || ELEMENT_ACCENT.Fire;

    const sunSymbol = ZODIAC_SYMBOLS[sun] || '\u2648';
    const moonSymbol = ZODIAC_SYMBOLS[moon] || '\u2649';
    const risingSymbol = ZODIAC_SYMBOLS[rising] || '\u264A';

    const WIDTH = 1200;
    const HEIGHT = 675;

    const nameText = name
      ? `<text x="600" y="105" font-family="system-ui, sans-serif" font-size="22" fill="white" text-anchor="middle" opacity="0.9">${escapeXml(name)}&apos;s Cosmic Identity</text>`
      : '';

    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="transparent"/>
            <stop offset="20%" stop-color="${accent}"/>
            <stop offset="80%" stop-color="${accent}"/>
            <stop offset="100%" stop-color="transparent"/>
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

        <!-- Subtle grid -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="white" stroke-width="0.3" opacity="0.03"
              stroke-dasharray="30 30"/>

        <!-- Sparkle decorations -->
        <circle cx="100" cy="80" r="2" fill="${accent}" opacity="0.6"/>
        <circle cx="1100" cy="100" r="3" fill="${accent}" opacity="0.5"/>
        <circle cx="950" cy="60" r="1.5" fill="${accent}" opacity="0.7"/>
        <circle cx="200" cy="580" r="2" fill="${accent}" opacity="0.4"/>
        <circle cx="1050" cy="550" r="2.5" fill="${accent}" opacity="0.5"/>
        <circle cx="300" cy="50" r="1" fill="white" opacity="0.4"/>
        <circle cx="800" cy="90" r="1.5" fill="white" opacity="0.3"/>
        <circle cx="500" cy="620" r="1" fill="white" opacity="0.3"/>

        <!-- Header -->
        <text x="600" y="68" font-family="system-ui, sans-serif" font-size="16" fill="${accent}"
              text-anchor="middle" letter-spacing="6" font-weight="600">MY BIG THREE</text>
        ${nameText}

        <!-- Accent line -->
        <line x1="200" y1="130" x2="1000" y2="130" stroke="url(#accentLine)" stroke-width="1" opacity="0.5"/>

        <!-- Sun Sign -->
        <g transform="translate(200, 180)">
          <text x="0" y="0" font-family="system-ui, sans-serif" font-size="11" fill="${accent}"
                letter-spacing="4" font-weight="600">SUN SIGN</text>
          <text x="0" y="65" font-family="serif" font-size="70"
                fill="white" opacity="0.15">${sunSymbol}</text>
          <text x="95" y="65" font-family="system-ui, sans-serif" font-size="42"
                fill="white" font-weight="700">${escapeXml(capitalize(sun))}</text>
          <text x="0" y="95" font-family="system-ui, sans-serif" font-size="14"
                fill="white" opacity="0.6">Your core identity &amp; ego</text>
        </g>

        <!-- Moon Sign -->
        <g transform="translate(200, 320)">
          <text x="0" y="0" font-family="system-ui, sans-serif" font-size="11" fill="${accent}"
                letter-spacing="4" font-weight="600">MOON SIGN</text>
          <text x="0" y="65" font-family="serif" font-size="70"
                fill="white" opacity="0.15">${moonSymbol}</text>
          <text x="95" y="65" font-family="system-ui, sans-serif" font-size="42"
                fill="white" font-weight="700">${escapeXml(capitalize(moon))}</text>
          <text x="0" y="95" font-family="system-ui, sans-serif" font-size="14"
                fill="white" opacity="0.6">Your emotional inner world</text>
        </g>

        <!-- Rising Sign -->
        <g transform="translate(200, 460)">
          <text x="0" y="0" font-family="system-ui, sans-serif" font-size="11" fill="${accent}"
                letter-spacing="4" font-weight="600">RISING SIGN</text>
          <text x="0" y="65" font-family="serif" font-size="70"
                fill="white" opacity="0.15">${risingSymbol}</text>
          <text x="95" y="65" font-family="system-ui, sans-serif" font-size="42"
                fill="white" font-weight="700">${escapeXml(capitalize(rising))}</text>
          <text x="0" y="95" font-family="system-ui, sans-serif" font-size="14"
                fill="white" opacity="0.6">How the world perceives you</text>
        </g>

        <!-- Right side: large zodiac symbols -->
        <text x="920" y="320" font-family="serif" font-size="120" fill="${accent}" opacity="0.08"
              text-anchor="middle">${sunSymbol}</text>
        <text x="1000" y="430" font-family="serif" font-size="90" fill="${accent}" opacity="0.06"
              text-anchor="middle">${moonSymbol}</text>
        <text x="880" y="500" font-family="serif" font-size="70" fill="${accent}" opacity="0.05"
              text-anchor="middle">${risingSymbol}</text>

        <!-- Bottom branding -->
        <line x1="200" y1="610" x2="1000" y2="610" stroke="url(#accentLine)" stroke-width="1" opacity="0.3"/>
        <text x="600" y="645" font-family="system-ui, sans-serif" font-size="14" fill="white"
              text-anchor="middle" opacity="0.5" letter-spacing="2">STELLARA — stellera.co</text>
      </svg>
    `;

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': png.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(png);
  } catch (err) {
    console.error('Big 3 card error:', err);
    res.status(500).json({ error: 'Failed to generate card' });
  }
});

export default router;
