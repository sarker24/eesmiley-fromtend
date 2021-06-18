'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const sinon = require('sinon');
const app = require('../../../../src/app').default;

const longLiveAccessToken = app.get('testLongLivedAccessToken');

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Settings service', () => {
  const settingsService = app.service('settings');
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should check that the Settings service has been registered', () => {
    expect(settingsService).to.be.an('Object');
  });

  it('Should not let do a request if no accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {},
      query: {}
    };

    return settingsService.find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
      });
  });

  it('Should not let do a request if not valid accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer wrong.access.token`
      },
      query: {}
    };

    return settingsService.find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
      });
  });

  it('Should let do a request if valid accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    sandbox.stub(settingsService, 'find')
      .returns(Promise.resolve([]));

    return settingsService.find(params)
      .then((result) => {
        expect(result.length).to.equal(0);
      });
  });
});
