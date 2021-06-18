// todo fix generics
function groupBy<T>(array: T[], key: keyof T): { [pkey: string]: T[] } {
  return array.reduce(
    (groups, element) => ({
      ...groups,
      // eslint-disable-next-line
      [element[key as string]]: [...(groups[element[key as string]] || []), element]
    }),
    {} as { [pkey: string]: T[] }
  );
}

function min(array: number[]): number {
  return Math.min(...array);
}

function max(array: number[]): number {
  return Math.max(...array);
}

function sum(array: number[]): number {
  return array.reduce((total, current) => total + current, 0);
}

function avg(array: number[]): number {
  return sum(array) / array.length;
}

export { groupBy, min, max, sum, avg };
