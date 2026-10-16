const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');

test('Q3: E2E - Search, Add, Checkout, Confirm Order', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);

  await loginPage.goto();
  await loginPage.login('existinguser@test.com', 'Password123!');

  await productPage.searchProduct('Smartphone');
  await productPage.openFirstProduct();
  await productPage.setQuantity(2);
  await productPage.addToCart();

  await page.goto('/cart');
  await productPage.agreeToTermsAndCheckout();

  await page.click('input[value="Continue"]');
  await page.click('input[value="Continue"]');
  await page.click('input[value="Continue"]');
  await page.click('input[value="Continue"]');
  await page.click('input[value="Continue"]');
  await page.click('input[value="Confirm"]');

  await expect(page.locator('.title')).toContainText('Your order has been successfully processed!');
});
