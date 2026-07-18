import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ProductInfo } from './InventoryPage';

export class CheckoutOverviewPage extends BasePage {
  private readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.getByTestId('finish');
  }

  private overviewItem(productName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async getProductInfo(productName: string): Promise<ProductInfo> {
    const item = this.overviewItem(productName);
    await expect(item, `El producto "${productName}" no está en el resumen`).toBeVisible();

    const name = (await item.getByTestId('inventory-item-name').textContent())?.trim() ?? '';
    const price = (await item.getByTestId('inventory-item-price').textContent())?.trim() ?? '';
    return { name, price };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
