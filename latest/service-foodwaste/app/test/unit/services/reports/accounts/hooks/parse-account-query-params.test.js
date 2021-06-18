const sinon = require('sinon');
const chai = require('chai');
const parseAccounts = require('../../../../../../src/hooks/parse-report-account-params');
const parseRegistrationPoints = require('../../../../../../src/hooks/parse-registration-points-params');
const parseAccountsQuery = require('../../../../../../src/services/reports/accounts/hooks/parse-accounts-query-params').default;
const expect = chai.expect;

describe('parse-accounts-query-params', () => {
  const sandbox = sinon.createSandbox();

  const FixedCustomerIds = [1,2];
  const FixedRegistrationPointIds = [1,2];

  let inHook;
  let parseAccountsStub;
  let parseRegistrationPointsStub;

  beforeEach(() => {
    parseAccountsStub = sandbox.stub(parseAccounts, 'default').callsFake(() => hook => {
      hook.params.query.customerId = FixedCustomerIds;
      delete hook.params.query.accounts;
      return hook;
    });

    parseRegistrationPointsStub = sandbox.stub(parseRegistrationPoints, 'default').callsFake(() => hook => {
      hook.params.query.registrationPointIds = FixedRegistrationPointIds;
      delete hook.params.query.area;
      delete hook.params.query.category;
      delete hook.params.query.product;
      return hook;
    });

    inHook = {
      method: 'find',
      type: 'before',
      params: {
        query: {}
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should parse raw accounts query', async () => {
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
      accountsQuery
    };

    await parseAccountsQuery()(inHook);
    expect(parseAccountsStub.callCount).to.equal(2);
    expect(parseRegistrationPointsStub.callCount).to.equal(2);
  });

  it('should throw error when invalid shape', async () => {
    parseAccountsStub.rejects('oh noes');

    const accountsQuery = [{
      accounts: 'wot',
      areas: '1,2',
      categories: '1,2',
      products: '1,2'
    }];

    inHook.params.query = {
      accountsQuery: Buffer.from(accountsQuery).toString('base64')
    };

    try {
      await parseAccountsQuery()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

});
