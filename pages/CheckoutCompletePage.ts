import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  private readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.completeHeader.textContent())?.trim() ?? '';
  }
}
