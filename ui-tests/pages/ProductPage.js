class ProductPage {
  constructor(page) {
    this.page = page;
    this.searchInput = '#small-searchterms';
    this.searchButton = 'input[value="Search"]';
    this.productTitle = '.product-title a';
    this.addToCartButton = 'input[value="Add to cart"]';
    this.quantityInput = 'input.qty-input';
    this.termsCheckbox = '#termsofservice';
    this.checkoutButton = '#checkout';
  }

  async searchProduct(productName) {
    await this.page.fill(this.searchInput, productName);
    await this.page.click(this.searchButton);
  }

  async openFirstProduct() {
    await this.page.locator(this.productTitle).first().click();
  }

  async setQuantity(qty) {
    const qtyField = this.page.locator(this.quantityInput).first();
    await qtyField.fill(qty.toString());
  }

  async addToCart() {
    await this.page.locator(this.addToCartButton).first().click();
    await this.page.waitForTimeout(1500);
  }

  async agreeToTermsAndCheckout() {
    await this.page.check(this.termsCheckbox);
    await this.page.click(this.checkoutButton);
  }
}

module.exports = ProductPage;
