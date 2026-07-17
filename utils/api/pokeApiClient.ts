import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiError } from './errors';
import type {
  ChainLink,
  EvolutionChainResponse,
  NamedApiResource,
  PokemonResponse,
  PokemonSpeciesResponse,
} from './pokemon.types';

/**
 * Cliente de la PokéAPI.
 *
 * Encapsula el acceso HTTP y garantiza que cada petición valide el código 200.
 * Si un endpoint responde distinto, lanza un `ApiError` con contexto accionable.
 * Los tests no construyen URLs ni parsean respuestas: solo usan estos métodos.
 */
export class PokeApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  /** GET /pokemon/{nameOrId} */
  async getPokemon(nameOrId: string | number, step: string): Promise<PokemonResponse> {
    const url = `${this.baseUrl}/pokemon/${nameOrId}`;
    return this.getJson<PokemonResponse>(url, step);
  }

  /** GET /pokemon-species/{nameOrId} */
  async getSpecies(nameOrId: string | number, step: string): Promise<PokemonSpeciesResponse> {
    const url = `${this.baseUrl}/pokemon-species/${nameOrId}`;
    return this.getJson<PokemonSpeciesResponse>(url, step);
  }

  /** GET a una URL absoluta de cadena de evolución (la entrega la propia API). */
  async getEvolutionChain(url: string, step: string): Promise<EvolutionChainResponse> {
    return this.getJson<EvolutionChainResponse>(url, step);
  }

  /**
   * Petición GET genérica con validación estricta de estado 200.
   * Cualquier código distinto genera un `ApiError` con URL, código y paso.
   */
  private async getJson<T>(url: string, step: string): Promise<T> {
    let response: APIResponse;
    try {
      response = await this.request.get(url);
    } catch (cause) {
      // Error de red/transporte (DNS, timeout, conexión rechazada).
      throw new ApiError(url, 0, step, `Error de transporte: ${(cause as Error).message}`);
    }

    if (response.status() !== 200) {
      const body = await safeText(response);
      throw new ApiError(url, response.status(), step, body);
    }

    return (await response.json()) as T;
  }
}

/** Lee el cuerpo de la respuesta sin lanzar si no es texto legible. */
async function safeText(response: APIResponse): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

/**
 * Recorre la cadena de evolución (en profundidad) y devuelve las especies
 * en orden natural de evolución. Soporta ramificaciones (`evolves_to` múltiple).
 * Es una función pura: no realiza I/O.
 */
export function flattenEvolutionChain(root: ChainLink): NamedApiResource[] {
  const species: NamedApiResource[] = [];

  const visit = (node: ChainLink): void => {
    species.push(node.species);
    for (const next of node.evolves_to) {
      visit(next);
    }
  };

  visit(root);
  return species;
}
