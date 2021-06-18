const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const updateSettingsHook = require('../../../../../src/services/bootstrap-tasks/hooks/update-bootstrap-settings-hook').default;
const expect = chai.expect;
const assert = chai.assert;

describe('update-bootstrap-settings-hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const settingsService = app.service('settings');

  let settingsStub;
  let patchStub;
  let createStub;
  let inHook;

  beforeEach(() => {
    inHook = { app, data: { customerId: 1, userId: 1, templateId: 1 } };
    settingsStub = sandbox.stub(sequelize.models.settings, 'findOne');
    patchStub = sandbox.stub(settingsService, 'patch');
    createStub = sandbox.stub(settingsService, 'create');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create settings with bootstrap template id when none exist', async () => {
    settingsStub.resolves(null);
    try {
      await updateSettingsHook()(inHook);
      expect(createStub.calledOnce).to.equal(true);
      expect(patchStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

  it('should update settings with bootstrap template id when settings exist', async () => {
    settingsStub.resolves({ id: 1 });
    try {
      await updateSettingsHook()(inHook);
      expect(createStub.called).to.equal(false);
      expect(patchStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should not update settings with bootstrap template id when template id already exists', async () => {
    settingsStub.resolves({ id: 1, bootstrapTemplateId: 1 });
    try {
      await updateSettingsHook()(inHook);
      expect(createStub.called).to.equal(false);
      expect(patchStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

});
