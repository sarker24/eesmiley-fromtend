'use strict';

const arrayUtils = require('../../../src/util/array');
const expect = require('chai').expect;

describe('array-util', () => {
  it('should find max', () => {
    const input = [51, 27, 4, 100, 8, 50];
    const max = arrayUtils.max(input);
    expect(max).to.equal(100);
  });

  it('should find min', () => {
    const input = [51, 27, 4, 100, 8, 50];
    const min = arrayUtils.min(input);
    expect(min).to.equal(4);
  });

  it('should calculate sum', () => {
    const input = [51, 27, 4, 100, 8, 50];
    const sum = arrayUtils.sum(input);
    const expected = input.reduce((sum, current) => sum + current, 0);
    expect(sum).to.equal(expected);
  });

  it('should calculate average', () => {
    const input = [51, 27, 4, 100, 8, 50];
    const avg = arrayUtils.avg(input);
    const expected = input.reduce((sum, current) => sum + current, 0) / input.length;
    expect(avg).to.equal(expected);
  });

  it('should group by given key', () => {
    const input = [{ key: 'first', a: 20 }, { key: 'first', a: 120 }, { key: 'second', a: 99 }, {
      key: 'second',
      a: 102
    }];
    const grouped = arrayUtils.groupBy(input, 'key');
    const expected = {
      first: [{ key: 'first', a: 20 }, { key: 'first', a: 120 }],
      second: [{ key: 'second', a: 99 }, { key: 'second', a: 102 }]
    };
    expect(grouped).to.deep.equal(expected);
  });

  it('should group by given function', () => {
    const input = [
      { key: 'first', a: 20 },
      { key: 'first', a: 120 },
      { key: 'second', a: 99 },
      { key: 'second', a: 102 }
      ];

    const grouped = arrayUtils.groupBy(input, item => item.key.charAt(0));
    const expected = {
      f: [{ key: 'first', a: 20 }, { key: 'first', a: 120 }],
      s: [{ key: 'second', a: 99 }, { key: 'second', a: 102 }]
    };
    expect(grouped).to.deep.equal(expected);
  });

  it('should group by with given value mapper', () => {
    const input = [
      { key: 'first', a: 20 },
      { key: 'first', a: 120 },
      { key: 'second', a: 99 },
      { key: 'second', a: 102 }
    ];

    const grouped = arrayUtils.groupBy(input, 'key', item => item.a);
    const expected = {
      first: [20, 120],
      second: [99, 102]
    };
    expect(grouped).to.deep.equal(expected);
  });

  it('should group by with given reducer mapper', () => {
    const input = [
      { key: 'first', a: 20 },
      { key: 'first', a: 120 },
      { key: 'second', a: 99 },
      { key: 'second', a: 102 }
    ];

    const grouped = arrayUtils.groupBy(input, 'key', item => item.a, (prev, current) => (prev || 0) + current);
    const expected = {
      first: 140,
      second: 201
    };
    expect(grouped).to.deep.equal(expected);
  });

  it('should find correct index reversed', () => {
    const input = [51, 27, 4, 100, 8, 50];
    const element = 27;
    const expected = input.findIndex(el => el === element);
    const index = arrayUtils.findReverseIndex(input, el => el === element);
    expect(index === expected);
  });


});
