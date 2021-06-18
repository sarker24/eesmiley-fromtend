'use strict';

const extractPathIds = require('../../../src/util/tree').extractPathIds;
const expect = require('chai').expect;

describe('extractPathIds', () => {
  it('Should generate array of ancestor ids when given a single node', () => {
    const node = [{id: 10, parentId: 3, path: '1.2.3'}];
    const expected = [1, 2, 3];
    const result = extractPathIds(node);
    expect(result).to.have.deep.members(expected);
  });

  it('Should generate array of ancestor ids when given multiple nodes', () => {
    const nodes = [
      {id: 10, parentId: 3, path: '1.2.3'},
      {id: 20, parentId: 9, path: '8.9'},
      {id: 30}
    ];
    const expected = [1, 2, 3, 8, 9];
    const result = extractPathIds(nodes);
    expect(result).to.have.deep.members(expected);
  });
});
