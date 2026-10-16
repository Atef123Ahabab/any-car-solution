const { test, expect } = require('@playwright/test');

/**
 * Q1: Invalid Login — Negative Auth Test
 * Runs against the Car Rental app (localhost:5174)
 * Verifies that bad credentials are rejected.
 */
test.describe('Q1: Invalid Login (Car Rental App)', () => {
  const BASE = 'http://localhost:5174';

  test('shows error for invalid credentials', async ({ page }) => {
    // 1. Go to the app
    await page.goto(`${BASE}/cars`);

    // 2. Open the login modal
    await page.getByRole('button', { name: /login/i }).first().click();

    // 3. Fill in invalid credentials
    await page.getByPlaceholder(/email/i).fill('nobody@invalid-test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword123');

    // 4. Submit the form
    await page.getByRole('button', { name: /^login$/i }).click();

    // 5. Assert error is shown
    await expect(page.locator('.login-error, [role="alert"]')).toBeVisible({ timeout: 10000 });
    const errorText = await page.locator('.login-error, [role="alert"]').textContent();
    expect(errorText.toLowerCase()).toMatch(/invalid|failed|unsuccessful|wrong|incorrect/);

    // 6. Assert NOT logged in (still shows "Login" button, not user name)
    await expect(page.getByRole('button', { name: /login/i }).first()).toBeVisible();
  });
});
