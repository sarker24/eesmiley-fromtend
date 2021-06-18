'use strict';

const app = require('../../../../../src/app').default;
const calculateCostPerKg = require('../../../../../src/services/registration-points/hooks/calculate-cost-per-kg').default;
const chai = require('chai');
const expect = chai.expect;

describe('Registration Points Service - calculate-cost-per-kg', () => {

  it('Should calculate a pricePerKilo', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "name": "Product with amoun2 aaa",
        "cost": 200,
        "amount": "2000"
      }
    };

    return calculateCostPerKg()(mockHook)
      .then((result) => {
        expect(result.data.costPerkg).to.equal(100);
      });
  });

  it('Should calculate a pricePerKilo if there is no amount (Using default)', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "name": "Product with amoun2 aaa",
        "cost": 200
      }
    };

    return calculateCostPerKg()(mockHook)
      .then((result) => {
        expect(result.data.costPerkg).to.equal(200);
      });
  });

});
