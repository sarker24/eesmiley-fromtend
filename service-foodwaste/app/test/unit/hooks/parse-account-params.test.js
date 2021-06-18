const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Hooks - parse-account-params', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;
  let stubVerifyAccounts;
  let parseAccountParams;

  beforeEach(() => {
    mockHook = {
      method: 'find',
      params: {
        query: {
          customerId: 100,
          accounts: '1,2,3,4'
        }
      },
    };

    stubVerifyAccounts = sandbox.stub().callsFake(() => args => args);
    parseAccountParams = proxyquire('../../../src/hooks/parse-account-params', {
      'feathers-hooks-esmiley': {
        verifyUserAllowedToQueryAccounts: stubVerifyAccounts
      }
    }).default;

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass when given method is not FIND', async () => {

    mockHook.method = 'create';

    const hook = await parseAccountParams()(mockHook);
    expect(hook.params.query.customerId).to.equal(100);
    expect(stubVerifyAccounts.called).to.equal(false);
  });

  it('should pass when not given accounts parameter', async () => {

    delete mockHook.params.query.accounts;

    const hook = await parseAccountParams()(mockHook);
    expect(hook.params.query.customerId).to.equal(100);
    expect(stubVerifyAccounts.called).to.equal(false);
  });

  it('should update customerId to match accounts when validation is successful', async () => {

    const hook = await parseAccountParams()(mockHook);
    expect(stubVerifyAccounts.calledOnce).to.equal(true);
    expect(hook.params.query.customerId).to.deep.equal(['1', '2', '3', '4']);
  });

});
