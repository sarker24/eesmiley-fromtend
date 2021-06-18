'use strict';

const app = require('../../../../../src/app').default;
const assignPath = require('../../../../../src/services/registration-points/hooks/assign-path-to-registration-point').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Registration Points Service - assign-path-to-registration-point hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  afterEach(() => {
    sandbox.restore();
  });

  it('Should assign null path when given no parentId', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "name": "Registration point without parent",
        "cost": 200,
        "amount": "2000"
      }
    };

    return assignPath()(mockHook).then(outHook => {
      expect(outHook.data).to.deep.equal({
        "name": "Registration point without parent",
        "cost": 200,
        "amount": "2000",
        "path": null
      })
    });
  });

  it('Should assign null path when parentId is null', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "parentId": null,
        "name": "Registration point without parent",
        "cost": 200,
        "amount": "2000"
      }
    };

    return assignPath()(mockHook).then(outHook => {
      expect(outHook.data).to.deep.equal({
        "name": "Registration point without parent",
        "cost": 200,
        "amount": "2000",
        "path": null,
        "parentId": null
      });
    });
  });

  it('Should assign correct path when parent is root node', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "parentId": 123,
        "name": "Registration point with parent",
        "cost": 200,
        "amount": "2000"
      }
    };

    sandbox.stub(sequelize.models.registration_point, 'findOne').returns(Promise.resolve({
      id: 123,
      path: null
    }));

    return assignPath()(mockHook).then(outHook => {
      expect(outHook.data).to.deep.equal({
        "name": "Registration point with parent",
        "cost": 200,
        "amount": "2000",
        "path": "123",
        "parentId": 123
      });
    });
  });

  it('Should assign correct path when parent is not root node', () => {
    const mockHook = {
      app,
      params: {},
      data: {
        "parentId": 123,
        "name": "Registration point with parent",
        "cost": 200,
        "amount": "2000"
      }
    };

    sandbox.stub(sequelize.models.registration_point, 'findOne').returns(Promise.resolve({
      id: 123,
      path: "1.10"
    }));

    return assignPath()(mockHook).then(outHook => {
      expect(outHook.data).to.deep.equal({
        "name": "Registration point with parent",
        "cost": 200,
        "amount": "2000",
        "path": "1.10.123",
        "parentId": 123
      });
    });
  });
});
