class CartPage {
  constructor(page) {
    this.page = page;
    this.cartQuantity = '.qty-input';
    this.productName = '.product-name';
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async getCartQuantity() {
    return await this.page.locator(this.cartQuantity).first().inputValue();
  }

  async getProductName() {
    return await this.page.locator(this.productName).first().textContent();
  }
}

module.exports = CartPage;
