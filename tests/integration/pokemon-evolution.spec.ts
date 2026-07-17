import { expect, test } from '@playwright/test';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { compareStringsAsc, mergeSort } from '../../utils/sorting';
import { flattenEvolutionChain, PokeApiClient } from '../../utils/api/pokeApiClient';
import type { PokemonEvolution } from '../../utils/api/pokemon.types';

/**
 * Prueba de integración contra la PokéAPI.
 *
 * Objetivo: obtener la cadena de evoluciones del Pokémon configurado
 * (por defecto Squirtle), extraer nombre y peso de cada especie, y mostrarlos
 * ordenados alfabéticamente usando un algoritmo propio (sin `.sort()` nativo).
 *
 * Cada petición valida HTTP 200; si un endpoint falla, el `PokeApiClient`
 * lanza un `ApiError` con la URL exacta, el código recibido y el paso en curso.
 */
test.describe('Integración PokéAPI — cadena de evoluciones', () => {
  test('extrae nombre y peso de la cadena y los ordena alfabéticamente', async ({ request }) => {
    const client = new PokeApiClient(request, env.api.baseUrl);
    const pokemon = env.api.pokemonUnderTest;

    // 1. Verificar que el Pokémon base existe (y responde 200).
    const basePokemon = await test.step(`GET /pokemon/${pokemon}`, () =>
      client.getPokemon(pokemon, `Consultar el Pokémon base "${pokemon}"`));
    expect(basePokemon.name).toBe(pokemon);

    // 2. Obtener la especie para llegar a la URL de la cadena de evolución.
    const species = await test.step(`GET /pokemon-species/${pokemon}`, () =>
      client.getSpecies(pokemon, `Consultar la especie de "${pokemon}"`));
    expect(species.evolution_chain.url).toBeTruthy();

    // 3. Recuperar y aplanar la cadena de evolución completa.
    const evolutionChain = await test.step('GET evolution-chain', () =>
      client.getEvolutionChain(
        species.evolution_chain.url,
        `Consultar la cadena de evolución de "${pokemon}"`,
      ));
    const chainSpecies = flattenEvolutionChain(evolutionChain.chain);
    expect(chainSpecies.length).toBeGreaterThan(0);

    logger.info(
      `Cadena de evolución (orden natural): ${chainSpecies.map((s) => s.name).join(' -> ')}`,
    );

    // 4. Para cada especie de la cadena, obtener su peso (nueva petición 200).
    const evolutions: PokemonEvolution[] = [];
    for (const member of chainSpecies) {
      const detail = await test.step(`GET /pokemon/${member.name} (peso)`, () =>
        client.getPokemon(member.name, `Consultar el peso de "${member.name}"`));
      evolutions.push({ name: detail.name, weight: detail.weight });
    }

    // 5. Ordenar alfabéticamente con el algoritmo propio (Merge Sort).
    const sorted = mergeSort(evolutions, (a, b) => compareStringsAsc(a.name, b.name));

    // 6. Imprimir el resultado ordenado y adjuntarlo al reporte HTML.
    const output = sorted.map((p) => `${p.name} (peso: ${p.weight})`).join('\n');
    logger.info(`Resultado ordenado alfabéticamente:\n${output}`);
    await test.info().attach('evoluciones-ordenadas.txt', {
      body: output,
      contentType: 'text/plain',
    });

    // 7. Aserciones de comportamiento.
    // 7a. Se extrajeron los mismos nombres, sin perder ni duplicar especies.
    expect(sorted).toHaveLength(chainSpecies.length);

    // 7b. Cada especie tiene un peso válido (> 0).
    for (const evo of sorted) {
      expect(evo.weight, `El peso de "${evo.name}" debería ser mayor que 0`).toBeGreaterThan(0);
    }

    // 7c. El orden es alfabético ascendente (verificado sin métodos nativos).
    for (let i = 1; i < sorted.length; i += 1) {
      expect(
        compareStringsAsc(sorted[i - 1].name, sorted[i].name),
        `"${sorted[i - 1].name}" debería preceder alfabéticamente a "${sorted[i].name}"`,
      ).toBeLessThanOrEqual(0);
    }

    // 7d. El conjunto ordenado contiene exactamente los nombres de la cadena.
    const expectedNames = mergeSort(
      chainSpecies.map((s) => s.name),
      compareStringsAsc,
    );
    expect(sorted.map((p) => p.name)).toEqual(expectedNames);
  });
});
