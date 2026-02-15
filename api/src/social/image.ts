// Branded image generator for social media posts.
//
// Generates 1200x675 PNG cards for horoscope and engagement tweets
// using SVG templates rendered via sharp.

import sharp from 'sharp';
import { SIGNS, HOROSCOPE_RATINGS } from './content.js';

const WIDTH = 1200;
const HEIGHT = 675;

// Element-based gradient colours
const ELEMENT_COLORS: Record<string, [string, string]> = {
  Fire:  ['#8B1A1A', '#2D1B4E'],
  Earth: ['#1B4332', '#1A1A2E'],
  Air:   ['#1B3A4B', '#1A1A2E'],
  Water: ['#1B2A5E', '#2D1B4E'],
};

// Accent colours per element (for decorative elements)
const ELEMENT_ACCENT: Record<string, string> = {
  Fire:  '#FF6B35',
  Earth: '#4CAF50',
  Air:   '#64B5F6',
  Water: '#7C4DFF',
};

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stars(n: number): string {
  return '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Decorative sparkle/star SVG elements
function sparkles(accent: string): string {
  return `
    <circle cx="100" cy="80" r="2" fill="${accent}" opacity="0.6"/>
    <circle cx="1100" cy="100" r="3" fill="${accent}" opacity="0.5"/>
    <circle cx="950" cy="60" r="1.5" fill="${accent}" opacity="0.7"/>
    <circle cx="200" cy="580" r="2" fill="${accent}" opacity="0.4"/>
    <circle cx="1050" cy="550" r="2.5" fill="${accent}" opacity="0.5"/>
    <circle cx="150" cy="300" r="1.5" fill="${accent}" opacity="0.3"/>
    <circle cx="1080" cy="320" r="2" fill="${accent}" opacity="0.4"/>
    <circle cx="300" cy="50" r="1" fill="white" opacity="0.4"/>
    <circle cx="800" cy="90" r="1.5" fill="white" opacity="0.3"/>
    <circle cx="500" cy="620" r="1" fill="white" opacity="0.3"/>
    <circle cx="700" cy="40" r="2" fill="white" opacity="0.25"/>
    <circle cx="400" cy="600" r="1.5" fill="white" opacity="0.2"/>
    <!-- Cross sparkles -->
    <g transform="translate(180, 120)" opacity="0.5">
      <line x1="-6" y1="0" x2="6" y2="0" stroke="${accent}" stroke-width="1.5"/>
      <line x1="0" y1="-6" x2="0" y2="6" stroke="${accent}" stroke-width="1.5"/>
    </g>
    <g transform="translate(1020, 180)" opacity="0.4">
      <line x1="-8" y1="0" x2="8" y2="0" stroke="${accent}" stroke-width="1.5"/>
      <line x1="0" y1="-8" x2="0" y2="8" stroke="${accent}" stroke-width="1.5"/>
    </g>
    <g transform="translate(900, 580)" opacity="0.35">
      <line x1="-5" y1="0" x2="5" y2="0" stroke="white" stroke-width="1"/>
      <line x1="0" y1="-5" x2="0" y2="5" stroke="white" stroke-width="1"/>
    </g>
  `;
}

/** Generate a branded horoscope card for a zodiac sign */
export async function generateHoroscopeCard(slug: string): Promise<Buffer> {
  const sign = SIGNS.find(s => s.slug === slug) ?? SIGNS[0];
  const ratings = HOROSCOPE_RATINGS[slug] ?? HOROSCOPE_RATINGS.aries;
  const [gradStart, gradEnd] = ELEMENT_COLORS[sign.element] ?? ELEMENT_COLORS.Fire;
  const accent = ELEMENT_ACCENT[sign.element] ?? ELEMENT_ACCENT.Fire;
  const date = escapeXml(formatDate());

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${gradStart}"/>
      <stop offset="100%" stop-color="${gradEnd}"/>
    </linearGradient>
    <linearGradient id="accent-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" rx="0"/>

  <!-- Subtle vignette overlay -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="black" opacity="0.15" rx="0"/>

  <!-- Large decorative zodiac symbol -->
  <text x="900" y="420" font-size="320" fill="white" opacity="0.06"
        font-family="serif" text-anchor="middle">${sign.symbol}</text>

  ${sparkles(accent)}

  <!-- Accent line -->
  <rect x="60" y="180" width="200" height="3" fill="url(#accent-line)" rx="1.5"/>

  <!-- STELLARA brand -->
  <text x="60" y="80" font-size="18" fill="white" opacity="0.5"
        font-family="system-ui, sans-serif" letter-spacing="4" font-weight="600">STELLARA</text>

  <!-- Date -->
  <text x="60" y="120" font-size="20" fill="white" opacity="0.6"
        font-family="system-ui, sans-serif">${date}</text>

  <!-- Zodiac symbol + name -->
  <text x="60" y="165" font-size="26" fill="${accent}"
        font-family="serif">${sign.symbol}</text>
  <text x="95" y="165" font-size="26" fill="white" opacity="0.9"
        font-family="system-ui, sans-serif" font-weight="300">${escapeXml(sign.dates)}</text>

  <!-- Sign name (large) -->
  <text x="60" y="260" font-size="72" fill="white"
        font-family="system-ui, sans-serif" font-weight="700">${escapeXml(sign.name)}</text>

  <!-- Daily Horoscope label -->
  <text x="60" y="300" font-size="22" fill="${accent}"
        font-family="system-ui, sans-serif" font-weight="500" letter-spacing="2">DAILY HOROSCOPE</text>

  <!-- Ratings -->
  <text x="60" y="380" font-size="20" fill="white" opacity="0.6"
        font-family="system-ui, sans-serif">Love</text>
  <text x="160" y="380" font-size="22" fill="${accent}"
        font-family="serif">${stars(ratings.love)}</text>

  <text x="60" y="420" font-size="20" fill="white" opacity="0.6"
        font-family="system-ui, sans-serif">Career</text>
  <text x="160" y="420" font-size="22" fill="${accent}"
        font-family="serif">${stars(ratings.career)}</text>

  <text x="60" y="460" font-size="20" fill="white" opacity="0.6"
        font-family="system-ui, sans-serif">Wellness</text>
  <text x="160" y="460" font-size="22" fill="${accent}"
        font-family="serif">${stars(ratings.wellness)}</text>

  <!-- CTA -->
  <rect x="60" y="510" width="280" height="48" rx="24" fill="${accent}" opacity="0.9"/>
  <text x="200" y="541" font-size="18" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="600">Read Full Horoscope</text>

  <!-- Watermark -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 25}" font-size="16" fill="white" opacity="0.35"
        font-family="system-ui, sans-serif" text-anchor="end">stellera.co</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Generate a branded Stellara engagement card */
export async function generateEngagementCard(): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2D1B4E"/>
      <stop offset="100%" stop-color="#1A1A2E"/>
    </linearGradient>
    <linearGradient id="accent-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A78BFA" stop-opacity="0"/>
      <stop offset="50%" stop-color="#A78BFA" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#A78BFA" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" rx="0"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="black" opacity="0.1" rx="0"/>

  <!-- Large decorative star symbols -->
  <text x="200" y="350" font-size="400" fill="white" opacity="0.04"
        font-family="serif" text-anchor="middle">&#x2726;</text>
  <text x="900" y="500" font-size="300" fill="white" opacity="0.03"
        font-family="serif" text-anchor="middle">&#x2727;</text>

  ${sparkles('#A78BFA')}

  <!-- Zodiac ring (decorative symbols in a line) -->
  <text x="600" y="220" font-size="28" fill="white" opacity="0.12" text-anchor="middle"
        font-family="serif" letter-spacing="20">\u2648 \u2649 \u264A \u264B \u264C \u264D \u264E \u264F \u2650 \u2651 \u2652 \u2653</text>

  <!-- STELLARA wordmark -->
  <text x="600" y="340" font-size="80" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="700" letter-spacing="6">STELLARA</text>

  <!-- Accent line under wordmark -->
  <rect x="400" y="360" width="400" height="3" fill="url(#accent-line)" rx="1.5"/>

  <!-- Tagline -->
  <text x="600" y="410" font-size="24" fill="white" opacity="0.6" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="300" letter-spacing="3">YOUR STARS, DECODED</text>

  <!-- CTA area -->
  <rect x="460" y="470" width="280" height="48" rx="24" fill="#A78BFA" opacity="0.9"/>
  <text x="600" y="501" font-size="18" fill="white" text-anchor="middle"
        font-family="system-ui, sans-serif" font-weight="600">Explore Free</text>

  <!-- Watermark -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 25}" font-size="16" fill="white" opacity="0.35"
        font-family="system-ui, sans-serif" text-anchor="end">stellera.co</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
