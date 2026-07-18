import type { CustomerInfo } from '../pages/CheckoutInformationPage';

export const testData = {
  product: {
    name: 'Sauce Labs Fleece Jacket',
  },

  customer: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    postalCode: '110111',
  } satisfies CustomerInfo,

  confirmation: {
    message: 'Thank you for your order!',
  },
} as const;
