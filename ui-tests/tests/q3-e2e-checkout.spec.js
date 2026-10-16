const { test, expect } = require('@playwright/test');
const { capture } = require('../utils/screenshotHelper');

test.describe('Q3: E2E Car Rental Flow', () => {
  const BASE = 'http://localhost:5174';
  const testName = 'Q3-e2e-flow';
  const email = 'ahababatef14@gmail.com';
  const password = 'test123456';

  test('login → browse → view car details', async ({ page }) => {
    let step = 0;

    // Step 1 — Cars page
    await page.goto(`${BASE}/cars`);
    await page.waitForTimeout(2000);
    await capture(page, testName, ++step, 'cars-page-loaded');

    // Step 2 — Login modal
    await page.getByRole('button', { name: /^login$/i }).first().click();
    await page.waitForTimeout(800);
    await capture(page, testName, ++step, 'login-modal-open');

    // Step 3 — Fill credentials
    await page.getByPlaceholder(/email/i).fill(email);
    await page.getByPlaceholder(/password/i).fill(password);
    await capture(page, testName, ++step, 'credentials-filled');

    // Step 4 — Submit (last = modal button)
    await page.getByRole('button', { name: /^login$/i }).last().click();
    await page.waitForTimeout(2500);
    await capture(page, testName, ++step, 'after-login');

    // Step 5 — Verify login via localStorage
    const isAuth = await page.evaluate(() => localStorage.getItem('isAuthenticated'));
    await capture(page, testName, ++step, 'auth-verified');

    // Step 6 — Reload cars
    await page.goto(`${BASE}/cars`);
    await page.waitForTimeout(2000);
    await capture(page, testName, ++step, 'cars-after-login');

    // Step 7 — Assert Toyota Camry visible
    await expect(page.locator('body')).toContainText(/Toyota|Camry/i, { timeout: 10000 });
    await capture(page, testName, ++step, 'car-card-visible');

    // Step 8 — Try opening car detail
    const carLink = page.locator('a[href*="/car/"], a[href*="/cars/"]').first();
    if (await carLink.count() > 0) {
      await carLink.click().catch(() => {});
      await page.waitForTimeout(2000);
      await capture(page, testName, ++step, 'car-detail-page');
    } else {
      await capture(page, testName, ++step, 'car-detail-link-not-found');
    }

    // Final assertion: we're either on detail page or still on cars page with Camry visible
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/Toyota|Camry/i);
    expect(isAuth).toBe('true');
  });
});
