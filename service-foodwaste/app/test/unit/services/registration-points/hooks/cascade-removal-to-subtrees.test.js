'use strict';

const app = require('../../../../../src/app').default;
const cascadeRemoval = require('../../../../../src/services/registration-points/hooks/cascade-removal-to-subtrees').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Registration Points Service - cascade-removal-to-subtrees hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  afterEach(() => {
    sandbox.restore();
  });

  it('Should cascade removal of root node', () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": 123,
        "parentId": null,
        "path":  null,
        "name": "Registration point",
        "cost": 200,
        "amount": "2000",
        "active": false
      }
    };

    const stub = sandbox.stub(sequelize.models.registration_point, 'destroy').returns(Promise.resolve());

    return cascadeRemoval()(mockHook).then(outHook => {
      expect(stub.calledOnce).to.equal(true);
      expect(stub.args[0][0]).to.deep.equal({
        where: {
          path: {
            $contained: "123"
          }
        }
      });

    });
  });

  it('Should cascade removal of subtree node', () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": 123,
        "parentId": 120,
        "path": "120.121",
        "name": "Registration point",
        "cost": 200,
        "amount": "2000",
        "active": true
      }
    };

    const stub = sandbox.stub(sequelize.models.registration_point, 'destroy').returns(Promise.resolve());

    return cascadeRemoval()(mockHook).then(outHook => {
      expect(stub.calledOnce).to.equal(true);
      expect(stub.args[0][0]).to.deep.equal({
        where: {
          path: {
            $contained: "120.121.123"
          }
        }
      });

    });
  });
});
