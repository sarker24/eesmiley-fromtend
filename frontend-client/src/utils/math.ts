/**
 * Fixes the floating point bug: https://floating-point-gui.de/
 * Solution found under https://javascript.info/number#imprecise-calculations
 */
export function getCorrectFloatValue(value: number): number {
  return +value.toFixed(2);
}

/**
 * Transposes matrix
 * Example: [[a, b, c], [d, e, f]] => [[a, d], [b, e], [c, f]],
 *
 * For uneven matrices:
 * ( discardEmpty : false )
 * Example: [[a, b, c], [d]] => [[a, d], [b, undefined], [c, undefined]],
 *
 * ( discardEmpty : true )
 * Example: [[a, b, c], [d]] => [[a, d], [b], [c]],
 */
interface TransposeOptions {
  discardEmpty: boolean;
}

export function transpose<T>(
  array: T[][],
  options: TransposeOptions = { discardEmpty: false }
): T[][] {
  const maxLength = Math.max(...array.map((arr) => arr.length));
  const result: T[][] = [];
  for (let i = 0; i < maxLength; i++) {
    const row: T[] = [];

    for (let j = 0; j < array.length; j++) {
      const col = array[j];

      if (options.discardEmpty) {
        const nonEmptyCols = col.filter((entry) => !!entry);
        if (i >= nonEmptyCols.length) {
          continue;
        } else {
          row.push(col[i]);
        }
      } else {
        row.push(col[i]);
      }
    }
    result.push(row);
  }

  return result;
}

export function stringToInteger(
  maybeNumber: string,
  fallbackValue: number | null = null
): number | null {
  return isNaN(maybeNumber as any) || isNaN(parseInt(maybeNumber, 10))
    ? fallbackValue
    : parseInt(maybeNumber, 10);
}

export function isNumeric(value?: string | number): boolean {
  return !isNaN(value as number) && value !== null;
}

export interface isInRangeProps {
  value: number;
  min?: number;
  max?: number;
}

export function isInRange(props: isInRangeProps): boolean {
  const { value, min, max } = props;

  if (!isNumeric(max) && !isNumeric(min)) {
    return true;
  }

  if (isNumeric(max) && isNumeric(min)) {
    return value >= min && max >= value;
  }

  return isNumeric(max) ? max >= value : value >= min;
}
