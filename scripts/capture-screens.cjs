const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:9000';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/work/captures';

async function ensureDir() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@inquiry.local');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(1500);
}

async function capturePage(page, route, fileName, waitMs = 1500) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(waitMs);
  const filePath = path.join(OUTPUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Captured: ${filePath}`);
}

(async () => {
  await ensureDir();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  await login(page);

  await capturePage(page, '/dashboard', '01-dashboard.png');
  await capturePage(page, '/quotes', '02-quotes-grid.png');

  await page.goto(`${BASE_URL}/quotes/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Calculate & Issue Quote")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-new-quote-result.png'), fullPage: true });
  console.log(`Captured: ${path.join(OUTPUT_DIR, '03-new-quote-result.png')}`);

  await capturePage(page, '/admin/users', '04-admin-users-grid.png');
  await capturePage(page, '/tariffs', '05-tariff-grid.png');

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
