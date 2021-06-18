'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const validateForeignKeysAreActive = require('../../../../../src/services/registrations/hooks/validate-foreign-keys-are-active').default;
const expect = chai.expect;
const assert = chai.assert;

describe('Registrations Service - validate-foreign-keys-are-active hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should reject the registration when registration-point is not active', async () => {

    sandbox.stub(app.service('registration-points'), 'find').resolves([]);

    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app: app,
      data: {
        "date": "2017-02-07",
        "currency": "DKK",
        "amount": 350,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 1
      }
    };

    try {
      await validateForeignKeysAreActive()(mockHook);
      assert.fail('expected error to be thrown');
    } catch(err) {
        expect(err.data.errorCode).to.equal('E133');
      }
  });

  it('Should pass validation when registration point is active', async () => {

    sandbox.stub(app.service('registration-points'), 'find').resolves([{id: 1}]);

    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app: app,
      data: {
        "date": "2017-02-07",
        "currency": "DKK",
        "amount": 350,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 1
      }
    };

    try {
      await validateForeignKeysAreActive()(mockHook);
    } catch(err) {
      assert.fail('should not throw error', err);
    }
  });
});
