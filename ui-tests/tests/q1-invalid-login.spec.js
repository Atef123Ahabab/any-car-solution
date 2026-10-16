const { test, expect } = require('@playwright/test');
const { capture } = require('../utils/screenshotHelper');

test.describe('Q1: Invalid Login (Car Rental App)', () => {
  const BASE = 'http://localhost:5174';
  const testName = 'Q1-invalid-login';

  test('shows error for invalid credentials', async ({ page }) => {
    let step = 0;

    // Step 1 — Navigate
    await page.goto(`${BASE}/cars`);
    await page.waitForTimeout(1500);
    await capture(page, testName, ++step, 'app-loaded');

    // Step 2 — Open login modal
    await page.getByRole('button', { name: /^login$/i }).first().click();
    await page.waitForTimeout(800);
    await capture(page, testName, ++step, 'login-modal-open');

    // Step 3 — Fill invalid credentials
    await page.getByPlaceholder(/email/i).fill('nobody@invalid-test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword123');
    await page.waitForTimeout(500);
    await capture(page, testName, ++step, 'invalid-credentials-filled');

    // Step 4 — Submit (use .last() to target modal button)
    await page.getByRole('button', { name: /^login$/i }).last().click();
    await page.waitForTimeout(2500);
    await capture(page, testName, ++step, 'after-submit');

    // Step 5 — Assert error is shown
    const errorLocator = page.locator('.login-error, [role="alert"]');
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
    const errorText = await errorLocator.textContent();
    await capture(page, testName, ++step, 'error-displayed');
    expect(errorText.toLowerCase()).toMatch(/invalid|failed|unsuccessful|wrong|incorrect/);

    // Step 6 — Still shows login button (not logged in)
    await capture(page, testName, ++step, 'still-not-logged-in');
  });
});
