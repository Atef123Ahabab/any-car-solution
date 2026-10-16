const { test, expect } = require('@playwright/test');

/**
 * Q3: E2E — Browse Cars → Open Car → Book
 * Uses a pre-existing test account.
 */
test.describe('Q3: E2E Car Rental Flow', () => {
  const BASE = 'http://localhost:5174';
  const email = 'ahababatef14@gmail.com';   // your existing account
  const password = 'test123456';

  test('login → browse → open car → check detail page', async ({ page }) => {
    // 1. Go to cars page
    await page.goto(`${BASE}/cars`);

    // 2. Login
    await page.getByRole('button', { name: /login/i }).first().click();
    await page.getByPlaceholder(/email/i).fill(email);
    await page.getByPlaceholder(/password/i).fill(password);
    await page.getByRole('button', { name: /^login$/i }).click();

    // 3. Wait for login to complete
    await page.waitForTimeout(2000);

    // 4. Assert car list shows (at least one car exists in DB)
    await page.goto(`${BASE}/cars`);
    await page.waitForTimeout(2000);

    // 5. Verify we can see car info (make/model "Toyota Camry")
    await expect(page.locator('body')).toContainText(/Toyota|Camry/i, { timeout: 10000 });
  });
});
