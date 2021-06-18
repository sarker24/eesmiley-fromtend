'use strict';

const chai = require('chai');

const app = require('../../../../src/app').default;

describe('ping service', () => {
  const service = app.service('ping');
  const expect = chai.expect;

  it('should return the message "pong" and statusCode 418', (done) => {
    service.find().then((result) => {
      expect(result.message).to.be.equal('pong');
      expect(app.response.statusCode).to.equal(418);

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
