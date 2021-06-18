const app = require('../../../../../src/app').default;
const cascadeUpdate = require('../../../../../src/services/registration-points/hooks/cascade-path-update-to-subtrees').default;
const hasParentChangeOp = require('../../../../../src/services/registration-points/hooks/cascade-path-update-to-subtrees').hasParentChangeOp;

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Registration Points Service - cascade-path-update-to-subtrees', () => {

  describe('hasParentChangeOp', () => {
    it('Should return false when given patch operations dont include parentId', () => {
      const patchOps = [{
        op: 'add',
        path: '/cost',
        value: 120
      }];

      expect(hasParentChangeOp(patchOps)).to.equal(false);
    });

    it('Should return true when given patch operations include parentId', () => {
      const patchOps = [{
        op: 'replace',
        path: '/parentId',
        value: 10
      }];

      expect(hasParentChangeOp(patchOps)).to.equal(true);
    });

  });

  describe('hook', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should not cascade when given no parentId operation ', () => {
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

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve());
      return cascadeUpdate()(mockHook).then(outHook => {
        expect(stub.notCalled).to.equal(true);
      });
    });

    it('Should cascade when given parentId operation', () => {
      const mockHook = {
        app,
        params: {},
        operations: [{ op: 'replace', path: '/parentId', value: 10 }],
        registration_point:  {
          "id": 123,
          "parentId": 6,
          "path": '6',
          "name": "Registration point without parent",
          "cost": 200,
          "amount": "2000",
          "active": false
        },
        result: {
          "id": 123,
          "parentId": 10,
          "path": '10',
          "name": "Registration point without parent",
          "cost": 200,
          "amount": "2000",
          "active": false
        }
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve());

      return cascadeUpdate()(mockHook).then(outHook => {
        expect(stub.calledOnce).to.equal(true);
      });
    });

  });
});
