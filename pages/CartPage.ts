import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ProductInfo } from './InventoryPage';

/**
 * Page Object del carrito de compras de SauceDemo.
 * Representa el paso 6: verificar el producto y avanzar al checkout.
 */
export class CartPage extends BasePage {
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  /** Contenedor del ítem del carrito identificado por su nombre visible. */
  private cartItem(productName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** Devuelve nombre y precio del producto tal como aparecen en el carrito. */
  async getProductInfo(productName: string): Promise<ProductInfo> {
    const item = this.cartItem(productName);
    await expect(item, `El producto "${productName}" no está en el carrito`).toBeVisible();

    const name = (await item.getByTestId('inventory-item-name').textContent())?.trim() ?? '';
    const price = (await item.getByTestId('inventory-item-price').textContent())?.trim() ?? '';
    return { name, price };
  }

  /** Avanza a la pantalla de información del checkout. */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
