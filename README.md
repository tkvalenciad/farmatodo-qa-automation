# Farmatodo — QA Automation Framework

Este proyecto implementa un framework de automatización con **Playwright + TypeScript** para cubrir dos escenarios principales:

- **Prueba de integración** sobre la PokéAPI para obtener y validar la cadena de evolución de un Pokémon.
- **Prueba End-to-End (E2E)** del flujo completo de compra en SauceDemo.

Además, incluye una **pipeline de CI/CD con GitHub Actions** para ejecutar las pruebas automáticamente en cada cambio al repositorio.

El proyecto sigue el patrón **Page Object Model (POM)** para mantener el código organizado y facilitar su mantenimiento. La configuración de ambientes, timeouts y reintentos está centralizada, y se utilizan selectores resilientes para reducir la flakiness de las pruebas.

---

# Requisitos previos


| Herramienta | Versión recomendada   |
| ----------- | --------------------- |
| Node.js     | >= 18 (probado en 20) |
| npm         | >= 9                  |


---

# Primeros pasos

1. Instalar las dependencias:

```
npm ci
```

```
npm install
```

1.  Instalar los navegadores de Playwright: 

```
npx playwright install
```

1.  Crear el archivo de variables de entorno: 

```
cp .env.example .env
```

En Windows PowerShell:

```
Copy-Item .env.example .env
```

1.  Ejecutar toda la suite: 

```
npm test
```

Los valores incluidos en `.env.example` ya apuntan a los ambientes públicos utilizados en la prueba, por lo que el proyecto puede ejecutarse sin realizar cambios adicionales.

---

# Scripts disponibles


| Comando                    | Descripción                                                |
| -------------------------- | ---------------------------------------------------------- |
| `npm test`                 | Ejecuta todas las pruebas.                                 |
| `npm run test:integration` | Ejecuta únicamente la prueba de integración de la PokéAPI. |
| `npm run test:e2e`         | Ejecuta únicamente la prueba E2E de SauceDemo.             |
| `npm run test:headed`      | Ejecuta la prueba E2E mostrando el navegador.              |
| `npm run test:ui`          | Abre el modo interactivo de Playwright.                    |
| `npm run report`           | Abre el último reporte HTML generado.                      |
| `npm run typecheck`        | Valida los tipos de TypeScript.                            |
| `npm run lint`             | Ejecuta ESLint sobre el proyecto.                          |


---

# Estructura del proyecto

```
.
├── .github/workflows/tests.yml   # Pipeline CI/CD (push + PR a main)
├── config/
│   └── env.ts                    # Carga y validación central de variables de entorno
├── pages/                        # Page Objects (una pantalla del flujo E2E por archivo)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInformationPage.ts
│   ├── CheckoutOverviewPage.ts
│   └── CheckoutCompletePage.ts
├── utils/                        # Helpers reutilizables
│   ├── sorting.ts                # Merge Sort propio (sin .sort() nativo)
│   └── api/                      # Cliente, modelos y errores de la PokéAPI
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

# Configuración por ambientes

Toda la configuración del proyecto se maneja mediante variables de entorno (ver `.env.example`).

El archivo `config/env.ts` es el único encargado de leer `process.env`; el resto del proyecto consume un objeto `env` tipado. De esta forma se evita dejar URLs o credenciales dentro del código y cambiar de ambiente solo requiere modificar la variable `TEST_ENV`.

---

# Decisiones de diseño

Durante el desarrollo del proyecto se tomaron las siguientes decisiones:

-  Se implementó **Page Object Model (POM)** para separar la lógica de las páginas de los casos de prueba y facilitar el mantenimiento. 
-  Se creó un **cliente específico para la PokéAPI**, centralizando las llamadas HTTP, el manejo de errores y las validaciones de las respuestas. 
-  Se implementó **Merge Sort** para cumplir el requisito de ordenar la información sin utilizar `Array.sort()`. 
-  Toda la configuración se centralizó mediante variables de entorno para facilitar el cambio entre ambientes. 
-  Los timeouts, reintentos y configuración general se manejan desde `playwright.config.ts`, evitando configuraciones repetidas en los tests. 

---

# Resiliencia y manejo de flakiness

Para reducir la inestabilidad de las pruebas se implementaron las siguientes prácticas:

- **Reintentos por ambiente:** `retries: 2` en CI y `retries: 0` en ejecución local. 
- **Timeouts centralizados:** definidos únicamente en `playwright.config.ts`. 
- **Manejo de errores de la API:** cuando un endpoint de la PokéAPI no responde con HTTP 200, el test falla mostrando la URL consultada, el código recibido y el paso donde ocurrió el error. 
- **Selectores resilientes:** las pruebas E2E utilizan `data-test`, roles ARIA y texto visible, evitando depender de clases CSS o posiciones del DOM. 

---

# Integración continua (CI/CD)

El workflow ubicado en `.github/workflows/tests.yml` realiza las siguientes tareas:

-  Se ejecuta automáticamente en cada **Push** y **Pull Request** hacia la rama `main`. 
-  Instala las dependencias con `npm ci`. 
-  Instala los navegadores de Playwright. 
-  Ejecuta toda la suite de pruebas. 
-  Si alguna prueba falla, el pipeline se marca como fallido. 
-  Publica el reporte HTML generado por Playwright como un artefacto descargable. 
-  Utiliza **GitHub Secrets** para manejar las credenciales sensibles. 

---

# Secrets requeridos

En **Settings → Secrets and variables → Actions** deben configurarse los siguientes secretos:


| Secret         | Valor         |
| -------------- | ------------- |
| SAUCE_USERNAME | standard_user |
| SAUCE_PASSWORD | secret_sauce  |


El reporte HTML generado queda disponible como artefacto en cada ejecución del workflow.

