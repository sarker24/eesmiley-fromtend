const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const validateHook = require('../../../../../src/services/guest-registrations/hooks/validate-guest-registration').default;
const expect = chai.expect;
const assert = chai.assert;

describe('validate-guest-registration', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let guestRegistration;
  let guestTypeQueryStub;
  let settingQueryStub;
  let guestType;

  beforeEach(() => {
    guestType = { id: 1 };
    guestRegistration = {
      date: '01-10-2019',
      amount: 100,
      customerId: 1,
      userId: 1,
      guestTypeId: guestType.id
    };
    guestTypeQueryStub = sandbox.stub(sequelize.models.guest_type, 'findOne').resolves(guestType);
    settingQueryStub = sandbox.stub(sequelize.models.settings, 'count').resolves(1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate registration with guest type id', async () => {

    const inHook = {
      app,
      params: {},
      data: guestRegistration,
      method: 'create',
      type: 'before'
    };

    try {
      await validateHook()(inHook);
      expect(guestTypeQueryStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

  it('should validate registration without guest type id', async () => {
    delete guestRegistration.guestTypeId;

    const inHook = {
      app,
      params: {},
      data: guestRegistration,
      method: 'create',
      type: 'before'
    };

    try {
      await validateHook()(inHook);
      expect(guestTypeQueryStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should invalidate registration with invalid guest type id', async () => {
    guestTypeQueryStub.resolves(null);

    const inHook = {
      app,
      params: {},
      data: guestRegistration,
      method: 'create',
      type: 'before'
    };

    try {
      await validateHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('E269');
    }
  });

  it('should throw correct error', async () => {
    guestTypeQueryStub.rejects({error: 'error'});

    const inHook = {
      app,
      params: {},
      data: guestRegistration,
      method: 'create',
      type: 'before'
    };

    try {
      await validateHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal(500);
    }
  });
});
