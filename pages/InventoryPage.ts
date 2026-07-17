import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Datos de un producto capturados desde el catálogo. */
export interface ProductInfo {
  name: string;
  price: string;
}

/**
 * Page Object del catálogo (inventario) de SauceDemo.
 * Representa los pasos 3-5: localizar el producto, capturar sus datos y
 * añadirlo al carrito. El producto se localiza por texto visible (resiliente),
 * no por selectores dinámicos por-producto ni por posición en el DOM.
 */
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

  /** Verifica que el catálogo se cargó correctamente. */
  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /** Contenedor del producto identificado por su nombre visible. */
  private productCard(productName: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** Captura nombre y precio del producto para validaciones posteriores. */
  async getProductInfo(productName: string): Promise<ProductInfo> {
    const card = this.productCard(productName);
    await expect(card, `No se encontró el producto "${productName}" en el catálogo`).toBeVisible();

    const name = (await card.getByTestId('inventory-item-name').textContent())?.trim() ?? '';
    const price = (await card.getByTestId('inventory-item-price').textContent())?.trim() ?? '';
    return { name, price };
  }

  /** Añade el producto indicado al carrito. */
  async addProductToCart(productName: string): Promise<void> {
    const card = this.productCard(productName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(this.cartBadge).toHaveText('1');
  }

  /** Abre el carrito de compras. */
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
