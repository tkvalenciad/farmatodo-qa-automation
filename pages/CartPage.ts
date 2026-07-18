import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage, type ProductInfo } from './BasePage';

export class CartPage extends BasePage {
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  private cartItem(productName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async getProductInfo(productName: string): Promise<ProductInfo> {
    const item = this.cartItem(productName);
    await expect(item, `El producto "${productName}" no está en el carrito`).toBeVisible();
    return this.readProductInfo(item);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
