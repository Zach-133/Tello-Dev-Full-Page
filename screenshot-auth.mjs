/**
 * screenshot-auth.mjs
 * Like screenshot.mjs but signs into Supabase first so protected pages load correctly.
 *
 * Usage:
 *   node screenshot-auth.mjs http://localhost:8080/form
 *   node screenshot-auth.mjs http://localhost:8080/form label
 *
 * Reads credentials from .env.local:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   SCREENSHOT_TEST_EMAIL
 *   SCREENSHOT_TEST_PASSWORD
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Read .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    });
}

const SUPABASE_URL  = env.VITE_SUPABASE_URL;
const ANON_KEY      = env.VITE_SUPABASE_ANON_KEY;
const TEST_EMAIL    = env.SCREENSHOT_TEST_EMAIL;
const TEST_PASSWORD = env.SCREENSHOT_TEST_PASSWORD;

if (!SUPABASE_URL || !ANON_KEY || !TEST_EMAIL || !TEST_PASSWORD) {
  console.error('Missing required env vars in .env.local:');
  console.error('  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SCREENSHOT_TEST_EMAIL, SCREENSHOT_TEST_PASSWORD');
  process.exit(1);
}

// Extract project ref from URL: https://PROJECTREF.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const localStorageKey = `sb-${projectRef}-auth-token`;

// ── Screenshot output ────────────────────────────────────────────────────────
const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

function getNextFilename(label) {
  const files = fs.existsSync(screenshotDir) ? fs.readdirSync(screenshotDir) : [];
  const nums = files
    .map(f => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
}

const targetUrl = process.argv[2] || 'http://localhost:8080/form';
const label     = process.argv[3] || '';

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  // 1. Sign in via Supabase REST API (no browser needed yet)
  console.log(`Signing in as ${TEST_EMAIL}…`);
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });

  if (!authRes.ok) {
    const err = await authRes.text();
    console.error('Supabase sign-in failed:', err);
    process.exit(1);
  }

  const session = await authRes.json();
  console.log('Signed in successfully.');

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disk-cache-size=0'],
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // 3. Load the app root first (so localStorage is on the right origin)
  const origin = new URL(targetUrl).origin;
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // 4. Inject the Supabase session into localStorage
  await page.evaluate((key, session) => {
    localStorage.setItem(key, JSON.stringify({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
      expires_in:    session.expires_in,
      expires_at:    session.expires_at,
      token_type:    session.token_type,
      user:          session.user,
    }));
  }, localStorageKey, session);

  // 5. Navigate to the target protected page
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2200)); // let animations settle

  // 6. Screenshot
  const filename = getNextFilename(label);
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });

  await browser.close();
  console.log(`Screenshot saved: temporary screenshots/${filename}`);
})();
