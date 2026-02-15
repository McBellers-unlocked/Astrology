// Daily digest script.
//
// Reads today's posting results from the JSONL file,
// sends a summary email, and clears the file.
//
// Crontab entry (run once at 22:30 after all posting windows):
//   30 22 * * * cd ~/Astrology/api && /usr/bin/npx tsx src/social/digest.ts >> ~/social-posts.log 2>&1

import { readTodayResults, sendDigestEmail, clearResultsFile } from './notify.js';

async function main() {
  const results = readTodayResults();

  if (results.length === 0) {
    console.log(`[${new Date().toISOString()}] No posting results found for today — skipping digest.`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Sending daily digest: ${results.length} posts.`);
  await sendDigestEmail(results);

  clearResultsFile();
  console.log(`[${new Date().toISOString()}] Results file cleared.`);
}

main().catch(console.error);
