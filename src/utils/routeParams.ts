/**
 * Expo Router pode devolver `string | string[]` em search/path params.
 */
export function firstParam(
  value: string | string[] | undefined | null,
): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' && first.length > 0 ? first : undefined;
  }
  return value.length > 0 ? value : undefined;
}

/** Alias usado por telas de curso; mesma semântica de `firstParam`. */
export const normalizeRouteParam = firstParam;
