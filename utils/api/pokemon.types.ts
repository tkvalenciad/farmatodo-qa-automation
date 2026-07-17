/**
 * Modelos (subconjunto) de las respuestas de la PokéAPI que consume el framework.
 * Solo se tipan los campos usados por los tests, manteniendo el contrato explícito.
 */

/** Recurso con nombre + URL, patrón recurrente en la PokéAPI. */
export interface NamedApiResource {
  name: string;
  url: string;
}

/** Respuesta de GET /pokemon/{id|name} */
export interface PokemonResponse {
  id: number;
  name: string;
  weight: number;
  species: NamedApiResource;
}

/** Respuesta de GET /pokemon-species/{id|name} */
export interface PokemonSpeciesResponse {
  name: string;
  evolution_chain: {
    url: string;
  };
}

/** Nodo de la cadena de evolución (estructura recursiva y ramificable). */
export interface ChainLink {
  species: NamedApiResource;
  evolves_to: ChainLink[];
}

/** Respuesta de GET /evolution-chain/{id} */
export interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

/** Resultado agregado usado por la prueba: nombre + peso de una especie. */
export interface PokemonEvolution {
  name: string;
  weight: number;
}
