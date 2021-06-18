const app = require('../../../../../src/app').default;
const targetModule = require('../../../../../src/services/registration-points/hooks/validate-label');
const validateLabel = targetModule.default;
const MAX_DEPTH_FOR_CUSTOM_LABELS = targetModule.MAX_DEPTH_FOR_CUSTOM_LABELS;
const DEFAULT_LABEL = targetModule.DEFAULT_LABEL;

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;


describe('Registration Point Service - validate-label hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let mockHook;

  beforeEach(() => {
    mockHook = {
      app,
      method: 'create',
      params: {},
      data: {
        "id": 123,
        "parentId": 23,
        "label": "area",
        "name": "Registration point with parent",
        "cost": 200,
        "amount": "2000"
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should rectify label when parent is at max depth', async () => {
    sandbox.stub(sequelize, 'query').resolves([{ max: MAX_DEPTH_FOR_CUSTOM_LABELS }]);
    const outHook = await validateLabel()(mockHook);
    expect(outHook.data.label).to.equal(DEFAULT_LABEL);
  });

  it('should not touch the label if parent is not at max depth', async () => {
    sandbox.stub(sequelize, 'query').resolves([{ max: MAX_DEPTH_FOR_CUSTOM_LABELS - 1 }]);
    const outHook = await validateLabel()(mockHook);
    expect(outHook.data.label).to.equal('area');
  });

  it('should skip when given no parent', async () => {
    delete mockHook.data.parentId;
    const stub = sandbox.stub(sequelize, 'query').resolves([{ max: MAX_DEPTH_FOR_CUSTOM_LABELS }]);
    const outHook = await validateLabel()(mockHook);
    expect(stub.called).to.equal(false);
    expect(outHook.data.label).to.equal('area');
  });
});
