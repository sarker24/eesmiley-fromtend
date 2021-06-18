'use strict';

const expect = require('chai').expect;
const appendToHistory = require('../../../../../src/services/settings/hooks/append-to-history.js').default;
const app = require('../../../../../src/app').default;
const sinon = require('sinon');

describe('Settings Service - append-to-history', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  let testInput;

  beforeEach((done) => {
    testInput = {
      "customerId": 1,
      "userId": 1,
      "settings": {
        "date": "2017-01-04",
        "area": "Køkken",
        "category": "Grønsager",
        "product": "Tomat",
        "amount": 23,
        "unit": "kg",
        "currency": "DKK",
        "kgPerLiter": 2,
        "cost": 634,
        "note": "NANANANANANANANANANANANANANA BATMAAAAAAN æøå !@#$%^&*()_ " +
        "+?><|:\\/"
      }
    };

    done();
  });

  it('should store a new record of settings when no current settings exist for the customer', () => {
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    sandbox.stub(mockHook.service.Model, 'findOne').returns(Promise.resolve(null));

    return appendToHistory()(mockHook)
      .then((result) => {
        const data = result.data;
        expect(data.customerId).to.equal(testInput.customerId);
        expect(data.current).to.deep.equal(testInput.settings);
      });
  });


  it('should return error when the existing settings returns an error', () => {
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    sandbox.stub(mockHook.service.Model, 'findOne').returns(Promise.reject({ err: 'some error' }));

    return appendToHistory()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not create or update settings for customer');
        expect(err.errors).to.deep.equal({ err: 'some error' });
        expect(err.data.errorCode).to.equal('E050');
      });
  });

  it('should return error when appending new settings to the current ones returns an error', () => {
    const testFindResult = {
      current: {
        note: 'ASDF'
      },
      history: {
        '999999999999': {
          note: 'NANANANANANANANANANANANANANA BATMAAAAAAN'
        }
      },
      customerId: 1,
      save: () => {}
    };

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    sandbox.stub(mockHook.service.Model, 'findOne').resolves(testFindResult);
    sandbox.stub(testFindResult, 'save').rejects({ err: 'some error' });

    return appendToHistory()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not append new settings to the existing settings object');
        expect(err.errors).to.deep.equal({ err: 'some error' });
        expect(err.data.errorCode).to.equal('E177');
      });
  });


  it('should return an updated hook object when successfully appending the existing settings object', () => {
    const testFindResult = {
      current: {
        note: 'ASDF'
      },
      history: {
        '999999999999': {
          note: 'NANANANANANANANANANANANANANA BATMAAAAAAN'
        }
      },
      customerId: 1,
      save: () => {}
    };

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    sandbox.stub(mockHook.service.Model, 'findOne').returns(Promise.resolve(testFindResult));
    sandbox.stub(testFindResult, 'save').returns(Promise.resolve({ asd: 'some data back, whatever' }));

    return appendToHistory()(mockHook)
      .then(hook => {
        expect(hook.result.current).to.deep.equal(testInput.settings);

        const historyKeys = Object.keys(hook.result.history);
        expect(historyKeys.length).to.equal(2);
        expect(historyKeys[0]).to.equal('999999999999');
        expect(hook.result.history[historyKeys[0]]).to.deep.equal(testFindResult.history['999999999999']);
        expect(hook.result.history[historyKeys[1]]).to.deep.equal(testInput);
      });
  });

});
