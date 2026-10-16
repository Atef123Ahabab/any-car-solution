const { test, expect } = require('@playwright/test');

/**
 * Q2: Register → Login → Browse Cars
 * Uses dynamic (timestamp) email so runs are independent.
 */
test.describe('Q2: Register + Login + Browse (Car Rental App)', () => {
  const BASE = 'http://localhost:5174';
  const randomEmail = `test_${Date.now()}@automation.com`;
  const password = 'Test123456';

  test('register, login, browse cars', async ({ page }) => {
    // 1. Go to app
    await page.goto(`${BASE}/cars`);

    // 2. Open login modal
    await page.getByRole('button', { name: /login/i }).first().click();

    // 3. Switch to Signup mode
    await page.getByText(/sign up/i).click();

    // 4. Fill registration form
    await page.getByPlaceholder(/email/i).fill(randomEmail);
    await page.getByPlaceholder(/password/i).fill(password);
    // Account type dropdown (if present)
    const dropdown = page.locator('select');
    if (await dropdown.count() > 0) {
      await dropdown.selectOption('customer').catch(() => {});
    }

    // 5. Submit
    await page.getByRole('button', { name: /register/i }).click();

    // 6. Wait for confirmation or login modal re-appearance
    await page.waitForTimeout(2000);

    // 7. Login with the new account
    await page.getByPlaceholder(/email/i).fill(randomEmail);
    await page.getByPlaceholder(/password/i).fill(password);
    await page.getByRole('button', { name: /^login$/i }).click();

    // 8. Assert logged in — logout or user name should appear
    await expect(page.locator('body')).toContainText(/logout|dashboard|my bookings/i, { timeout: 10000 });
  });
});
