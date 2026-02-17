/**
 * One-time script to generate a library of AI background images via DALL-E 3.
 *
 * Generates 50 images:
 *   - 36 sign-specific backgrounds (12 signs × 3 style variations)
 *   - 14 engagement backgrounds (generic cosmic/zodiac art)
 *
 * Images are saved to data/image-library/ and used by image.ts as backgrounds
 * with branded SVG text composited on top.
 *
 * Usage:
 *   npx tsx src/social/generate-library.ts
 *
 * Cost: ~$2-4 total (DALL-E 3 standard quality).
 * Re-run anytime to refresh visuals.
 *
 * Requires: OPENAI_API_KEY in .env
 */

import 'dotenv/config';
import OpenAI from 'openai';
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'data', 'image-library');
const WIDTH = 1200;
const HEIGHT = 675;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Sign metadata for prompt generation ───

interface SignMeta {
  slug: string;
  name: string;
  creature: string;
  element: string;
  colors: string;
}

const SIGNS: SignMeta[] = [
  { slug: 'aries', name: 'Aries', creature: 'ram with curved horns', element: 'Fire', colors: 'crimson red, deep purple, and gold' },
  { slug: 'taurus', name: 'Taurus', creature: 'bull', element: 'Earth', colors: 'emerald green, dark forest, and gold' },
  { slug: 'gemini', name: 'Gemini', creature: 'twin figures', element: 'Air', colors: 'sky blue, silver, and midnight blue' },
  { slug: 'cancer', name: 'Cancer', creature: 'crab', element: 'Water', colors: 'moonlight silver, deep ocean blue, and violet' },
  { slug: 'leo', name: 'Leo', creature: 'majestic lion', element: 'Fire', colors: 'royal gold, warm amber, and deep red' },
  { slug: 'virgo', name: 'Virgo', creature: 'maiden holding wheat', element: 'Earth', colors: 'sage green, cream, and dark earth tones' },
  { slug: 'libra', name: 'Libra', creature: 'balanced scales', element: 'Air', colors: 'rose pink, lavender, and soft blue' },
  { slug: 'scorpio', name: 'Scorpio', creature: 'scorpion', element: 'Water', colors: 'deep maroon, black, and electric purple' },
  { slug: 'sagittarius', name: 'Sagittarius', creature: 'centaur archer drawing a bow', element: 'Fire', colors: 'indigo, burnt orange, and violet' },
  { slug: 'capricorn', name: 'Capricorn', creature: 'sea-goat', element: 'Earth', colors: 'charcoal, dark green, and bronze' },
  { slug: 'aquarius', name: 'Aquarius', creature: 'water bearer pouring cosmic water', element: 'Air', colors: 'electric blue, teal, and silver' },
  { slug: 'pisces', name: 'Pisces', creature: 'two fish swimming in opposite directions', element: 'Water', colors: 'deep ocean blue, seafoam, and violet' },
];

const ELEMENT_THEMES: Record<string, string> = {
  Fire: 'swirling flames and ember particles floating in deep space, warm orange and crimson nebula',
  Earth: 'crystalline formations and ancient stone textures floating among stars, deep forest and emerald cosmic dust',
  Air: 'flowing wind currents and cloud wisps in the cosmos, ethereal blue and silver star trails',
  Water: 'cosmic ocean with underwater-meets-space aesthetics, deep blue bioluminescent waves and starlight reflections',
};

// ─── Prompt builders ───

function constellationPrompt(sign: SignMeta): string {
  return `Stunning digital art of the ${sign.name} constellation pattern glowing in deep space. Stars connected by faint luminous lines forming the ${sign.name} shape. Dark cosmic background with ${sign.colors} nebula clouds. Scattered distant stars and cosmic dust. Cinematic, atmospheric, moody. No text, no letters, no words, no writing.`;
}

function mythicalPrompt(sign: SignMeta): string {
  return `Ethereal cosmic illustration of a ${sign.creature} made of stardust and constellation light, floating in deep space. Mystical ${sign.colors} color palette. Nebula swirls and distant galaxies in the dark background. Dreamy, magical atmosphere. Digital art, high detail. No text, no letters, no words, no writing.`;
}

function elementPrompt(sign: SignMeta): string {
  return `Abstract cosmic scene with ${ELEMENT_THEMES[sign.element]}. ${sign.colors} color palette dominating the composition. Dark background suitable for text overlay. Atmospheric, cinematic digital art. No text, no letters, no words, no writing.`;
}

