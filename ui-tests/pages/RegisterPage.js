class RegisterPage {
  constructor(page) {
    this.page = page;
    this.genderMale = '#gender-male';
    this.firstName = '#FirstName';
    this.lastName = '#LastName';
    this.email = '#Email';
    this.password = '#Password';
    this.confirmPassword = '#ConfirmPassword';
    this.registerButton = '#register-button';
    this.successMessage = '.result';
  }

  async goto() {
    await this.page.goto('/register');
  }

  async registerUser(userData) {
    await this.page.check(this.genderMale);
    await this.page.fill(this.firstName, userData.firstName);
    await this.page.fill(this.lastName, userData.lastName);
    await this.page.fill(this.email, userData.email);
    await this.page.fill(this.password, userData.password);
    await this.page.fill(this.confirmPassword, userData.password);
    await this.page.click(this.registerButton);
  }
}

module.exports = RegisterPage;
