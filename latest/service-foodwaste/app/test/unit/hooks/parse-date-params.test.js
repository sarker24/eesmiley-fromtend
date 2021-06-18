'use strict';

const chai = require('chai');
const parseDateParamsHook = require('../../../src/hooks/parse-date-params').default;
const expect = chai.expect;

describe('parse-date-params', () => {

  it('should set default date range to one year from now', async () => {
    const inHook = {
      params: { query: {} }
    };

    const result = await parseDateParamsHook()(inHook);
    expect(result.params.query.date.$gte).to.equal(moment().subtract(1, 'year').format('YYYY-MM-DD'));
    expect(result.params.query.date.$lte).to.equal(moment().format('YYYY-MM-DD'));
  });

  it('should set from date to date - 1 year', async () => {
    const inHook = {
      params: { query: { to: '2018-01-01'} }
    };

    const result = await parseDateParamsHook()(inHook);
    expect(result.params.query.date.$gte).to.equal('2017-01-01');
    expect(result.params.query.date.$lte).to.equal('2018-01-01');
  });

  it('should set to date to from date + 1 year', async () => {
    const inHook = {
      params: { query: { from: '2018-01-01'} }
    };

    const result = await parseDateParamsHook()(inHook);
    expect(result.params.query.date.$gte).to.equal('2018-01-01');
    expect(result.params.query.date.$lte).to.equal('2019-01-01');
  });

  it('should throw error if from > to', async () => {
    const inHook = {
      params: { query: { from: '2018-01-01', to: '2017-01-01'} }
    };

    try {
      await parseDateParamsHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.code).to.equal(422);
    }

  });
});

