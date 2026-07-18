import dotenv from 'dotenv';

dotenv.config();

type Environment = 'staging' | 'prod';

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
  get testEnv(): Environment {
    return resolveTestEnv();
  },

  get isCI(): boolean {
    return process.env.CI === 'true' || process.env.CI === '1';
  },

  get e2e() {
    const testEnv = resolveTestEnv();
    return {
      baseUrl:
        testEnv === 'prod' ? required('E2E_BASE_URL_PROD') : required('E2E_BASE_URL_STAGING'),
      username: required('SAUCE_USERNAME'),
      password: required('SAUCE_PASSWORD'),
    };
  },

  get api() {
    return {
      baseUrl: optional('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
      pokemonUnderTest: optional('POKEMON_UNDER_TEST', 'squirtle').toLowerCase(),
    };
  },
} as const;

export type AppEnv = typeof env;
