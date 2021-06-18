const app = require('../../../src/app').default;
const sinon = require('sinon');
const chai = require('chai');
const parseSortOrder = require('../../../src/hooks/parse-sort-order-params').default;
const SortOrder = require('../../../src/util/constants').SortOrder;

const expect = chai.expect;

describe('parse-sort-order-params', () => {

  it('should default to Desc when order not given', async () => {
    const inHook = { method: 'find', params: { query: {} } };
    const outHook = parseSortOrder()(inHook);
    expect(outHook.params.query.order).to.equal(SortOrder.desc);
  });

  it('should parse asc order parameter correctly', async () => {
    const inHook = { method: 'find', params: { query: { order: 'asc' } } };
    const outHook = parseSortOrder()(inHook);
    expect(outHook.params.query.order).to.equal('Asc');
  });

  it('should parse desc order parameter correctly', async () => {
    const inHook = { method: 'find', params: { query: { order: 'desc' } } };
    const outHook = parseSortOrder()(inHook);
    expect(outHook.params.query.order).to.equal(SortOrder.desc);
  });

});
