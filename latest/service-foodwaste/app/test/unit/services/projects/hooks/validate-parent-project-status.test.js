'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const validateParentProjectStatus = require('../../../../../src/services/projects/hooks/validate-parent-project-status');

describe('Projects Service - validate-parent-project-status hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should change parentProject status to ON_HOLD if there no active followup projects', () => {
    const mockHook = {
      app,
      method: 'patch',
      params: {},
      operations: [{
        op: 'replace',
        path: '/status',
        value: 'ON_HOLD'
      }],
      data: {
        "id": 6,
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
        "actions": [],
        "status": "PENDING_INPUT"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "PENDING_FOLLOWUP"
      }
    };

    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    return validateParentProjectStatus.validateParentForPatchMethod(mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(5);
        expect(spy.args[0][1][0].value).to.equal('ON_HOLD');
      });
  });

  it('Should change parentProject status to PENDING_FOLLOWUP for PATCH', () => {
    const mockHook = {
      app,
      method: 'patch',
      params: {},
      operations: [{
        op: 'replace',
        path: '/status',
        value: 'PENDING_START'
      }],
      data: {
        "id": 6,
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
        "actions": [],
        "status": "RUNNING"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "ON_HOLD"
      }
    };

    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    return validateParentProjectStatus.validateParentForPatchMethod(mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(5);
        expect(spy.args[0][1][0].value).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('Should change parentProject status to PENDING_FOLLOWUP for PATCH', () => {
    const mockHook = {
      app,
      method: 'patch',
      params: {},
      operations: [{
        op: 'replace',
        path: '/status',
        value: 'RUNNING'
      }],
      data: {
        "id": 6,
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
        "actions": [],
        "status": "RUNNING"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "ON_HOLD"
      }
    };

    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    return validateParentProjectStatus.validateParentForPatchMethod(mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(5);
        expect(spy.args[0][1][0].value).to.equal('RUNNING_FOLLOWUP');
      });
  });

  it('Should prevent creation of followUps if parent is not PENDING_FOLLOWUP OR RUNNING', () => {
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
        "actions": [],
        "status": "PENDING_START"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "RUNNING"
      }
    };
    return validateParentProjectStatus.validateParentForCreateMethod(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E161');
      });
  });

  it('Should change parentProject status to PENDING_FOLLOWUP for CREATE', () => {
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
        "actions": [],
        "status": "PENDING_START"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "ON_HOLD"
      }
    };

    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    return validateParentProjectStatus.validateParentForCreateMethod(mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(5);
        expect(spy.args[0][1][0].value).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('Should allow creation of followUps if parent has status PENDING_FOLLOWUP', () => {
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
        "actions": [],
        "status": "PENDING_START"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "PENDING_FOLLOWUP"
      }
    };


    return validateParentProjectStatus.validateParentForCreateMethod(mockHook)
      .then((result) => {
        expect(result).to.deep.equal(mockHook);
      });
  });

  it('Should allow creation of followUps if parent has status FINISHED', () => {
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
        "actions": [],
        "status": "PENDING_START"
      },
      parentProject: {
        "id": 5,
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
        "actions": [],
        "status": "FINISHED"
      }
    };

    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    return validateParentProjectStatus.validateParentForCreateMethod(mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(5);
        expect(spy.args[0][1][0].value).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('Should route to validateParentForPatchMethod', () => {
    const mockHook = {
      app,
      parentProject: {
        id: 1,
        status: 'PENDING_FOLLOWUP'
      },
      params: {},
      method: 'patch',
      operations: [
        { op: 'replace', path: '/status', value: 'FINISHED'}
      ]
    };

    sandbox.stub(app.service('projects'), 'patch').resolves('yes');
    return validateParentProjectStatus.default()(mockHook)
      .then((res) => {
        expect(res.parentProject).to.equal('yes');
      });
  });

  it('Should route to validateParentForCreateMethod', () => {
    const mockHook = {
      app,
      parentProject: {
        id: 1,
        status: 'ON_HOLD'
      },
      params: {},
      method: 'create'
    };

    sandbox.stub(app.service('projects'), 'patch').resolves('yes');

    return validateParentProjectStatus.default()(mockHook)
      .then((res) => {
        expect(res.parentProject).to.equal('yes');
      });
  });
});
