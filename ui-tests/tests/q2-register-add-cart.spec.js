const { test, expect } = require('@playwright/test');
const RegisterPage = require('../pages/RegisterPage');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');

test('Q2: Register + Add Product to Cart', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);

  const randomEmail = `user${Date.now()}@test.com`;

  await registerPage.goto();
  await registerPage.registerUser({
    firstName: 'John',
    lastName: 'Doe',
    email: randomEmail,
    password: 'Password123!'
  });
  await expect(page.locator('.result')).toContainText('Your registration completed');

  await loginPage.goto();
  await loginPage.login(randomEmail, 'Password123!');
  await expect(page.locator('.account').first()).toContainText(randomEmail);

  await productPage.searchProduct('Laptop');
  await productPage.openFirstProduct();
  await productPage.setQuantity(2);
  await productPage.addToCart();

  await page.goto('/cart');
  await expect(page.locator('.qty-input')).toHaveValue('2');
  await expect(page.locator('.product-name')).toContainText('Laptop');
});
