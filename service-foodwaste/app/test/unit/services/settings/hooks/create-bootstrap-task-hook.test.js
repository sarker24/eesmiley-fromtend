const app = require('../../../../../src/app').default;
const createBootstrapTaskHook = require('../../../../../src/services/settings/hooks/create-bootstrap-task-hook').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;


describe('create-bootstrap-task hook', () => {
  const sandbox = sinon.createSandbox();
  let bootstrapServiceStub;
  let inHook;

  beforeEach(() => {
    bootstrapServiceStub = sandbox.stub(app.service('/bootstrap-tasks'), 'create');
    inHook = {
      app,
      method: 'create',
      params: {},
      data: {},
      result: {}
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not call bootstrap-tasks if not new customer', async () => {
    try {
      inHook.params = { isNewCustomer: false };
      inHook.result = { bootstrapTemplateId: 1 };
      await createBootstrapTaskHook()(inHook);
      expect(bootstrapServiceStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

  it('should not call bootstrap-tasks if no template id given', async () => {
    try {
      inHook.params = { isNewCustomer: true };
      inHook.result = {};
      await createBootstrapTaskHook()(inHook);
      expect(bootstrapServiceStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

  it('should call call bootstrap-tasks when new customer and template id  exists', async () => {
    try {
      inHook.params = { isNewCustomer: true };
      inHook.result = { bootstrapTemplateId: 1 };
      await createBootstrapTaskHook()(inHook);
      expect(bootstrapServiceStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

});
