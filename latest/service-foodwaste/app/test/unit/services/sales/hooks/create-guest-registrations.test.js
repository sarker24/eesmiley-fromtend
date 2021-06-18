const expect = require('chai').expect;
const sinon = require('sinon');
const app = require('../../../../../src/app').default;

const createGuestRegistration = require('../../../../../src/services/sales/hooks/create-guest-registration').default;

const saleRecord =
  {
    userId: 1,
    customerId: 1,
    date: '2020-01-01',
    income: 9999,
    portions: 45,
    portionPrice: 222,
    guests: 100,
    productionCost: 123,
    productionWeight: 54
  };

describe('Sales Service - create-guest-registrations', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let registrationStub;
  let registrationQueryStub;
  let settingQueryStub;
  let registrationCreateStub;
  let inHookStub;

  beforeEach(() => {
    registrationStub = { id: 1, amount: 10, date: '2020-01-01', destroy: sandbox.stub() };
    inHookStub = {
      type: 'before',
      method: 'create',
      data: { ...saleRecord },
      app: app
    };

    settingQueryStub = sandbox.stub(sequelize.models.settings, 'findOne').resolves({ current: { enableGuestRegistrationFlow: false } });
    registrationQueryStub = sandbox.stub(sequelize.models.guest_registration, 'findOne').resolves(registrationStub);
    registrationCreateStub = sandbox.stub(sequelize.models.guest_registration, 'create').resolves({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create guest registration when guest registration flow is disabled and no old registration exist', async () => {
    registrationQueryStub.resolves(null);
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(registrationCreateStub.calledOnce).to.equal(true);
    expect(registrationStub.destroy.called).to.equal(false);
  });

  it('should create guest registration and delete old registration when guest registration flow is disabled', async () => {
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(registrationCreateStub.calledOnce).to.equal(true);
    expect(registrationStub.destroy.calledOnce).to.equal(true);
  });

  it('should not create new record when old record has same amount', async () => {
    inHookStub.data.guests = registrationStub.amount;
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(registrationCreateStub.called).to.equal(false);
    expect(registrationStub.destroy.called).to.equal(false);
  });

  it('should delete old registration without creating new record when resetting guests with 0', async () => {
    inHookStub.data.guests = 0;
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(registrationCreateStub.called).to.equal(false);
    expect(registrationStub.destroy.called).to.equal(true);
  });

  it('should delete old registration without creating new record when guests not given', async () => {
    delete inHookStub.data.guests;
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(registrationCreateStub.called).to.equal(false);
    expect(registrationStub.destroy.called).to.equal(true);
  });

  it('should skip when guest registration flow is enabled', async () => {
    settingQueryStub.resolves({ current: { enableGuestRegistrationFlow: true } });
    await createGuestRegistration()(inHookStub);
    expect(settingQueryStub.calledOnce).to.equal(true);
    expect(registrationQueryStub.called).to.equal(false);
    expect(registrationCreateStub.called).to.equal(false);
    expect(registrationStub.destroy.called).to.equal(false);
  });

});
