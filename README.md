# Farmatodo — QA Automation Framework

Framework de automatización de pruebas construido con **Playwright + TypeScript**, que cubre:

- **Prueba de integración** contra la [PokéAPI](https://pokeapi.co/) (cadena de evoluciones de un Pokémon).
- **Prueba E2E** del flujo completo de compra en [SauceDemo](https://www.saucedemo.com).
- **Pipeline CI/CD** con GitHub Actions.

El diseño sigue el patrón **Page Object Model (POM)**, con configuración por ambientes, timeouts y reintentos centralizados, y selectores resilientes.

---

## Requisitos previos

| Herramienta | Versión recomendada |
| ----------- | ------------------- |
| Node.js     | >= 18 (probado en 20) |
| npm         | >= 9                |

---

## Puesta en marcha (< 5 minutos)

```bash
# 1. Instalar dependencias
npm ci        # o "npm install" si no existe package-lock.json todavía

# 2. Instalar los navegadores de Playwright
npx playwright install

# 3. Crear tu archivo de entorno a partir de la plantilla
cp .env.example .env          # En Windows PowerShell: Copy-Item .env.example .env

# 4. Ejecutar toda la suite
npm test
```

> Los valores por defecto de `.env.example` ya apuntan a los sitios públicos de la
> prueba, por lo que el proyecto funciona sin cambios. Ajusta `.env` si necesitas
> otro ambiente o credenciales.

---

## Comandos disponibles

| Comando                    | Descripción                                             |
| -------------------------- | ------------------------------------------------------- |
| `npm test`                 | Ejecuta ambas suites (integración + E2E).               |
| `npm run test:integration` | Ejecuta solo la suite de integración (PokéAPI).         |
| `npm run test:e2e`         | Ejecuta solo la suite E2E (SauceDemo).                  |
| `npm run test:headed`      | Ejecuta la E2E con navegador visible.                   |
| `npm run test:ui`          | Abre el modo UI interactivo de Playwright.              |
| `npm run report`           | Abre el último reporte HTML generado.                   |
| `npm run typecheck`        | Verifica los tipos de TypeScript sin emitir archivos.   |
| `npm run lint`             | Ejecuta ESLint sobre el código.                         |

---

## Estructura del proyecto

```
.
├── .github/workflows/tests.yml   # Pipeline CI/CD (push + PR a main)
├── config/
│   └── env.ts                    # Carga y validación central de variables de entorno
├── pages/                        # Page Objects (un archivo por pantalla del flujo E2E)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInformationPage.ts
│   ├── CheckoutOverviewPage.ts
│   └── CheckoutCompletePage.ts
├── utils/                        # Helpers reutilizables
│   ├── sorting.ts                # Merge Sort propio (sin .sort() nativo)
│   └── api/                      # Cliente + modelos + errores de la PokéAPI
│       ├── pokeApiClient.ts
│       ├── pokemon.types.ts
│       └── errors.ts
├── fixtures/                     # Datos de prueba y fixtures de Playwright
│   ├── test-data.ts
│   └── pages.fixture.ts
├── tests/
│   ├── integration/pokemon-evolution.spec.ts
│   └── e2e/purchase-flow.spec.ts
├── playwright.config.ts          # Config central: ambientes, timeouts, reintentos, reportes
├── .env.example
├── .gitignore
├── DECISIONS.md
└── README.md
```

---

## Configuración por ambientes

Toda la configuración vive en variables de entorno (ver `.env.example`). El
archivo `config/env.ts` es el **único** punto que lee `process.env`; el resto del
código consume el objeto `env` tipado. Así no hay URLs ni credenciales
hardcodeadas y cambiar de `staging` a `prod` es solo cambiar `TEST_ENV`.

| Variable              | Descripción                                             |
| --------------------- | ------------------------------------------------------- |
| `TEST_ENV`            | Ambiente activo: `staging` \| `prod`.                   |
| `E2E_BASE_URL_PROD`   | URL base del sitio E2E en producción.                   |
| `E2E_BASE_URL_STAGING`| URL base del sitio E2E en staging.                      |
| `SAUCE_USERNAME`      | Usuario para el login de SauceDemo.                     |
| `SAUCE_PASSWORD`      | Contraseña para el login de SauceDemo.                  |
| `POKEAPI_BASE_URL`    | URL base de la PokéAPI.                                 |
| `POKEMON_UNDER_TEST`  | Pokémon inicial de la cadena a validar (ej. `squirtle`).|

---

## Resiliencia y manejo de flakiness

- **Reintentos por ambiente**: `retries: 2` en CI y `retries: 0` en local
  (definido en `playwright.config.ts` según la variable `CI`).
- **Timeouts centralizados**: un único lugar (`playwright.config.ts`) define el
  timeout global de test, de `expect`, de acciones y de navegación. No hay
  timeouts inline en los specs.
- **Errores de API accionables**: si un endpoint de la PokéAPI no responde 200,
  el test falla con un mensaje que incluye la URL exacta, el código HTTP y el
  paso en ejecución (ver `utils/api/errors.ts`).
- **Selectores resilientes**: la E2E usa `data-test` (vía `getByTestId`), roles
  ARIA y texto visible, evitando clases CSS o posiciones del DOM.

---

## CI/CD (GitHub Actions)

El workflow `.github/workflows/tests.yml`:

1. Se dispara en `push` a `main` y en Pull Requests hacia `main`.
2. Instala dependencias con `npm ci` (reproducible) y los navegadores de Playwright.
3. Ejecuta ambas suites; si algo falla, el job termina con exit code ≠ 0.
4. Publica el **reporte HTML** como artefacto descargable (`playwright-report`).
5. Usa **GitHub Secrets** para las credenciales sensibles.

### Secrets requeridos en el repositorio

En `Settings → Secrets and variables → Actions`, crear:

| Secret           | Valor sugerido    |
| ---------------- | ----------------- |
| `SAUCE_USERNAME` | `standard_user`   |
| `SAUCE_PASSWORD` | `secret_sauce`    |

> El reporte descargable queda disponible en cada ejecución dentro de la pestaña
> **Actions** del repositorio.
