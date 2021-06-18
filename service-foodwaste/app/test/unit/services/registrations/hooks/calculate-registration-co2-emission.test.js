'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const calculateCO2hook = require('../../../../../src/services/registrations/hooks/calculate-registration-co2-emission').default;
const expect = chai.expect;

describe('Registrations Service - calculate-registration-co2-emission hook', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let pointStub;

  beforeEach(() => {
    pointStub = sandbox.stub(sequelize.models.registration_point, 'findOne').resolves(null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should calculate the co2 for a registration', async () => {

    pointStub.resolves({
      "id": "2",
      "name": "registration point",
      "co2Perkg": 2500
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

    const result = await calculateCO2hook()(mockHook);
    expect(result.data.co2).to.equal(1.3 * 2500);
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
      await calculateCO2hook()(mockHook);
      assert('expected error to be thrown');
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });
});
