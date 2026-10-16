const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
  use: {
    baseURL: 'http://demowebshop.tricentis.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
});
