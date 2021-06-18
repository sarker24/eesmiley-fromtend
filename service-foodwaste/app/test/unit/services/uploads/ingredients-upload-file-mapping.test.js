'use strict';

const app = require('../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const service = app.service('uploads');
const expect = chai.expect;
const ingredientsUploadsFileMappings = require('../../../../src/services/uploads/ingredients-upload-file-mappings').default;

describe('uploads service - ingredients-upload-file-mapping', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should create ingredients from a uploaded file', (done) => {
    const data = {
      mappings: {
        cost: 'cost',
        name: 'name'
      },
      userId: '71153',
      customerId: '24749'
    };

    const params = {
      query: {},
      route: { fileId: 'qwertyuiop' },
      provider: 'rest'
    }

    sandbox.stub(app.get('redisClient'), 'getAsync')
      .returns(Promise.resolve(`[
        {
          "name": "Ingrediente 1",
          "cost": "1",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 2",
          "cost": "2",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 3",
          "cost": "3",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 4",
          "cost": "1",
          "unit": "kg",
          "currency": "DKK"
        }]`
      ));

    sandbox.stub(app.get('redisClient'), 'delAsync')
      .returns(Promise.resolve({}));

    const spy = sandbox.stub(app.service('ingredients'), 'create')
      .returns(Promise.resolve({}));

    ingredientsUploadsFileMappings(app).create(data, params)
      .then((result) => {
        expect(spy.args.length).to.equal(4);
        expect(spy.args[0][0].cost).to.equal(100);
        expect(spy.args[1][0].cost).to.equal(200);
        expect(spy.args[2][0].cost).to.equal(300);
        expect(spy.args[3][0].cost).to.equal(100);

        done();
      });
  });

  it('Should return error if ingredient creation fails', (done) => {
    const data = {
      mappings: {
        cost: 'cost',
        name: 'name'
      },
      userId: '71153',
      customerId: '24749'
    };

    const params = {
      query: {},
      route: { fileId: 'qwertyuiop' },
      provider: 'rest'
    };

    sandbox.stub(app.get('redisClient'), 'getAsync')
      .returns(Promise.resolve(`[
        {
          "name": "Ingrediente 1",
          "cost": "1",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 2",
          "cost": "2",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 3",
          "cost": "3",
          "unit": "kg",
          "currency": "DKK"
        },
        {
          "name": "Ingrediente 4",
          "cost": "1",
          "unit": "kg",
          "currency": "DKK"
        }]`
      ));

    sandbox.stub(app.get('redisClient'), 'delAsync')
      .returns(Promise.resolve({}));

    sandbox.stub(app.service('ingredients'), 'create')
      .returns(Promise.reject({
        "errors": "Bad stuff"
      }));

    ingredientsUploadsFileMappings(app).create(data, params)
      .catch((err) => {
        expect(err.errors).to.equal("Bad stuff");

        done();
      });
  });
});
