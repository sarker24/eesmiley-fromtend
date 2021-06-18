const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const handleDuplicatesHook = require('../../../../../src/services/guest-registrations/hooks/handle-date-duplicates').default;
const expect = chai.expect;
const assert = chai.assert;

describe('handle-date-duplicates', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let guestRegistration;
  let registrationSelectQueryStub;
  let registrationDeleteQueryStub;
  let guestType;

  beforeEach(() => {
    guestType = { id: 1 };
    guestRegistration = {
      date: '2019-12-12',
      amount: 100,
      customerId: 1,
      userId: 1,
      guestTypeId: guestType.id
    };
    registrationSelectQueryStub = sandbox.stub(sequelize.models.guest_registration, 'findAll').resolves([]);
    registrationDeleteQueryStub = sandbox.stub(sequelize.models.guest_registration, 'destroy').resolves(0);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass when no duplicates exist on given data and guest type', async () => {
    const inHook = {
      app,
      params: {},
      result: guestRegistration,
      method: 'create',
      type: 'after'
    };

    await handleDuplicatesHook()(inHook);
    expect(registrationSelectQueryStub.calledOnce).to.equal(true);
    expect(registrationDeleteQueryStub.called).to.equal(false);
  });

  it('should soft delete guest types when given guest type has duplicated on given date', async () => {
    registrationSelectQueryStub.resolves([1, 2]);
    const inHook = {
      app,
      params: {},
      result: guestRegistration,
      method: 'create',
      type: 'after'
    };

    await handleDuplicatesHook()(inHook);
    expect(registrationSelectQueryStub.calledOnce).to.equal(true);
    expect(registrationDeleteQueryStub.called).to.equal(true);
  });

  it('should throw correct error', async () => {
    registrationSelectQueryStub.rejects({error: 'error'});
    const inHook = {
      app,
      params: {},
      result: guestRegistration,
      method: 'create',
      type: 'after'
    };

    try {
      await handleDuplicatesHook()(inHook);
      assert('expected error to be thrown');
    } catch (err) {
      expect(err.data.errorCode).to.equal(500);
    }
  });

});
