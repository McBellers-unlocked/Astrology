// Social posting notification helpers.
//
// - sendFailureAlert(): immediate email on post failure
// - sendDigestEmail(): daily summary of all posts
// - appendResults(): persist results to JSONL for the digest
// - readTodayResults(): read today's results from JSONL

import { readFileSync, appendFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import resend, { FROM_EMAIL } from '../lib/resend.js';

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'noreply@stellera.co';
const RESULTS_FILE = join(homedir(), 'social-posts-results.jsonl');

export interface PostResult {
  timestamp: string;
  scheduledFor: string;
  type: 'horoscope' | 'engagement' | 'thread';
  sign?: string;
  success: boolean;
  tweetId?: string;
  error?: string;
}

export async function sendFailureAlert(result: PostResult): Promise<void> {
  const label = result.type === 'horoscope'
    ? `${result.sign?.toUpperCase()} horoscope`
    : result.type === 'thread'
      ? 'Thread'
      : 'Engagement post';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `[Stellara] Post failed: ${label} (${result.scheduledFor})`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #1a1a2e;">
          <h2 style="color: #dc2626;">Social Post Failed</h2>
          <p><strong>Type:</strong> ${label}</p>
          <p><strong>Scheduled:</strong> ${result.scheduledFor}</p>
          <p><strong>Time:</strong> ${result.timestamp}</p>
          <p><strong>Error:</strong></p>
          <pre style="background:#f3f4f6;padding:12px;border-radius:8px;overflow-x:auto;">${result.error}</pre>
          <p style="color:#666;font-size:13px;margin-top:24px;">— Stellara Social Bot</p>
        </div>
      `,
    });
    console.log(`  [notify] Failure alert sent to ${OWNER_EMAIL}`);
  } catch (err) {
    console.error(`  [notify] Failed to send failure alert:`, err);
  }
}

export async function sendDigestEmail(results: PostResult[]): Promise<void> {
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const statusColor = failures.length > 0 ? '#dc2626' : '#16a34a';
  const statusText = failures.length > 0
    ? `${failures.length} failure${failures.length > 1 ? 's' : ''}`
    : 'All posts succeeded';

  const rows = results.map(r => {
    const icon = r.success ? '&#10003;' : '&#10007;';
    const color = r.success ? '#16a34a' : '#dc2626';
    const label = r.type === 'horoscope' ? (r.sign ?? 'horoscope') : 'engagement';
    const detail = r.success ? (r.tweetId ?? '') : (r.error?.slice(0, 60) ?? '');
    return `<tr>
      <td style="padding:4px 8px;"><span style="color:${color};">${icon}</span></td>
      <td style="padding:4px 8px;">${r.scheduledFor}</td>
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px;font-size:12px;color:#666;">${detail}</td>
    </tr>`;
  }).join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `[Stellara] Daily posting digest — ${successes.length}/${results.length} posted`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1a1a2e;">
          <h2>Social Posting Digest</h2>
          <p>${dateStr}</p>
          <p style="font-size:18px;font-weight:600;color:${statusColor};">
            ${statusText} (${successes.length}/${results.length})
          </p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="padding:4px 8px;text-align:left;"></th>
                <th style="padding:4px 8px;text-align:left;">Time</th>
                <th style="padding:4px 8px;text-align:left;">Post</th>
                <th style="padding:4px 8px;text-align:left;">Detail</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#666;font-size:13px;">— Stellara Social Bot</p>
        </div>
      `,
    });
    console.log(`[digest] Daily digest sent to ${OWNER_EMAIL}`);
  } catch (err) {
    console.error(`[digest] Failed to send digest:`, err);
  }
}

export function appendResults(results: PostResult[]): void {
  const lines = results.map(r => JSON.stringify(r)).join('\n') + '\n';
  appendFileSync(RESULTS_FILE, lines, 'utf-8');
}

export function readTodayResults(): PostResult[] {
  try {
    const content = readFileSync(RESULTS_FILE, 'utf-8');
    const today = new Date().toISOString().slice(0, 10);
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as PostResult)
      .filter(r => r.timestamp.startsWith(today));
  } catch {
    return [];
  }
}

export function clearResultsFile(): void {
  writeFileSync(RESULTS_FILE, '', 'utf-8');
}
