/**
 * Portfolio screenshot capture — creates beautiful, high-res screenshots
 * of the running car rental app for portfolio use.
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5174';
const OUT = path.join(__dirname, 'portfolio-shots');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  console.log('📸 Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,          // Retina quality — crisp for portfolio
    colorScheme: 'light',
  });
  const page = await context.newPage();

  // ── 1. Hero / Landing page (full-page) ─────────────────────────
  console.log('📸 [1/7] Home page (full page)...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(OUT, '01-home-full-page.png'),
    fullPage: true,
  });

  // ── 2. Hero / Landing page (viewport hero) ─────────────────────
  console.log('📸 [2/7] Home hero (above fold)...');
  await page.screenshot({
    path: path.join(OUT, '02-home-hero.png'),
    fullPage: false,
  });

  // ── 3. Cars list page ──────────────────────────────────────────
  console.log('📸 [3/7] Cars listing page...');
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(OUT, '03-cars-page.png'),
    fullPage: false,
  });

  // ── 4. Cars page — full-page with all cars ─────────────────────
  console.log('📸 [4/7] Cars page (full scroll)...');
  await page.screenshot({
    path: path.join(OUT, '04-cars-full-page.png'),
    fullPage: true,
  });

  // ── 5. Login modal ─────────────────────────────────────────────
  console.log('📸 [5/7] Login modal...');
  await page.getByRole('button', { name: /^login$/i }).first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, '05-login-modal.png'),
    fullPage: false,
  });

  // ── 6. Signup form ─────────────────────────────────────────────
  console.log('📸 [6/7] Signup form...');
  await page.getByText(/sign up/i).click();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(OUT, '06-signup-form.png'),
    fullPage: false,
  });

  // ── 7. Logged-in state (dashboard/user view) ───────────────────
  console.log('📸 [7/7] Logged-in state...');
  // Close the modal first
  await page.keyboard.press('Escape').catch(() => {});
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Log in with existing user
  await page.getByRole('button', { name: /^login$/i }).first().click();
  await page.waitForTimeout(800);
  await page.getByPlaceholder(/email/i).fill('ahababatef14@gmail.com');
  await page.getByPlaceholder(/password/i).fill('test123456');
  await page.getByRole('button', { name: /^login$/i }).last().click();
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: path.join(OUT, '07-logged-in-view.png'),
    fullPage: false,
  });

  // ── Bonus: Dark mode if available ──────────────────────────────
  console.log('📸 [BONUS] Dark mode toggle (if present)...');
  const darkToggle = page.locator('[class*="dark"], [class*="theme"], button[aria-label*="dark"]').first();
  if (await darkToggle.count() > 0) {
    await darkToggle.click().catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT, '08-dark-mode.png'),
      fullPage: true,
    });
  }

  await browser.close();

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ Portfolio screenshots saved to:');
  console.log(`     ${OUT}`);
  console.log('═══════════════════════════════════════════');

  // List all files
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  files.forEach(f => {
    const stats = fs.statSync(path.join(OUT, f));
    const kb = (stats.size / 1024).toFixed(0);
    console.log(`  📸 ${f}  (${kb} KB)`);
  });
})();
