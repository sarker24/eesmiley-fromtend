const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const hasGuestTypesEnabledHook = require('../../../../../src/services/guest-types/hooks/has-guest-types-enabled').default;
const expect = chai.expect;
const assert = chai.assert;

describe('has-guest-types-enabled', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let inHook;
  let enabledGuestTypesQueryStub;

  beforeEach(() => {
    enabledGuestTypesQueryStub = sandbox.stub(sequelize.models.settings, 'count').resolves(1);
    inHook = {
      app,
      id: 1,
      params: {
        query: {
          customerId: 1
        }
      },
      type: 'before',
      method: 'remove'
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return true when guest types are enabled', async () => {
    try {
      const isEnabled = await hasGuestTypesEnabledHook()(inHook);
      expect(enabledGuestTypesQueryStub.calledOnce).to.equal(true);
      expect(isEnabled).to.equal(true);

    } catch (error) {
      assert(error);
    }
  });

  it('should return false when guest types are disabled', async () => {
    enabledGuestTypesQueryStub.resolves(0);
    try {
      const isEnabled = await hasGuestTypesEnabledHook()(inHook);
      expect(enabledGuestTypesQueryStub.calledOnce).to.equal(true);
      expect(isEnabled).to.equal(false);
    } catch (error) {
      expect(error);
    }
  });

  it('should catch database error', async () => {
    enabledGuestTypesQueryStub.rejects({ error: 'whoops' });
    try {
      await hasGuestTypesEnabledHook()(inHook);
    } catch (error) {
      expect(error.data.errorCode).to.equal(500);
    }
  });

});
