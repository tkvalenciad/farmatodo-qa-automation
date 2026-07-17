import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

/**
 * Configuración central de Playwright.
 *
 * Punto único donde se definen ambientes, timeouts, reintentos y reporteo.
 * No existen timeouts inline en los tests: todo el control de tiempos vive aquí.
 */

/** Timeout global por test (ms). Fuente única de verdad para toda la suite. */
const GLOBAL_TEST_TIMEOUT = 60_000;

/** Timeout global para aserciones `expect` (ms). */
const EXPECT_TIMEOUT = 10_000;

/** Timeout para acciones (click, fill, ...) y navegación en el navegador (ms). */
const ACTION_TIMEOUT = 15_000;
const NAVIGATION_TIMEOUT = 30_000;

export default defineConfig({
  testDir: './tests',

  // Timeouts centralizados.
  timeout: GLOBAL_TEST_TIMEOUT,
  expect: { timeout: EXPECT_TIMEOUT },

  // Ejecución en paralelo dentro de cada archivo y entre archivos.
  fullyParallel: true,

  // Impide subir un `test.only` olvidado: en CI el build falla.
  forbidOnly: env.isCI,

  // Estrategia de resiliencia: reintentar en CI para absorber flakiness de
  // infraestructura, pero 0 reintentos en local para no enmascarar fallos reales.
  retries: env.isCI ? 2 : 0,

  // Un worker en CI para lograr ejecuciones más deterministas y logs legibles;
  // en local, Playwright usa el paralelismo por defecto según los núcleos.
  workers: env.isCI ? 1 : undefined,

  // Reporteo: HTML (artefacto descargable) + list para consola. En CI se añade
  // el reporter nativo de GitHub para anotar los fallos en el PR.
  reporter: env.isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    // Trazas y capturas solo cuando algo falla: útil para depurar sin inflar artefactos.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Suite de integración contra la PokéAPI. No requiere navegador: usa el
      // contexto `request` de Playwright, por eso no define un device de browser.
      name: 'integration',
      testDir: './tests/integration',
      use: {
        baseURL: env.api.baseUrl,
      },
    },
    {
      // Suite E2E sobre el sitio web (SauceDemo).
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.e2e.baseUrl,
        // SauceDemo expone atributos `data-test`; los usamos como testId para
        // que `getByTestId` produzca selectores resilientes al cambio de DOM.
        testIdAttribute: 'data-test',
      },
    },
  ],
});
