const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const validateRemoveHook = require('../../../../../src/services/guest-types/hooks/validate-remove').default;
const expect = chai.expect;
const assert = chai.assert;

describe('validate-remove', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let inHook;
  let activeTypeQueryStub;

  beforeEach(() => {
    activeTypeQueryStub = sandbox.stub(sequelize.models.guest_type, 'findOne').resolves([{ id: 2 }]);
    inHook = {
      app,
      id: 1,
      params: {
        query: {
          customerId: 1
        }
      },
      method: 'remove',
      type: 'before'
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should remove guest type when other active guest types exist', async () => {
    try {
      await validateRemoveHook()(inHook);
      expect(activeTypeQueryStub.calledOnce).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

  it('should throw error when trying to remove only guest type', async () => {
    activeTypeQueryStub.resolves(null);
    try {
      await validateRemoveHook()(inHook);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.data.errorCode).to.equal('E268');
    }
  });

  it('should catch database error', async () => {
    activeTypeQueryStub.rejects({ error: 'whoops' });
    try {
      await validateRemoveHook()(inHook);
    } catch (error) {
      expect(error.data.errorCode).to.equal(500);
    }
  });

});
