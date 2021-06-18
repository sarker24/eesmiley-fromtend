'use strict';

const app = require('../../../../../src/app').default;
const cascadeActivation = require('../../../../../src/services/registration-points/hooks/cascade-activation-to-subtrees').default;
const hasActivationOp = require('../../../../../src/services/registration-points/hooks/cascade-activation-to-subtrees').hasActivationOp;

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Registration Points Service - cascade-activation-to-subtrees', () => {

  describe('hasActivationOp', () => {
    it('Should return false when given patch operations dont include active state change', () => {
      const patchOps = [{
        op: 'add',
        path: '/cost',
        value: 120
      }];

      expect(hasActivationOp(patchOps)).to.equal(false);
    });

    it('Should return true when given patch operations include activation', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: true
      }];

      expect(hasActivationOp(patchOps)).to.equal(true);
    });

    it('Should return true when given patch operations include deactivation', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: false
      }];

      expect(hasActivationOp(patchOps)).to.equal(true);
    });
  });

  describe('hook', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should not cascade when given no activation operation ', () => {
      const mockHook = {
        app,
        params: {},
        operations: [{ op: 'replace', path: '/name', value: 'Better name' }],
        result: {
          "id": 123,
          "name": "Registration point without parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      const stub = sandbox.stub(sequelize.models.registration_point, 'update').returns(Promise.resolve());
      return cascadeActivation()(mockHook).then(outHook => {
        expect(stub.notCalled).to.equal(true);
      });
    });

    it('Should cascade when given deactivation operation', () => {
      const mockHook = {
        app,
        params: {},
        operations: [{ op: 'replace', path: '/active', value: false }],
        result: {
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point without parent",
          "cost": 200,
          "amount": "2000",
          "active": false
        }
      };

      const stub = sandbox.stub(sequelize.models.registration_point, 'update').returns(Promise.resolve());

      return cascadeActivation()(mockHook).then(outHook => {
        expect(stub.calledOnce).to.equal(true);
        expect(stub.args[0][0]).to.deep.equal({ active: false });
        expect(stub.args[0][1]).to.deep.equal({
          where: {
            path: {
              $contained: "123"
            }
          }
        });

      });
    });

    it('Should cascade when given activation operation', () => {
      const mockHook = {
        app,
        params: {},
        operations: [{ op: 'replace', path: '/active', value: true }],
        result: {
          "id": 123,
          "parentId": 120,
          "path": "120",
          "name": "Registration point with parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      const stub = sandbox.stub(sequelize.models.registration_point, 'update').returns(Promise.resolve());

      return cascadeActivation()(mockHook).then(outHook => {
        expect(stub.calledOnce).to.equal(true);
        expect(stub.args[0][0]).to.deep.equal({ active: true });
        expect(stub.args[0][1]).to.deep.equal({
          where: {
            path: {
              $contained: "120.123"
            }
          }
        });
      });
    });
  });
});
