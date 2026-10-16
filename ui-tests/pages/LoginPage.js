class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = '#Email';
    this.passwordInput = '#Password';
    this.loginButton = 'input[value="Log in"]';
    this.errorMessage = '.validation-summary-errors';
    this.accountLink = '.account';
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessage() {
    return await this.page.textContent(this.errorMessage);
  }
}

module.exports = LoginPage;
