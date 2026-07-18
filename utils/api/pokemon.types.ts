export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonResponse {
  id: number;
  name: string;
  weight: number;
  species: NamedApiResource;
}

export interface PokemonSpeciesResponse {
  name: string;
  evolution_chain: {
    url: string;
  };
}

export interface ChainLink {
  species: NamedApiResource;
  evolves_to: ChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

export interface PokemonEvolution {
  name: string;
  weight: number;
}
