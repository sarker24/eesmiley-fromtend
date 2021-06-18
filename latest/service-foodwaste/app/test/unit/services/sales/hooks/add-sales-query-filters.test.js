const expect = require('chai').expect;
const sinon = require('sinon');
const app = require('../../../../../src/app').default;

const addSalesQueryFiltersTest = require('../../../../../src/services/sales/hooks/add-sales-query-filters').default;

describe('Sales Service - add-sales-query-filters', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          userId: 1,
          customerId: 1,
          date: '2017-05-04',
          income: 10000,
          portions: 45,
          portionPrice: 222,
          guests: 45,
          productionCost: 123,
          productionWeight: 54
        }
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should not change any existing query parameters', async () => {
    const outHook = addSalesQueryFiltersTest()(mockHook);
    expect(outHook).to.deep.equal(mockHook);
  });

  it('should pass hook when given method is not find', async () => {
    mockHook.methid = 'get';
    mockHook.params.query.start = '01-01-2010';
    const outHook = addSalesQueryFiltersTest()(mockHook);
    expect(outHook).to.deep.equal(mockHook);
  });

  it('should replace start query param correctly', async () => {
    mockHook.params.query.start = '01-01-2010';
    const outHook = addSalesQueryFiltersTest()(mockHook);
    expect(outHook.params.query.hasOwnProperty('start')).to.equal(false);
    expect(outHook.params.query.date).to.deep.equal({ $gte: '01-01-2010' });
  });

  it('should replace start and end query params correctly', async () => {
    mockHook.params.query.start = '01-01-2010';
    mockHook.params.query.end = '01-01-2019';

    const outHook = addSalesQueryFiltersTest()(mockHook);
    expect(outHook.params.query.hasOwnProperty('start')).to.equal(false);
    expect(outHook.params.query.hasOwnProperty('end')).to.equal(false);
    expect(outHook.params.query.date).to.deep.equal({ $gte: '01-01-2010', $lte: '01-01-2019' });
  });
});
