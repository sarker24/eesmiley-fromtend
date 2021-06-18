'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const preventMultipleRunningFollowUps = require('../../../../../src/services/projects/hooks/prevent-multiple-running-follow-ups').default;
const expect = chai.expect;

describe('Projects Service - prevent-multiple-running-follow-ups hook', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should prevent creation of a followUp project if the parent has other active followUp projects', () => {
    const mockHook = {
      app,
      method: 'create',
      params: {},
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      },
      parentProject: {
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": [],
        "followUpProjects": [
          {
            "id": 6,
            "parentProjectId": 5,
            "name": "Project child registrations",
            "status": "RUNNING",
            "duration": {
              "type": "CALENDAR",
              "start": 1491000010,
              "end": 40000000000
            },
            "registrationPoints": [
              {
                "id": 6,
                "name": "productA"
              }
            ],
            "actions": []
          }
        ]
      }
    };

    return preventMultipleRunningFollowUps()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E160');
      });
  });

  it('Should prevent the status change of a followUp project if the parent has other active followUp projects', () => {
    const mockHook = {
      app,
      method: 'patch',
      params: {},
      id: 6,
      operations: [{
        "op": "replace",
        "path": "/status",
        "value": "RUNNING"
      }],
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "status": "RUNNING",
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      },
      parentProject: {
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": [],
        "followUpProjects": [
          {
            "id": 6,
            "parentProjectId": 5,
            "name": "Project child registrations",
            "status": "RUNNING",
            "duration": {
              "type": "CALENDAR",
              "start": 1491000010,
              "end": 40000000000
            },
            "registrationPoints": [
              {
                "id": 6,
                "name": "productA"
              }
            ],
            "actions": []
          }
        ]
      }
    };

    return preventMultipleRunningFollowUps()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E160');
      });
  });

  it('Should allow creation of a followUp project if the parent has no other active followUp projects', () => {
    const mockHook = {
      app,
      method: 'create',
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
      },
      parentProject: {
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": [],
        "followUpProjects": [
          {
            "id": 6,
            "parentProjectId": 5,
            "name": "Project child registrations",
            "status": "FINISHED",
            "duration": {
              "type": "CALENDAR",
              "start": 1491000010,
              "end": 40000000000
            },
            "registrationPoints": [
              {
                "id": 6,
                "name": "productA"
              }
            ],
            "actions": []
          }
        ]
      }
    };

    return preventMultipleRunningFollowUps()(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
      });
  });

  it('Should return an error if the "followUpProjects" property is missing from the parent project object', () => {
    const mockHook = {
      app,
      method: 'patch',
      params: {},
      id: 6,
      operations: [{
        "op": "replace",
        "path": "/status",
        "value": "RUNNING"
      }],
      data: {
        "parentProjectId": 5,
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "status": "RUNNING",
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
      },
      parentProject: {
        "name": "Project child registrations",
        "duration": {
          "type": "CALENDAR",
          "start": 1491000010,
          "end": 40000000000
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": []
        // "followUpProjects" property is missing here
      }
    };

    return preventMultipleRunningFollowUps()(mockHook)
      .catch((err) => {
        expect(err.name).to.equal('BadRequest');
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Could not validate parent project');

        expect(err.data.errorCode).to.equal('E167');
        expect(err.data.parentProject).to.deep.equal(mockHook.parentProject);
      });
  });
});
