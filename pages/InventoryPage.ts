import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage, type ProductInfo } from './BasePage';

export class InventoryPage extends BasePage {
  private readonly title: Locator;
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByText('Products', { exact: true });
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  private productCard(productName: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async getProductInfo(productName: string): Promise<ProductInfo> {
    const card = this.productCard(productName);
    await expect(card, `No se encontró el producto "${productName}" en el catálogo`).toBeVisible();
    return this.readProductInfo(card);
  }

  async addProductToCart(productName: string): Promise<void> {
    const card = this.productCard(productName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(this.cartBadge).toHaveText('1');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
