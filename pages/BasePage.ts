import type { Page } from '@playwright/test';

/**
 * Clase base de todos los Page Objects.
 *
 * Concentra la dependencia de `Page` y las utilidades comunes de navegación,
 * evitando duplicación entre las páginas concretas del flujo E2E.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navega a una ruta relativa a la `baseURL` configurada. */
  protected async navigate(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
