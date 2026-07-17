import type { CustomerInfo } from '../pages/CheckoutInformationPage';

/**
 * Datos de prueba del flujo E2E.
 *
 * Centralizados aquí para que los tests describan el "qué" y no el "con qué
 * valores". Si mañana cambia el producto o el comprador, se ajusta un único lugar.
 */
export const testData = {
  /** Producto bajo prueba requerido por el enunciado. */
  product: {
    name: 'Sauce Labs Fleece Jacket',
  },

  /** Datos del comprador para el checkout. */
  customer: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    postalCode: '110111',
  } satisfies CustomerInfo,

  /** Texto esperado en la pantalla de confirmación. */
  confirmation: {
    message: 'Thank you for your order!',
  },
} as const;
