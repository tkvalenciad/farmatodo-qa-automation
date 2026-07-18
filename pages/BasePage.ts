import { type Locator, type Page } from '@playwright/test';

export interface ProductInfo {
  name: string;
  price: string;
}

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async navigate(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  protected async readProductInfo(container: Locator): Promise<ProductInfo> {
    const name = (await container.getByTestId('inventory-item-name').textContent())?.trim() ?? '';
    const price = (await container.getByTestId('inventory-item-price').textContent())?.trim() ?? '';
    return { name, price };
  }
}
