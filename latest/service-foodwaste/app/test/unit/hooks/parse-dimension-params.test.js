const app = require('../../../src/app').default;
const sinon = require('sinon');
const chai = require('chai');
const parseDimensionParams = require('../../../src/hooks/parse-dimension-params').default;
const expect = chai.expect;

describe('parse-dimension-params', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let settingQueryStub;
  let inHook;

  beforeEach(() => {
    inHook = { app, params: { accessTokenPayload: { customerId: 1 }, query: { } } };
    settingQueryStub = sandbox.stub(sequelize.models.settings, 'findOne').returns(null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should default to weight dimension and read unit from settings', async () => {
    settingQueryStub.resolves({ unit: 'kg' });
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('weight');
    expect(outHook.params.query.unit).to.equal('kg');
  });

  it('should default to weight dimension and kg unit', async () => {
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('weight');
    expect(outHook.params.query.unit).to.equal('kg');
  });

  it('should read weight dimension from query', async () => {
    inHook.params.query.dimension = 'weight';
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('weight');
    expect(outHook.params.query.unit).to.equal('kg');
  });

  it('should read cost dimension from query and currency from settings', async () => {
    settingQueryStub.resolves({ currency: 'EUR' });
    inHook.params.query.dimension = 'cost';
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('cost');
    expect(outHook.params.query.unit).to.equal('EUR');
  });

  it('should read cost dimension from query and default currency to DKK', async () => {
    inHook.params.query.dimension = 'cost';
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('cost');
    expect(outHook.params.query.unit).to.equal('DKK');
  });

  it('should read co2 dimension from query and set unit to kg', async () => {
    inHook.params.query.dimension = 'co2';
    const outHook = await parseDimensionParams()(inHook);
    expect(outHook.params.query.dimension).to.equal('co2');
    expect(outHook.params.query.unit).to.equal('kg');
  });

});