const ENGAGEMENT_PROMPTS: string[] = [
  'Mystical zodiac wheel with all 12 zodiac symbols arranged in a glowing circle, floating in deep space with purple and blue nebula. Dark atmospheric background. Digital art. No text, no letters, no words, no writing.',
  'Cosmic nebula scene with swirling purple, blue, and magenta gas clouds among scattered stars. Deep space background, cinematic and atmospheric. No text, no letters, no words, no writing.',
  'Full moon glowing in a starfield with cosmic dust and aurora-like light streaks in purple and blue tones. Dark moody atmosphere. Digital art. No text, no letters, no words, no writing.',
  'Abstract cosmic mandala pattern made of starlight and constellation lines, sacred geometry in deep space. Purple and gold accents on dark background. No text, no letters, no words, no writing.',
  'Ethereal galaxy spiral viewed from above with millions of stars, purple and blue cosmic dust swirling. Dark space background, cinematic. No text, no letters, no words, no writing.',
  'Mystical crystal ball floating in space reflecting zodiac constellations and starlight. Deep purple and blue atmosphere. Digital art. No text, no letters, no words, no writing.',
  'Cosmic sunrise over a planet horizon with zodiac constellation patterns visible in the sky. Dark space with warm purple and gold light. No text, no letters, no words, no writing.',
  'Northern lights aurora borealis in space with cosmic stars and nebula clouds. Deep blue, green, and purple palette. Atmospheric digital art. No text, no letters, no words, no writing.',
  'Star map of the night sky with constellation lines glowing softly, overlaid on a deep blue-purple cosmic background. Vintage astronomical chart meets modern digital art. No text, no letters, no words, no writing.',
  'Cosmic tarot-inspired scene with moon phases arranged in an arc across deep space, surrounded by stars and nebula. Purple and silver tones. No text, no letters, no words, no writing.',
  'Meteor shower streaking across a dark cosmic sky with distant galaxies and nebula clouds in purple and blue. Cinematic digital art. No text, no letters, no words, no writing.',
  'Mystical portal or cosmic eye shape made of swirling stars and nebula gas, glowing with purple and gold light in deep space. No text, no letters, no words, no writing.',
  'Two celestial bodies (planets or moons) in close orbit with cosmic rings and starlight between them. Deep space, blue and purple tones. No text, no letters, no words, no writing.',
  'Abstract cosmic landscape with floating islands of crystal and stone among stars and nebula clouds. Purple, blue, and teal palette. Dreamy atmospheric digital art. No text, no letters, no words, no writing.',
];

const SIGN_PROMPT_BUILDERS = [constellationPrompt, mythicalPrompt, elementPrompt];

// ─── Image generation + download ───

async function generateAndSave(prompt: string, filename: string): Promise<void> {
  const filepath = join(OUTPUT_DIR, filename);

  // Skip if already exists (allows resuming interrupted runs)
  if (existsSync(filepath)) {
    console.log(`  [skip] ${filename} already exists`);
    return;
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image URL in response');

    // Download the image
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const arrayBuf = await res.arrayBuffer();

    // Resize to exact dimensions and save
    const resized = await sharp(Buffer.from(arrayBuf))
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();

    writeFileSync(filepath, resized);
    console.log(`  [done] ${filename}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  [FAIL] ${filename}: ${msg}`);
  }
}

// ─── Main ───

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const total = SIGNS.length * SIGN_PROMPT_BUILDERS.length + ENGAGEMENT_PROMPTS.length;
  let completed = 0;

  console.log(`Generating ${total} images to ${OUTPUT_DIR}\n`);

  // Sign-specific backgrounds (12 signs × 3 styles)
  for (const sign of SIGNS) {
    console.log(`${sign.name}:`);
    for (let v = 0; v < SIGN_PROMPT_BUILDERS.length; v++) {
      const prompt = SIGN_PROMPT_BUILDERS[v](sign);
      await generateAndSave(prompt, `horoscope-${sign.slug}-${v}.png`);
      completed++;
      console.log(`  Progress: ${completed}/${total}`);
      // Rate limit: DALL-E 3 allows ~5 req/min on most tiers
      await sleep(13_000);
    }
  }

  // Engagement backgrounds
  console.log('\nEngagement backgrounds:');
  for (let i = 0; i < ENGAGEMENT_PROMPTS.length; i++) {
    await generateAndSave(ENGAGEMENT_PROMPTS[i], `engagement-${i}.png`);
    completed++;
    console.log(`  Progress: ${completed}/${total}`);
    await sleep(13_000);
  }

  console.log(`\nDone! ${completed} images generated.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch(console.error);
