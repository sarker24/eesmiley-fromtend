const chai = require('chai');
const sinon = require('sinon');
const parseAccountParams = require('../../../src/hooks/parse-account-params');

const parseReportAccountParams = require('../../../src/hooks/parse-report-account-params').default;
const expect = chai.expect;

describe('parse-account-limit-params', () => {
  const FixedRegisteredAccounts = [{ id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
  const FixedAccountsInLimit = [{ id: '2' }, { id: '3' }];
  let settingServiceStub;
  let accountsInLimitQueryStub;
  const sequelize = {
    QueryTypes: { SELECT: 'select' },
    query: () => {}
  };
  const settingService = {
    find: () => {
    }
  };
  let app = {};
  let inHook;

  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.stub(parseAccountParams, 'default').callsFake(() => hook => {
        const accounts = hook.params.query.accounts;
        hook.params.query.customerId = accounts.split(',').map(id => parseInt(id));
        delete hook.params.query.accounts;
        return Promise.resolve(hook);
      }
    );
    settingServiceStub = sandbox.stub(settingService, 'find').resolves({ accounts: FixedRegisteredAccounts });
    accountsInLimitQueryStub = sandbox.stub(sequelize, 'query').resolves(FixedAccountsInLimit);
    app = {
      service: () => settingService,
      get: () => sequelize
    };
    inHook = {
      app,
      params: {
        accessTokenPayload: { customerId: 1 },
        query: {
          registrationPointIds: [1, 2, 3],
          dimension: 'weight',
          date: {
            $gte: '2010-01-01',
            $lte: '2020-01-01'
          }
        }
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should parse accounts with top limit value', async () => {
    inHook.params.query.accounts = 'top10';
    const outHook = await parseReportAccountParams()(inHook);
    expect(outHook.params.query.customerId).to.deep.equal(FixedAccountsInLimit.map(account => +account.id));
  });

  it('should parse accounts with bottom limit value', async () => {
    inHook.params.query.accounts = 'bottom3';
    const outHook = await parseReportAccountParams()(inHook);
    expect(outHook.params.query.customerId).to.deep.equal(FixedAccountsInLimit.map(account => +account.id));
  });

  it('should parse accounts with id list value', async () => {
    inHook.params.query.accounts = '1,2,3,4';
    const outHook = await parseReportAccountParams()(inHook);
    expect(outHook.params.query.customerId).to.deep.equal([1, 2, 3, 4]);
  });

  it('should parse accounts with * value', async () => {
    inHook.params.query.accounts = '*';
    const outHook = await parseReportAccountParams()(inHook);
    const allIds = FixedRegisteredAccounts.map(account => +account.id);
    expect(outHook.params.query.customerId).to.deep.equal([...allIds, 1]);
  });

  it('should throw error when missing count', async () => {
    inHook.params.query.accounts = 'bottom';
    try {
      await parseReportAccountParams()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

  it('should throw error when number is 0', async () => {
    inHook.params.query.accounts = 'bottom0';
    try {
      await parseReportAccountParams()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

  it('should throw error when number is negative', async () => {
    inHook.params.query.accounts = 'bottom-1';
    try {
      await parseReportAccountParams()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('400');
    }
  });

});
