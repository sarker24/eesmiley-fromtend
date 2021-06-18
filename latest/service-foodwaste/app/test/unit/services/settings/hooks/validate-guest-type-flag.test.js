const app = require('../../../../../src/app').default;
const validateGuestTypeHook = require('../../../../../src/services/settings/hooks/validate-guest-type-flag').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;


describe('validate-guest-type-flag', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let guestTypeQueryStub;
  let inHook;

  beforeEach(() => {
    inHook = {
      app,
      method: 'create',
      params: {},
      data: {
        customerId: 1,
        settings: { guestTypes: { enabled: true, migrationStrategy: { op: 'delete' } } }
      }
    };

    guestTypeQueryStub = sandbox.stub(sequelize.models.guest_type, 'findOne').resolves({ id: 1 });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should allow setting guest types when default guest type exists and using POST', async () => {
    try {
      await validateGuestTypeHook()(inHook);
      expect(guestTypeQueryStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should allow setting guest types when default guest type exists and using PATCH', async () => {
    try {
      inHook.method = 'patch';
      inHook.data = {
        current: {
          guestTypes: { enabled: true, migrationStrategy: { op: 'delete' } }
        }
      };
      await validateGuestTypeHook()(inHook);
      expect(guestTypeQueryStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should invalidate setting guest types when default guest type doesnt exist', async () => {
    guestTypeQueryStub.resolves(null);

    try {
      await validateGuestTypeHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(guestTypeQueryStub.calledOnce).to.equal(true);
      expect(error.data.errorCode).to.equal('E271');
    }
  });

  it('should pass if guest types are not set to enabled', async () => {
    inHook.data.settings.guestTypes.enabled = false;

    await validateGuestTypeHook()(inHook);
    expect(guestTypeQueryStub.called).to.equal(false);

  });
});
