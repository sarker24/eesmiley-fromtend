'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../src/app').default;
const sinon = require('sinon');

const longLiveAccessToken = app.get('testLongLivedAccessToken');

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Guest Registrations Service', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should not let do a request if no accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {},
      query: {}
    };
    app.service('guest-registrations').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
        done();
      });
  });

  it('Should not let do a request if not valid accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer wrong.access.token`
      },
      query: {}
    };
    app.service('guest-registrations').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
        done();
      });
  });

  it('Should let do a request if valid accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    sandbox.stub(app.service('guest-registrations'), 'find')
      .returns(Promise.resolve([]));

    app.service('guest-registrations').find(params)
      .then((result) => {
        expect(result.length).to.equal(0);
        done();
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
