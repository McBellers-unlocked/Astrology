import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'data', 'stellara.db');

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                    TEXT PRIMARY KEY,
    email                 TEXT UNIQUE NOT NULL,
    password_hash         TEXT NOT NULL,
    name                  TEXT NOT NULL,
    created_at            TEXT DEFAULT (datetime('now')),

    -- Subscription
    stripe_customer_id    TEXT,
    subscription_tier     TEXT DEFAULT 'free',
    subscription_status   TEXT DEFAULT 'none',
    subscription_end_date TEXT,

    -- Birth chart data
    birth_date            TEXT,
    birth_time            TEXT,
    birth_location        TEXT,
    sun_sign              TEXT,
    moon_sign             TEXT,
    rising_sign           TEXT
  );

  CREATE TABLE IF NOT EXISTS email_subscribers (
    id         TEXT PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    source     TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_horoscopes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sign            TEXT NOT NULL,
    date            TEXT NOT NULL,
    teaser          TEXT NOT NULL,
    overall_rating  INTEGER NOT NULL,
    love_rating     INTEGER NOT NULL,
    career_rating   INTEGER NOT NULL,
    wellness_rating INTEGER NOT NULL,
    paragraph_1     TEXT NOT NULL,
    paragraph_2     TEXT NOT NULL,
    paragraph_3     TEXT NOT NULL,
    paragraph_4     TEXT NOT NULL,
    lucky_number    INTEGER NOT NULL,
    lucky_color     TEXT NOT NULL,
    compatibility   TEXT NOT NULL,
    moon_reading_1  TEXT NOT NULL,
    moon_reading_2  TEXT NOT NULL,
    rising_reading_1 TEXT NOT NULL,
    rising_reading_2 TEXT NOT NULL,
    created_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(sign, date)
  );
`);

export default db;
