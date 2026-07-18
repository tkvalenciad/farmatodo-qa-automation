import { env } from '../../config/env';
import { expect, test } from '../../fixtures/pages.fixture';
import { testData } from '../../fixtures/test-data';

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

    await test.step('Ingresar y hacer login', async () => {
      await loginPage.open();
      await loginPage.login(env.e2e.username, env.e2e.password);
      await inventoryPage.expectLoaded();
    });

    const captured = await test.step('Localizar producto y capturar datos', async () => {
      const info = await inventoryPage.getProductInfo(product.name);
      expect(info.name).toBe(product.name);
      expect(info.price).toMatch(/^\$\d+\.\d{2}$/);
      return info;
    });

    await test.step('Añadir producto al carrito', async () => {
      await inventoryPage.addProductToCart(product.name);
      await inventoryPage.openCart();
    });

    await test.step('Validar producto en el carrito', async () => {
      const inCart = await cartPage.getProductInfo(product.name);
      expect(inCart.name, 'El nombre en el carrito debe coincidir con el capturado').toBe(
        captured.name,
      );
      expect(inCart.price, 'El precio en el carrito debe coincidir con el capturado').toBe(
        captured.price,
      );
    });

    await test.step('Completar el checkout', async () => {
      await cartPage.checkout();
      await checkoutInformationPage.fillAndContinue(customer);

      const inOverview = await checkoutOverviewPage.getProductInfo(product.name);
      expect(inOverview.name).toBe(captured.name);
      expect(inOverview.price).toBe(captured.price);

      await checkoutOverviewPage.finish();
    });

    await test.step('Verificar confirmación de la orden', async () => {
      const message = await checkoutCompletePage.getConfirmationMessage();
      expect(message).toBe(confirmation.message);
    });
  });
});
