import { getCorrectFloatValue, transpose, stringToInteger } from './math';

describe('Math tests', () => {
  describe('getCorrectFloatValue', () => {
    test('getCorrectFloatValue fixes the floating point bug', () => {
      const sum = 0.1 + 0.2;
      const correctSum = getCorrectFloatValue(0.1 + 0.2);

      expect(sum).toBe(0.30000000000000004);
      expect(correctSum).toBe(0.3);
    });
  });

  describe('transpose', () => {
    test('transpose returns correct matrix', () => {
      const matrix = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ];
      const transposedMatrix = transpose(matrix);

      expect(transposedMatrix).toEqual([
        ['a', 'd'],
        ['b', 'e'],
        ['c', 'f']
      ]);
    });

    test('transpose returns correct uneven matrix', () => {
      const matrix = [
        ['a', 'b', 'c'],
        ['d', 'e']
      ];
      const transposedMatrix = transpose(matrix);
      expect(transposedMatrix).toEqual([
        ['a', 'd'],
        ['b', 'e'],
        ['c', undefined]
      ]);
    });

    test('transpose returns correct uneven matrix with discardEmpty true', () => {
      const matrix = [
        ['a', 'b', 'c'],
        ['d', 'e']
      ];
      const transposedMatrix = transpose(matrix, { discardEmpty: true });
      expect(transposedMatrix).toEqual([['a', 'd'], ['b', 'e'], ['c']]);
    });
  });

  describe('stringToInteger', () => {
    test('parse string to integer when given string is integer', () => {
      const intString = '102';
      const asInt: number = stringToInteger(intString);

      expect(asInt).toBe(102);
    });

    test('return default null when given string is not integer', () => {
      const intString = 'xyz';
      const asInt: number = stringToInteger(intString);

      expect(asInt).toBe(null);
    });

    test('return custom default when given string is not integer', () => {
      const intString = '34xyz';
      const asInt: number = stringToInteger(intString, 0);

      expect(asInt).toBe(0);
    });
  });
});
