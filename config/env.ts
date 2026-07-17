import dotenv from 'dotenv';

/**
 * Capa central de configuración.
 *
 * Único punto del proyecto donde se leen variables de entorno. Ningún test,
 * Page Object o helper accede a `process.env` directamente: todos consumen
 * el objeto `env` exportado aquí. Esto garantiza que no existan URLs ni
 * credenciales hardcodeadas y facilita el cambio de ambiente (staging/prod).
 *
 * Las secciones `e2e` y `api` se resuelven de forma perezosa (getters): así,
 * ejecutar solo la suite de integración no exige las variables de la E2E, y
 * viceversa.
 */

// Carga el archivo `.env` en local. En CI las variables llegan por el entorno
// (GitHub Secrets), por lo que si no existe `.env` simplemente se ignora.
dotenv.config();

type Environment = 'staging' | 'prod';

/**
 * Devuelve el valor de una variable de entorno obligatoria.
 * Falla de forma temprana y descriptiva si no está definida, evitando
 * errores opacos más adelante durante la ejecución de los tests.
 */
function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `[config] Falta la variable de entorno obligatoria "${name}". ` +
        `Cópiala desde .env.example a tu .env (o configúrala como GitHub Secret en CI).`,
    );
  }
  return value.trim();
}

/** Igual que `required` pero con valor por defecto para variables opcionales. */
function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function resolveTestEnv(): Environment {
  const value = optional('TEST_ENV', 'prod').toLowerCase();
  if (value !== 'staging' && value !== 'prod') {
    throw new Error(`[config] TEST_ENV inválido: "${value}". Valores permitidos: staging | prod.`);
  }
  return value;
}

export const env = {
  /** Ambiente activo (staging | prod). */
  get testEnv(): Environment {
    return resolveTestEnv();
  },

  /** Indica si la ejecución corre dentro de un pipeline de CI. */
  get isCI(): boolean {
    return process.env.CI === 'true' || process.env.CI === '1';
  },

  /** Configuración del sitio bajo prueba (E2E). */
  get e2e() {
    const testEnv = resolveTestEnv();
    return {
      baseUrl:
        testEnv === 'prod' ? required('E2E_BASE_URL_PROD') : required('E2E_BASE_URL_STAGING'),
      username: required('SAUCE_USERNAME'),
      password: required('SAUCE_PASSWORD'),
    };
  },

  /** Configuración de la API de integración (PokéAPI). */
  get api() {
    return {
      baseUrl: optional('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
      pokemonUnderTest: optional('POKEMON_UNDER_TEST', 'squirtle').toLowerCase(),
    };
  },
} as const;

export type AppEnv = typeof env;
