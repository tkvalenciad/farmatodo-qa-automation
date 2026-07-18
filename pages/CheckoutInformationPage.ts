import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutInformationPage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
  }

  async fillAndContinue(customer: CustomerInfo): Promise<void> {
    await expect(this.firstNameInput).toBeVisible();
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
    await this.continueButton.click();
  }
}
