'use strict';

const app = require('../../../../../src/app').default;
const upsert = require('../../../../../src/services/ingredients/hooks/upsert').default;
const chai = require('chai');
const sinon = require('sinon');
const service = app.service('ingredients');
const expect = chai.expect;

describe('ingredient service - upsert hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should update an existing ingredient', () => {
    sandbox.stub(service, 'find')
      .returns(Promise.resolve([{
        id: '1',
        customerId: '1',
        name: 'ingrediente 3',
        cost: 127
      }]));

    const spy = sandbox.stub(service, 'patch')
      .returns(Promise.resolve({}));

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      id: 1,
      data: {
        customerId: '1',
        name: 'ingrediente 3',
        cost: 100
      }
    };
    sandbox.stub(service, 'get')
      .returns(Promise.resolve({
        "id": "1",
        "name": "test ingredient",
        "customerId": 1
      }));

    return upsert({ updateByKeys: ['customerId', 'name'] })(mockHook)
      .then((result) => {
        expect(spy.args[0][1][0].op).to.equal('replace');
        expect(spy.args[0][1][0].path).to.equal('/cost');
        expect(spy.args[0][1][0].value).to.equal(100);
      });
  });

  it('Should create if not exists', () => {
    sandbox.stub(service, 'find')
      .returns(Promise.resolve([]));

    const spy = sandbox.stub(service, 'update')
      .returns(Promise.resolve({}));

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      id: 1,
      data: {
        customerId: '1',
        name: 'ingrediente 3',
        cost: 100
      }
    };
    sandbox.stub(service, 'get')
      .returns(Promise.resolve({
        "id": "1",
        "name": "test ingredient",
        "customerId": 1
      }));

    return upsert({ updateByKeys: ['customerId', 'name'] })(mockHook)
      .then((result) => {
        expect(spy.args.length).to.equal(0);
      });
  });

  it('Should reject if no keys are provided', () => {
    sandbox.stub(service, 'find')
      .returns(Promise.resolve([]));

    const spy = sandbox.stub(service, 'update')
      .returns(Promise.resolve({}));

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      id: 1,
      data: {
        customerId: '1',
        name: 'ingrediente 3',
        cost: 100
      }
    };
    sandbox.stub(service, 'get')
      .returns(Promise.resolve({
        "id": "1",
        "name": "test ingredient",
        "customerId": 1
      }));

    return upsert()(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(500);
      });
  });

});
