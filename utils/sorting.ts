/**
 * Algoritmo de ordenamiento propio.
 *
 * El enunciado prohíbe usar métodos nativos como `Array.prototype.sort()`.
 * Implementamos Merge Sort: estable, complejidad garantizada O(n log n) y
 * agnóstico al tipo gracias a un comparador inyectado. Vive en `utils/` para
 * ser reutilizable por cualquier suite.
 */

/** Comparador estándar: negativo si a<b, cero si iguales, positivo si a>b. */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Compara dos cadenas alfabéticamente de forma insensible a mayúsculas.
 * Usa comparación lexicográfica nativa de strings (operadores `<`/`>`),
 * que no es un método de ordenamiento de arrays.
 */
export function compareStringsAsc(a: string, b: string): number {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/**
 * Ordena una colección aplicando Merge Sort con el comparador recibido.
 * Devuelve un array nuevo; no muta la entrada.
 */
export function mergeSort<T>(items: readonly T[], comparator: Comparator<T>): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), comparator);
  const right = mergeSort(items.slice(middle), comparator);

  return merge(left, right, comparator);
}

/** Combina dos arrays ya ordenados en uno solo, preservando el orden. */
function merge<T>(left: readonly T[], right: readonly T[], comparator: Comparator<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (comparator(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i += 1;
  }
  while (j < right.length) {
    result.push(right[j]);
    j += 1;
  }

  return result;
}
