const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test('Q1: Invalid Login - Verify error message', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('invalid@test.com', 'wrongpassword');

  const errorMsg = await loginPage.getErrorMessage();
  expect(errorMsg).toContain('Login was unsuccessful');

  await expect(page.locator('.account').first()).toContainText('Log in');
});
