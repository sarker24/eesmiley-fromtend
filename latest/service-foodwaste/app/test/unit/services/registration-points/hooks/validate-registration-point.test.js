'use strict';

const app = require('../../../../../src/app').default;
const validate = require('../../../../../src/services/registration-points/hooks/validate-registration-point').default;
const getActiveOpValue = require('../../../../../src/services/registration-points/hooks/validate-registration-point').getActiveOpValue;
const validateForInactiveAncestors = require('../../../../../src/services/registration-points/hooks/validate-registration-point').validateForInactiveAncestors;
const validateForOngoingProjects = require('../../../../../src/services/registration-points/hooks/validate-registration-point').validateForOngoingProjects;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;

describe('Registration Points Service - validate-registration-point', () => {
  describe('Validate activation of registration point when inactive ancestors exist', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should return error when trying to activate a registration point with inactive ancestor', () => {
      const mockHook = {
        app,
        params: {},
        data: [{ op: 'replace', path: '/active', value: true }],
        registration_point: {
          "id": 123,
          "parentId": 23,
          "path": '23',
          "name": "Registration point with parent",
          "cost": 200,
          "amount": "2000",
          "active": false
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([
        { id: 23, active: false, name: 'Inactive ancestor' }
      ]));

      return validateForInactiveAncestors(mockHook).catch(error => {
        expect(error.code).to.be.equal(409);
        expect(error.data.errorCode).to.be.equal('E175');
      });
    });

    it('Should pass validation when trying to activate registration point with active ancestor', () => {
      const mockHook = {
        app,
        params: {},
        data: [{ op: 'replace', path: '/active', value: true }],
        registration_point: {
          "id": 123,
          "parentId": 23,
          "path": '23',
          "name": "Registration point with parent",
          "cost": 200,
          "amount": "2000",
          "active": false
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([]));

      return validateForInactiveAncestors(mockHook).then(outHook => {
        expect(outHook).to.deep.equal(mockHook);
      });
    });
  });

  describe('Validate deactivation when registration point is part of ongoing project', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should return an error when deactivating a reg. point connected to an ongoing project', () => {
      const mockHook = {
        app,
        params: {
          accessTokenPayload: {
            customerId: '1'
          }
        },
        data: [{op: 'replace', path: '/active', value: false}],
        registration_point: {
          "id": 123,
          "parentId": 23,
          "path": '23',
          "name": "Registration point with parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([23, 35, 37]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([{id: 1, name: "Project"}]));

      return validateForOngoingProjects(mockHook).catch(error => {
        expect(error.code).to.be.equal(409);
        expect(error.data.errorCode).to.be.equal('E258');
      });
    });

    it('Should pass validation when deactivating a reg. point not connected to an ongoing project', () => {
      const mockHook = {
        app,
        params: {
          accessTokenPayload: {
            customerId: '1'
          }
        },
        data: [{op: 'replace', path: '/active', value: false}],
        registration_point: {
          "id": 123,
          "parentId": 23,
          "path": '23',
          "name": "Registration point with parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([23, 35, 37]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([]));

      return validateForOngoingProjects(mockHook).then(outHook => {
        expect(outHook).to.deep.equal(mockHook);
      });
    });
  });

  describe('getActiveOpValue', () => {
    it('Should return true when given activation change with boolean value', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: true
      }];

      expect(getActiveOpValue(patchOps)).to.equal(true);
    });

    it('Should return true when given activation change with string value', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: 'true'
      }];

      expect(getActiveOpValue(patchOps)).to.equal(true);
    });

    it('Should return false when given deactivation change with boolean value', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: false
      }];

      expect(getActiveOpValue(patchOps)).to.equal(false);
    });

    it('Should return false when given deactivation change with string value', () => {
      const patchOps = [{
        op: 'replace',
        path: '/active',
        value: 'false'
      }];

      expect(getActiveOpValue(patchOps)).to.equal(false);
    });

    it('Should return undefined when no /active op is given', () => {
      const patchOps = [{
        op: 'replace',
        path: '/name',
        value: 'test'
      }];

      expect(getActiveOpValue(patchOps)).to.equal(undefined);
    });

  });

  describe('hook', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should pass validation when patch includes activation', () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: "patch",
        id: 1,
        data: [{ op: 'replace', path: '/active', value: true }],
        registration_point: {
          id: 1,
          path: null,
          parentId: null,
          name: "not fancy name",
          active: false
        }
      };

      return validate()(mockHook).then(outHook => {
        expect(outHook).to.deep.equal(mockHook);
      });
    });

    it('Should pass validation when patch includes deactivation but is not part of active project', () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: "patch",
        id: 1,
        data: [{ op: 'replace', path: '/active', value: false }],
        registration_point: {
          id: 1,
          path: null,
          parentId: null,
          name: "not fancy name",
          active: true
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([{ "id": 1 }]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([]));

      return validate()(mockHook).then(outHook => {
        expect(outHook).to.deep.equal(mockHook);
      });
    });

    it('Should not pass validation when patch includes deactivation and is part of active project', () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: "patch",
        id: 1,
        data: [{ op: 'replace', path: '/active', value: false }],
        registration_point: {
          id: 1,
          path: null,
          parentId: null,
          name: "not fancy name",
          active: true
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([{ "id": 1 }]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([{ project: "exists" }]));

      return validate()(mockHook).catch(error => {
        expect(error.code).to.be.equal(409);
        expect(error.data.errorCode).to.be.equal('E258');
      });
    });

    it('Should skip validation when given no active status change operation', async () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: "patch",
        id: 1,
        data: [{ op: 'replace', path: '/name', value: 'hello world' }],
        registration_point: {
          id: 1,
          path: null,
          parentId: null,
          name: "not fancy name",
          active: true
        }
      };

      try {
        await validate()(mockHook);
      } catch (err) {
        assert.fail('should not throw error', err);
      }
    });

    it('Should skip validation when given request is not PATCH or REMOVE', async () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: 'get',
        id: 1
      };

      try {
        await validate()(mockHook);
      } catch (err) {
        assert.fail('should not throw error', err);
      }
    });

    it('Should pass validation when given REMOVE request', async () => {
      const mockHook = {
        app,
        params: { accessTokenPayload: { customerId: 1 } },
        method: 'remove',
        id: 1,
        registration_point: {
          id: 1,
          path: null,
          parentId: null,
          name: "not fancy name",
          active: true
        }
      };

      sandbox.stub(sequelize.models.registration_point, 'findAll').resolves([{ id: 1 }]);
      sandbox.stub(sequelize, 'query').resolves([]);

      try {
        await validate()(mockHook);
      } catch (err) {
        assert.fail('should not throw error', err);
      }
    });
  });
});
