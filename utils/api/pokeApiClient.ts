import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiError } from './errors';
import type {
  ChainLink,
  EvolutionChainResponse,
  NamedApiResource,
  PokemonResponse,
  PokemonSpeciesResponse,
} from './pokemon.types';

export class PokeApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async getPokemon(nameOrId: string | number, step: string): Promise<PokemonResponse> {
    const url = `${this.baseUrl}/pokemon/${nameOrId}`;
    return this.getJson<PokemonResponse>(url, step);
  }

  async getSpecies(nameOrId: string | number, step: string): Promise<PokemonSpeciesResponse> {
    const url = `${this.baseUrl}/pokemon-species/${nameOrId}`;
    return this.getJson<PokemonSpeciesResponse>(url, step);
  }

  async getEvolutionChain(url: string, step: string): Promise<EvolutionChainResponse> {
    return this.getJson<EvolutionChainResponse>(url, step);
  }

  private async getJson<T>(url: string, step: string): Promise<T> {
    let response: APIResponse;
    try {
      response = await this.request.get(url);
    } catch (cause) {
      throw new ApiError(url, 0, step, `Error de transporte: ${(cause as Error).message}`);
    }

    if (response.status() !== 200) {
      const body = await safeText(response);
      throw new ApiError(url, response.status(), step, body);
    }

    return (await response.json()) as T;
  }
}

async function safeText(response: APIResponse): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

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
