import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage, type ProductInfo } from './BasePage';

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
    return this.readProductInfo(item);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
