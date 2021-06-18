'use strict';

const app = require('../../../../../src/app').default;
const getAllNodes = require('../../../../../src/services/registration-points/hooks/get-registration-point-tree-nodes').default;
const getRootIds = require('../../../../../src/services/registration-points/hooks/get-registration-point-tree-nodes').getRootIds;

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Registration Points Service - get-registration-point-tree-nodes', () => {

  describe('getRootIds', () => {
    it('Should extract root id when given no path', () => {
      const nodes = [{
        id: 1
      }];

      const expected = [1];
      expect(getRootIds(nodes)).to.deep.equal(expected);
    });

    it('Should extract root id when given a path', () => {
      const nodes = [{
        id: 3,
        path: '1.2'
      }];

      const expected = [1];
      expect(getRootIds(nodes)).to.deep.equal(expected);
    });

    it('Should extract single root id when given multiple paths to same root id', () => {
      const nodes = [{
        id: 3,
        path: '1.2'
      }, {
        id: 5,
        path: '1.2.3'
      }];

      const expected = [1];
      expect(getRootIds(nodes)).to.deep.equal(expected);
    });

    it('Should extract all root ids when given multiple trees', () => {
      const nodes = [{
        id: 2,
        path: '1'
      }, {
        id: 1,
      }, {
        id: 4
      }, {
        id: 6,
        path: '4'
      }];

      const expected = [1, 4];
      expect(getRootIds(nodes)).to.deep.equal(expected);
    });
  });

  describe('hook', () => {
    const sandbox = sinon.createSandbox();
    const sequelize = app.get('sequelize');

    afterEach(() => {
      sandbox.restore();
    });

    it('Should get all tree nodes when given a root node', () => {
      const mockHook = {
        app,
        params: {},
        result: {
          "id": 123,
          "name": "Registration point without parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve([{}]));
      return getAllNodes()(mockHook).then(outHook => {
        const { replacements } = stub.args[0][1];
        expect(stub.calledOnce).to.equal(true);
        expect(replacements.rootIds).to.have.deep.members([123]);
        expect(replacements.rootPaths).to.have.deep.members(["123.*"]);
      });
    });

    it('Should get all tree nodes when given a root node', () => {
      const mockHook = {
        app,
        params: {},
        result: {
          "id": 123,
          "parentId": 122,
          "path": "121.122",
          "name": "Registration point parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve([{}]));
      return getAllNodes()(mockHook).then(outHook => {
        const { replacements } = stub.args[0][1];
        expect(stub.calledOnce).to.equal(true);
        expect(replacements.rootIds).to.have.deep.members([121]);
        expect(replacements.rootPaths).to.have.deep.members(["121.*"]);
      });
    });

    it('Should get all tree nodes when given list of nodes from same tree', () => {
      const mockHook = {
        app,
        params: {},
        result: [{
          "id": 123,
          "parentId": 122,
          "path": "121.122",
          "name": "Registration point parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }, {
          "id": 122,
          "parentId": 121,
          "path": "121",
          "name": "Registration point parent 2",
          "cost": 200,
          "amount": "2000",
          "active": true
        }]
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve([{}]));
      return getAllNodes()(mockHook).then(outHook => {
        const { replacements } = stub.args[0][1];
        expect(stub.calledOnce).to.equal(true);
        expect(replacements.rootIds).to.have.deep.members([121]);
        expect(replacements.rootPaths).to.have.deep.members(["121.*"]);
      });
    });

    it('Should get all tree nodes when given list of nodes from same tree', () => {
      const mockHook = {
        app,
        params: {},
        result: [{
          "id": 123,
          "parentId": 122,
          "path": "121.122",
          "name": "Registration point parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }, {
          "id": 125,
          "parentId": 123,
          "path": "121.122.123",
          "name": "Registration point parent 2",
          "cost": 200,
          "amount": "2000",
          "active": true
        }]
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve([{}]));
      return getAllNodes()(mockHook).then(outHook => {
        const { replacements } = stub.args[0][1];
        expect(stub.calledOnce).to.equal(true);
        expect(replacements.rootIds).to.have.deep.members([121]);
        expect(replacements.rootPaths).to.have.deep.members(["121.*"]);
      });
    });

    it('Should get all tree nodes when given list of nodes from different trees', () => {
      const mockHook = {
        app,
        params: {},
        result: [{
          "id": 123,
          "parentId": 122,
          "path": "121.122",
          "name": "Registration point parent",
          "cost": 200,
          "amount": "2000",
          "active": true
        }, {
          "id": 99,
          "parentId": 98,
          "path": "97.98",
          "name": "Registration point parent 2",
          "cost": 200,
          "amount": "2000",
          "active": true
        }]
      };

      const stub = sandbox.stub(sequelize, 'query').returns(Promise.resolve([{}]));
      return getAllNodes()(mockHook).then(outHook => {
        const { replacements } = stub.args[0][1];
        expect(stub.calledOnce).to.equal(true);
        expect(replacements.rootIds).to.have.deep.members([121, 97]);
        expect(replacements.rootPaths).to.have.deep.members(["121.*", "97.*"]);
      });
    });
  });
});
