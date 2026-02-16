import { Router } from 'express';
import db from '../db.js';

const router = Router();

interface HoroscopeRow {
  sign: string;
  date: string;
  teaser: string;
  overall_rating: number;
  love_rating: number;
  career_rating: number;
  wellness_rating: number;
  paragraph_1: string;
  paragraph_2: string;
  paragraph_3: string;
  paragraph_4: string;
  lucky_number: number;
  lucky_color: string;
  compatibility: string;
  moon_reading_1: string;
  moon_reading_2: string;
  rising_reading_1: string;
  rising_reading_2: string;
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatRow(row: HoroscopeRow) {
  return {
    sign: row.sign,
    date: row.date,
    teaser: row.teaser,
    ratings: {
      overall: row.overall_rating,
      love: row.love_rating,
      career: row.career_rating,
      wellness: row.wellness_rating,
    },
    paragraphs: [row.paragraph_1, row.paragraph_2, row.paragraph_3, row.paragraph_4],
    lucky: {
      number: row.lucky_number,
      color: row.lucky_color,
      compatibility: row.compatibility,
    },
    moonReading: [row.moon_reading_1, row.moon_reading_2],
    risingReading: [row.rising_reading_1, row.rising_reading_2],
  };
}

// GET /horoscopes/today — all 12 signs
router.get('/today', (_req, res) => {
  try {
    const dateStr = getToday();
    const rows = db.prepare(
      'SELECT * FROM daily_horoscopes WHERE date = ?'
    ).all(dateStr) as HoroscopeRow[];

    if (rows.length === 0) {
      res.status(404).json({ error: 'Horoscopes not yet generated for today' });
      return;
    }

    const horoscopes: Record<string, ReturnType<typeof formatRow>> = {};
    for (const row of rows) {
      horoscopes[row.sign] = formatRow(row);
    }

    res.json({ date: dateStr, horoscopes });
  } catch (err) {
    console.error('Error fetching horoscopes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /horoscopes/today/:sign — single sign
router.get('/today/:sign', (req, res) => {
  try {
    const { sign } = req.params;
    const dateStr = getToday();
    const row = db.prepare(
      'SELECT * FROM daily_horoscopes WHERE date = ? AND sign = ?'
    ).get(dateStr, sign) as HoroscopeRow | undefined;

    if (!row) {
      res.status(404).json({ error: `Horoscope for ${sign} not yet generated for today` });
      return;
    }

    res.json(formatRow(row));
  } catch (err) {
    console.error('Error fetching horoscope:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
