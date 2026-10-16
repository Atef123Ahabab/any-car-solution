const { test, expect } = require('@playwright/test');
const { capture } = require('../utils/screenshotHelper');

test.describe('Q2: Register + Login + Browse (Car Rental App)', () => {
  const BASE = 'http://localhost:5174';
  const testName = 'Q2-register-and-browse';
  const randomEmail = `test_${Date.now()}@automation.com`;
  const password = 'Test123456';

  test('register, login, browse cars', async ({ page }) => {
    let step = 0;

    // Step 1 — Go to cars page
    await page.goto(`${BASE}/cars`);
    await page.waitForTimeout(1500);
    await capture(page, testName, ++step, 'app-loaded');

    // Step 2 — Open login modal
    await page.getByRole('button', { name: /^login$/i }).first().click();
    await page.waitForTimeout(800);
    await capture(page, testName, ++step, 'login-modal-open');

    // Step 3 — Switch to signup
    await page.getByText(/sign up/i).click();
    await page.waitForTimeout(500);
    await capture(page, testName, ++step, 'signup-mode');

    // Step 4 — Fill registration form
    await page.getByPlaceholder(/email/i).fill(randomEmail);
    await page.getByPlaceholder(/password/i).fill(password);
    const dropdown = page.locator('select');
    if (await dropdown.count() > 0) {
      await dropdown.selectOption('customer').catch(() => {});
    }
    await page.waitForTimeout(500);
    await capture(page, testName, ++step, 'registration-form-filled');

    // Step 5 — Submit registration
    await page.getByRole('button', { name: /register/i }).first().click();
    await page.waitForTimeout(2500);
    await capture(page, testName, ++step, 'registration-success');

    // Step 6 — Fill login form with NEW account
    await page.getByPlaceholder(/email/i).fill(randomEmail);
    await page.getByPlaceholder(/password/i).fill(password);
    await page.waitForTimeout(500);
    await capture(page, testName, ++step, 'login-form-with-new-account');

    // Step 7 — Submit login
    await page.getByRole('button', { name: /^login$/i }).last().click();
    await page.waitForTimeout(2500);
    await capture(page, testName, ++step, 'after-login');

    // Step 8 — Verify login by checking localStorage instead of page text
    const isAuth = await page.evaluate(() => localStorage.getItem('isAuthenticated'));
    await capture(page, testName, ++step, 'auth-state-checked');
    expect(isAuth).toBe('true');
  });
});
