import { env } from '../../config/env';
import { expect, test } from '../../fixtures/pages.fixture';
import { testData } from '../../fixtures/test-data';

/**
 * Prueba E2E — flujo completo de compra en SauceDemo.
 *
 * Cada paso está representado por un Page Object independiente. El nombre y el
 * precio del producto se capturan en el catálogo y se validan con aserciones
 * explícitas en el carrito y en el resumen de la orden.
 */
test.describe('E2E — flujo de compra', () => {
  test('compra el Sauce Labs Fleece Jacket de principio a fin', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const { product, customer, confirmation } = testData;

    // Pasos 1-2: ingresar al sitio e iniciar sesión.
    await test.step('Ingresar y hacer login', async () => {
      await loginPage.open();
      await loginPage.login(env.e2e.username, env.e2e.password);
      await inventoryPage.expectLoaded();
    });

    // Pasos 3-4: localizar el producto y capturar nombre + precio.
    const captured = await test.step('Localizar producto y capturar datos', async () => {
      const info = await inventoryPage.getProductInfo(product.name);
      expect(info.name).toBe(product.name);
      expect(info.price).toMatch(/^\$\d+\.\d{2}$/);
      return info;
    });

    // Paso 5: añadir el producto al carrito.
    await test.step('Añadir producto al carrito', async () => {
      await inventoryPage.addProductToCart(product.name);
      await inventoryPage.openCart();
    });

    // Paso 6: validar que nombre y precio coinciden con lo capturado.
    await test.step('Validar producto en el carrito', async () => {
      const inCart = await cartPage.getProductInfo(product.name);
      expect(inCart.name, 'El nombre en el carrito debe coincidir con el capturado').toBe(
        captured.name,
      );
      expect(inCart.price, 'El precio en el carrito debe coincidir con el capturado').toBe(
        captured.price,
      );
    });

    // Paso 7: completar el checkout hasta la confirmación.
    await test.step('Completar el checkout', async () => {
      await cartPage.checkout();
      await checkoutInformationPage.fillAndContinue(customer);

      // Revalidación defensiva del producto en el resumen antes de finalizar.
      const inOverview = await checkoutOverviewPage.getProductInfo(product.name);
      expect(inOverview.name).toBe(captured.name);
      expect(inOverview.price).toBe(captured.price);

      await checkoutOverviewPage.finish();
    });

    // Verificación final: pantalla de confirmación de la orden.
    await test.step('Verificar confirmación de la orden', async () => {
      const message = await checkoutCompletePage.getConfirmationMessage();
      expect(message).toBe(confirmation.message);
    });
  });
});
