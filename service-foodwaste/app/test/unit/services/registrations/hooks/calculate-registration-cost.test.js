'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const calculateRegistrationCost = require('../../../../../src/services/registrations/hooks/calculate-registration-cost').default;
const expect = chai.expect;

describe('Registrations Service - calculate-registration-cost hook', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let currencyStub;
  let pointStub;

  beforeEach(() => {
    currencyStub = sandbox.stub(sequelize.models.settings, 'findOne').resolves(null);
    pointStub = sandbox.stub(sequelize.models.registration_point, 'findOne').resolves(null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should calculate the cost for a registration', async () => {

    pointStub.resolves({
      "id": "2",
      "name": "registration point",
      "costPerkg": 2000
    });

    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app: app,
      data: {
        "amount": 1300,
        "date": "2017-07-20",
        "registrationPointId": 2,
        "unit": "kg"
      }
    };

    const result = await calculateRegistrationCost()(mockHook);
    expect(result.data.cost).to.equal(2600);
    expect(result.data.hasOwnProperty('currency')).to.equal(false);

  });

  it('Should calculate the cost for a registration with settings currency', async () => {

    currencyStub.resolves({ currency: 'EUR' });
    pointStub.resolves({
      "id": "2",
      "name": "registration point",
      "costPerkg": 2000
    });

    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app: app,
      data: {
        "amount": 1300,
        "date": "2017-07-20",
        "registrationPointId": 2,
        "unit": "kg"
      }
    };

    const result = await calculateRegistrationCost()(mockHook);
    expect(result.data.cost).to.equal(2600);
    expect(result.data.currency).to.equal('EUR');

  });

  it('Should return an error if registration point does not exist', async () => {

    pointStub.rejects({
      "name": "NotFound",
      "message": "No record found for id '800000'",
      "code": 404,
      "errorCode": "E404",
      "className": "not-found",
      "data": {}
    });

    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app: app,
      data: {
        "amount": 13,
        "date": "2017-07-20",
        "registrationPointId": 800000,
        "unit": "kg"
      }
    };

    try {
      await calculateRegistrationCost()(mockHook);
      assert('expected error to be thrown');
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });
});
