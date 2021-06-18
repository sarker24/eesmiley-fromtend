'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const getParentProject = require('../../../../../src/services/projects/hooks/get-parent-project').default;
const expect = chai.expect;

describe('Projects Service - get-parent-project hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should add an parentProject object to the hook object', () => {

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "areas": [
          {
            "id": 5,
            "name": "AreaA"
          }
        ],
        "products": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      }
    };

    sandbox.stub(app.service('projects'), 'get')
      .returns(Promise.resolve({
        id: 4
      }));

    return getParentProject()(mockHook)
      .then((result) => {
        expect(result.parentProject.id).to.equal(4);
      });
  });

  it('Should return error if no records are found', () => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "areas": [
          {
            "id": 5,
            "name": "AreaA"
          }
        ],
        "products": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      }
    };

    sandbox.stub(app.service('projects'), 'get')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    return getParentProject()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E162');
      });
  });

  it('Should add an parentProject = null to the hook object if there is no parentProjectId', () => {

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "areas": [
          {
            "id": 5,
            "name": "AreaA"
          }
        ],
        "products": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      }
    };

    sandbox.stub(app.service('projects'), 'get')
      .returns(Promise.resolve({
        id: 4
      }));

    return getParentProject()(mockHook)
      .then((result) => {
        expect(result.parentProject).to.equal(null);
      });
  });

  it('Should return an error if the parent project is already a child of another project', () => {

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "areas": [
          {
            "id": 5,
            "name": "AreaA"
          }
        ],
        "products": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      }
    };

    sandbox.stub(app.service('projects'), 'get')
      .returns(Promise.resolve({
        parentProjectId: 2,
        id: 4
      }));

    return getParentProject()(mockHook)
      .catch((err) => {
        expect(err.name).to.equal('BadRequest');
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Parent project has a parent itself');

        expect(err.data.errorCode).to.equal('E166');
        expect(err.data.parentProject).to.deep.equal({ parentProjectId: 2, id: 4 });
      });
  });
});
