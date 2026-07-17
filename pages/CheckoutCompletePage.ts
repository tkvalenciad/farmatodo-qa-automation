import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object de la pantalla de confirmación de la orden (paso 7).
 */
export class CheckoutCompletePage extends BasePage {
  private readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
  }

  /** Devuelve el mensaje de confirmación mostrado al completar la compra. */
  async getConfirmationMessage(): Promise<string> {
    return (await this.completeHeader.textContent())?.trim() ?? '';
  }
}
