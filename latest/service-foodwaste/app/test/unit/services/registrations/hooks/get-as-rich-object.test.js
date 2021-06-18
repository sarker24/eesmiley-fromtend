'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const getAsRichObject = require('../../../../../src/services/registrations/hooks/get-as-rich-object');
const expect = chai.expect;

describe('Registrations service - get-as-rich-object hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should build a rich object', () => {
    const registration = {
      "date": "2017-06-10",
      "createdAt": "2017-10-09 10:30:42",
      "updatedAt": "2017-10-09 10:30:42",
      "id": "9",
      "customerId": "1",
      "userId": "1",
      "amount": 1800,
      "unit": "kg",
      "currency": "DKK",
      "kgPerLiter": 15,
      "cost": "5000",
      "comment": "Hello test",
      "manual": true,
      "scale": "true",
      "deletedAt": null,
      "registrationPointId": "3",
    };

    sandbox.stub(app.service('registration-points'), 'get')
      .returns(Promise.resolve({
        id:1,
        name: 'point'
      }));

    return getAsRichObject.getRegistrationAsRichObject(registration, app)
      .then((result) => {
        expect(result.registrationPoint.id).to.equal(1);
        expect(result.registrationPoint.name).to.equal('point');
      });
  });

  it('Should return an error if it fails to build a rich object because of error in registration points', () => {
    const registration = {
      "date": "2017-06-10",
      "createdAt": "2017-10-09 10:30:42",
      "updatedAt": "2017-10-09 10:30:42",
      "id": "9",
      "customerId": "1",
      "userId": "1",
      "amount": 1800,
      "unit": "kg",
      "currency": "DKK",
      "kgPerLiter": 15,
      "cost": "5000",
      "comment": "Hello test",
      "manual": true,
      "scale": "true",
      "deletedAt": null,
      "registrationPointId": "3",
    };

    sandbox.stub(app.service('registration-points'), 'get')
      .returns(Promise.reject({
      }));

    return getAsRichObject.getRegistrationAsRichObject(registration, app)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E165');
      });
  });




  it('Should skip hook if method is not post or patch', () => {
    const mockHook = {
      result: [{
        "date": "2017-06-10",
        "createdAt": "2017-10-09 10:30:42",
        "updatedAt": "2017-10-09 10:30:42",
        "id": "9",
        "customerId": "1",
        "userId": "1",
        "amount": 1800,
        "unit": "kg",
        "currency": "DKK",
        "kgPerLiter": 15,
        "cost": "5000",
        "comment": "Hello test",
        "manual": true,
        "scale": "true",
        "deletedAt": null,
        "registrationPointId": "3"
      }],
      id: 1,
      method: 'get',
      app,
      params: {
        query: {
          richObject: true
        }
      }
    };

    return getAsRichObject.default()(mockHook).then(outHook => {
      expect(mockHook).to.deep.equal(outHook);
    })
  });
});
