import { expect, test } from '@playwright/test';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { compareStringsAsc, mergeSort } from '../../utils/sorting';
import { flattenEvolutionChain, PokeApiClient } from '../../utils/api/pokeApiClient';
import type { PokemonEvolution } from '../../utils/api/pokemon.types';

test.describe('Integración PokéAPI — cadena de evoluciones', () => {
  test('extrae nombre y peso de la cadena y los ordena alfabéticamente', async ({ request }) => {
    const client = new PokeApiClient(request, env.api.baseUrl);
    const pokemon = env.api.pokemonUnderTest;

    const basePokemon = await test.step(`GET /pokemon/${pokemon}`, () =>
      client.getPokemon(pokemon, `Consultar el Pokémon base "${pokemon}"`));
    expect(basePokemon.name).toBe(pokemon);

    const species = await test.step(`GET /pokemon-species/${pokemon}`, () =>
      client.getSpecies(pokemon, `Consultar la especie de "${pokemon}"`));
    expect(species.evolution_chain.url).toBeTruthy();

    const evolutionChain = await test.step('GET evolution-chain', () =>
      client.getEvolutionChain(
        species.evolution_chain.url,
        `Consultar la cadena de evolución de "${pokemon}"`,
      ));
    const chainSpecies = flattenEvolutionChain(evolutionChain.chain);
    expect(chainSpecies.length).toBeGreaterThan(0);

    const evolutions: PokemonEvolution[] = [];
    for (const member of chainSpecies) {
      const detail = await test.step(`GET /pokemon/${member.name} (peso)`, () =>
        client.getPokemon(member.name, `Consultar el peso de "${member.name}"`));
      evolutions.push({ name: detail.name, weight: detail.weight });
    }

    const sorted = mergeSort(evolutions, (a, b) => compareStringsAsc(a.name, b.name));

    const output = sorted.map((p) => `${p.name} (peso: ${p.weight})`).join('\n');
    logger.info(`Resultado ordenado alfabéticamente:\n${output}`);
    await test.info().attach('evoluciones-ordenadas.txt', {
      body: output,
      contentType: 'text/plain',
    });

    expect(sorted).toHaveLength(chainSpecies.length);

    for (const evo of sorted) {
      expect(evo.weight, `El peso de "${evo.name}" debería ser mayor que 0`).toBeGreaterThan(0);
    }

    for (let i = 1; i < sorted.length; i += 1) {
      expect(
        compareStringsAsc(sorted[i - 1].name, sorted[i].name),
        `"${sorted[i - 1].name}" debería preceder alfabéticamente a "${sorted[i].name}"`,
      ).toBeLessThanOrEqual(0);
    }

    const expectedNames = mergeSort(
      chainSpecies.map((s) => s.name),
      compareStringsAsc,
    );
    expect(sorted.map((p) => p.name)).toEqual(expectedNames);
  });
});
