type KeyMapperFn<T> = (item: T) => string;
type ValueMapperFn<T, U = T> = (item: T) => U;
type ReducerMapperFn<U, V> = (prev: V, current: U) => V;

function identity<T>(item: T): T {
  return item;
}

function listReducer<T>(prev: T[], current: T): T[] {
  return prev ? [...prev, current] : [current];
}

function groupBy<T>(array: T[], key: string | KeyMapperFn<T>, valueMapper?: ValueMapperFn<T>, reducerMapper?: ReducerMapperFn<T, T[]>): { [index: string]: T[] };
function groupBy<T, U>(array: T[], key: string | KeyMapperFn<T>, valueMapper: ValueMapperFn<T, U>, reducerMapper?: ReducerMapperFn<U, U[]>): { [index: string]: U[] };
function groupBy<T, U, V>(array: T[], key: string | KeyMapperFn<T>, valueMapper: ValueMapperFn<T, U>, reducerMapper: ReducerMapperFn<U, V>): { [index: string]: V };

function groupBy(array: any[], key: string | KeyMapperFn<any>, valueMapper: ValueMapperFn<any, any> = identity, reducerMapper: ReducerMapperFn<any, any> = listReducer): { [index: string]: any } {
  return array.reduce((groups, item) => {
    const itemKey: string = typeof key === 'function' ? key(item) : item[key];
    return {
      ...groups,
      [itemKey]: reducerMapper(groups[itemKey], valueMapper(item))
    };
  }, {});
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

function findReverseIndex(array, findIndexCallback): number {
  const reversed = [...array].reverse();
  const reversedIndex = reversed.findIndex(findIndexCallback);
  return reversedIndex === -1 ? reversedIndex : array.length - reversedIndex - 1;
}

export { groupBy, min, max, sum, avg, findReverseIndex };
