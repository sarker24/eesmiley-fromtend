const expect = require('chai').expect;
const sinon = require('sinon');
const app = require('../../../../../src/app').default;

const includeGuestRegistrations = require('../../../../../src/services/sales/hooks/include-guest-registrations').default;

const saleRecords = [
  {
    id: 1,
    date: '2019-01-01'
  },
  {
    id: 2,
    date: '2019-02-01'
  },
];

const registrationRecords = saleRecords.map(sale => ({ id: sale.id, date: sale.date, amount: sale.id * 10 }));

describe('Sales Service - include-guest-registrations', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let queryStub;
  let inHookStub;

  beforeEach(() => {
    inHookStub = {
      type: 'after',
      method: 'find',
      result: saleRecords,
      app: app,
      params: {
        query: {
          userId: 1,
          customerId: 1
        }
      }
    };

    queryStub = sandbox.stub(sequelize.models.guest_registration, 'findAll').resolves(registrationRecords);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should default to 0 guests amount when no guest registration exist', async () => {
    queryStub.resolves([]);
    const outHook = await includeGuestRegistrations()(inHookStub);
    expect(outHook.result.every(sale => sale.guests === 0)).to.equal(true);
  });

  it('should include correct guest registrations to sale records', async () => {
    const outHook = await includeGuestRegistrations()(inHookStub);
    expect(outHook.result.every(sale => sale.guests === sale.id * 10)).to.equal(true);
  });

  it('should include correct guest registrations to sale records when some dont have registrations', async () => {
    queryStub.resolves(registrationRecords.slice(1));
    const outHook = await includeGuestRegistrations()(inHookStub);
    expect(outHook.result.every(sale => sale.guests === 0 || sale.guests === sale.id * 10)).to.equal(true);
  });

  it('should return object when given GET method', async () => {
    inHookStub.method = 'get';
    inHookStub.result = saleRecords[1];
    queryStub.resolves(registrationRecords.slice(1));
    const outHook = await includeGuestRegistrations()(inHookStub);
    expect(outHook.result.guests === outHook.result.id * 10).to.equal(true);
  });
});
