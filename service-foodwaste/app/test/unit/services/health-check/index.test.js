'use strict';

/*
 * We need Promises that support the method reflect()
 */
const Promise = require('bluebird');
const sinon = require('sinon');
const chai = require('chai');

const app = require('../../../../src/app').default;

describe('health-check service', () => {
  const service = app.service('health-check');
  const expect = chai.expect;
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should return a normal response object with value "false" for Redis, instead of error object', (done) => {
    sandbox.stub(service.app.get('redisClient'), 'pingAsync').returns(Promise.reject());
    sandbox.stub(service.app.get('sequelize'), 'authenticate').returns(Promise.resolve());

    service.find().then((result) => {
      expect(result.redis).to.equal(false);
      expect(result.postgres).to.equal(true);
      expect(result.serverTime).to.be.an('number');

      done();
    });
  });

  it('should return a normal response object with value "false" for Postgres, instead of error object', (done) => {
    sandbox.stub(service.app.get('redisClient'), 'pingAsync').returns(Promise.resolve());
    sandbox.stub(service.app.get('sequelize'), 'authenticate').returns(Promise.reject());

    service.find().then((result) => {
      expect(result.redis).to.equal(true);
      expect(result.postgres).to.equal(false);
      expect(result.serverTime).to.be.an('number');

      done();
    });
  });

  it('should return all true', (done) => {
    sandbox.stub(service.app.get('redisClient'), 'pingAsync').returns(Promise.resolve());
    sandbox.stub(service.app.get('sequelize'), 'authenticate').returns(Promise.resolve());

    service.find().then((result) => {
      expect(result.redis).to.equal(true);
      expect(result.postgres).to.equal(true);
      expect(result.serverTime).to.be.an('number');

      done();
    });
  });

  it('should return an updated serverTime if we wait one second', (done) => {
    sandbox.stub(service.app.get('redisClient'), 'pingAsync').returns(Promise.resolve());
    sandbox.stub(service.app.get('sequelize'), 'authenticate').returns(Promise.resolve());

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
