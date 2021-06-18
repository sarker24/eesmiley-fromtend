const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../../../../src/app').default;
const sinon = require('sinon');
const Service = require('../../../../../src/services/reports/registrations').default;

describe('Registration service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;

  beforeEach(() => {
    registrationQueryStub = sandbox.stub(sequelize.models.registration, 'findAll');
    service = new Service();
    service.setup(app, '/dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return valid result', async () => {
    const fixedQueryResult = [{ id: 1, customerId: 1, date: '01-01-2020', registrationPoints: { id: 1, parentId: null, path: null, label: 'area', name: 'hello' } }];
    registrationQueryStub.resolves(fixedQueryResult);
    const params = {
      query: {
        date: {
          $gte: '2020-01-01',
          $lte: '2020-04-01',
        },
        customerId: 1
      }
    };

    try {
      const result = await service.find(params);
      expect(result).to.deep.equal(fixedQueryResult);
    } catch (error) {
      assert(error);
    }

  });

  it('should throw error if query fails', async () => {
    registrationQueryStub.rejects({ error: 'whoops'});
    const params = {
      query: {
        date: {
          $gte: '2020-01-01',
          $lte: '2020-04-01',
        },
        customerId: 1
      }
    };

    try {
      await service.find(params);
      assert('expected error to be thrown')
    } catch (error) {
      expect(error.code).to.equal(500);
    }

  });
});
