const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const validatePatchHook = require('../../../../../src/services/guest-types/hooks/validate-patch').default;
const expect = chai.expect;
const assert = chai.assert;

describe('validate-patch', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let guestType;
  let inHook;
  let activeTypeQueryStub;

  beforeEach(() => {
    activeTypeQueryStub = sandbox.stub(sequelize.models.guest_type, 'findOne').resolves([{ id: 2 }]);
    guestType = {
      id: 1,
      active: true,
      name: 'new guest type',
      image: { link: 'https://image-this.com/image.png' }
    };
    inHook = {
      app,
      params: {},
      data: guestType,
      method: 'patch',
      type: 'before'
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should activate guest type', async () => {
    try {
      await validatePatchHook()(inHook);
      expect(activeTypeQueryStub.called).to.equal(false);
    } catch (error) {
      assert(error);
    }
  });

  it('should deactivate when another active guest type exists', async () => {
    inHook.data.active = false;
    try {
      await validatePatchHook()(inHook);
      expect(activeTypeQueryStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should throw error when trying to deactivate only guest type', async () => {
    inHook.data.active = false;
    activeTypeQueryStub.resolves(null);
    try {
      await validatePatchHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('E268');
    }
  });

  it('should catch database error', async () => {
    activeTypeQueryStub.rejects({ error: 'whoops' });
    try {
      await validatePatchHook()(inHook);
    } catch (error) {
      expect(error.data.errorCode).to.equal(500);
    }
  });

});
