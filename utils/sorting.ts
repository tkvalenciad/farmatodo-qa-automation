export type Comparator<T> = (a: T, b: T) => number;

export function compareStringsAsc(a: string, b: string): number {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function mergeSort<T>(items: readonly T[], comparator: Comparator<T>): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), comparator);
  const right = mergeSort(items.slice(middle), comparator);

  return merge(left, right, comparator);
}

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
