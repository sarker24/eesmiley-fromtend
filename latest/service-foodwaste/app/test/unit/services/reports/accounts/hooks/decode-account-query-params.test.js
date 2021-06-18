const sinon = require('sinon');
const chai = require('chai');
const parseaccountsQuery = require('../../../../../../src/services/reports/accounts/hooks/decode-account-query-params').default;
const expect = chai.expect;

describe('decode-account-query-params', () => {
  let inHook;

  beforeEach(() => {
    inHook = {
      params: {
        query: {}
      }
    };
  });

  it('should decode base64 encoded string', async () => {
    const accountsQuery = [
      {
        accounts: '1,2',
        areas: '1,2',
        categories: '1,2',
        products: '1,2'
      },
      {
        accounts: 'top3',
        areas: '5,6',
        categories: '5,6',
        products: '5,6'
      }
    ];

    inHook.params.query = {
      accountsQuery: Buffer.from(JSON.stringify(accountsQuery)).toString('base64')
    };

    const outHook = await parseaccountsQuery()(inHook);
    expect(outHook.params.query.accountsQuery).to.deep.equal(accountsQuery);
  });

  it('should throw error when query not properly base64 encoded', async () => {
    const accountsQuery = [{
      accounts: '1,2',
      areas: '1,2',
      categories: '1,2',
      products: '1,2'
    }];

    inHook.params.query = {
      accountsQuery: Buffer.from(accountsQuery).toString('base64')
    };

    try {
      await parseaccountsQuery()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

  it('should throw error when account query not present in the query', async () => {
    try {
      await parseaccountsQuery()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

});
