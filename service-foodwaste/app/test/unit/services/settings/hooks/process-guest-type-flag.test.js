const app = require('../../../../../src/app').default;
const processGuestTypeHook = require('../../../../../src/services/settings/hooks/process-guest-type-flag').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;


describe('process-guest-type-flag', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let deleteQueryStub;
  let findTypeQueryStub;
  let updateQueryStub;
  let transactionStub;
  let inHook;

  beforeEach(() => {
    inHook = {
      app,
      guestsMigrated: false,
      method: 'create',
      params: {},
      data: {
        customerId: 1,
        userId: 1,
        settings: { guestTypes: { enabled: true, migrationStrategy: { op: 'delete' } }},
        history: {}
      }
    };

    deleteQueryStub = sandbox.stub(sequelize.models.guest_registration, 'destroy').resolves(0);
    findTypeQueryStub = sandbox.stub(sequelize.models.guest_type, 'findOne').resolves(null);
    updateQueryStub = sandbox.stub(sequelize.models.guest_registration, 'update').resolves(0);
    transactionStub = sandbox.stub(sequelize, 'transaction').resolves();

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should handle delete migration strategy', async () => {
    await processGuestTypeHook()(inHook);
    expect(deleteQueryStub.calledOnce).to.equal(true);
  });

  it('should handle useDefault migration strategy', async () => {
    inHook.data.settings.guestTypes.migrationStrategy = {
      op: 'useDefault',
      value: 1
    };

    findTypeQueryStub.resolves({ id: 1, name: 'guest type'});

    await processGuestTypeHook()(inHook);
    expect(deleteQueryStub.called).to.equal(false);
    expect(findTypeQueryStub.calledOnce).to.equal(true);
    expect(updateQueryStub.calledOnce).to.equal(true);
    expect(transactionStub.called).to.equal(false);
  });

  it('should handle nullify migration strategy', async () => {
    inHook.data.settings.guestTypes.migrationStrategy = {
      op: 'nullify'
    };

    await processGuestTypeHook()(inHook);
    expect(deleteQueryStub.called).to.equal(false);
    expect(findTypeQueryStub.called).to.equal(false);
    expect(updateQueryStub.called).to.equal(false);
    expect(transactionStub.calledOnce).to.equal(true);
  });

  it('should skip when guest type settings not given', async () => {
    delete inHook.data.settings.guestTypes;
    await processGuestTypeHook()(inHook);

    expect(deleteQueryStub.called).to.equal(false);
    expect(findTypeQueryStub.called).to.equal(false);
    expect(updateQueryStub.called).to.equal(false);
    expect(transactionStub.called).to.equal(false);
  });

  it('should skip when guest type settings havent changed', async () => {
    inHook.data.history[1] = { settings: inHook.data.settings };
    inHook.data.history[2] = { settings: inHook.data.settings };
    await processGuestTypeHook()(inHook);

    expect(deleteQueryStub.called).to.equal(false);
    expect(findTypeQueryStub.called).to.equal(false);
    expect(updateQueryStub.called).to.equal(false);
    expect(transactionStub.called).to.equal(false);
  });


});
