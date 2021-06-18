'use strict';

const sinon = require('sinon');
const chai = require('chai');

const app = require('../../../../src/app').default;

describe('status service', () => {
  const service = app.service('status');
  const expect = chai.expect;
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return the status of the service', (done) => {
    service.find()
      .then((result) => {
        expect(result.service).to.equal('service-foodwaste');
        expect(result.nodeEnv).to.equal('test');
        expect(result.serverTime).to.be.an('number');

        done();
      });
  });

  it('should return an updated serverTime if we wait one second', (done) => {
    const now = Math.floor(new Date().getTime() / 1000);

    service.find().then((result) => {
      /*
       * Wait one second and get the serverTime again
       */
      setTimeout(() => {
        service.find().then((latterResult) => {
          expect(latterResult.serverTime).to.be.at.least(result.serverTime + 1);

          done();
        });
      }, 1000);
    });
  });

});
