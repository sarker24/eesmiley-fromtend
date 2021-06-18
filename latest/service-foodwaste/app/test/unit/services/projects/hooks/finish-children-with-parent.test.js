'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const finishChildrenWithParent = require('../../../../../src/services/projects/hooks/finish-children-with-parent').default;

describe('Projects Service - finish-children-with-parent hook', () => {
  const sandbox = sinon.createSandbox();
  let mockHook = {};

  beforeEach(() => {
    mockHook = {
      app,
      method: 'patch',
      params: {},
      operations: [{
        op: 'test'
      }, {
        op: 'replace',
        path: '/status',
        value: 'FINISHED'
      }]
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should finish parent and its followUp projects when none of them is with status FINISHED', () => {
    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.resolve([2, [
        { status: 'FINISHED' },
        { status: 'FINISHED' }
      ]]));

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('FINISHED');

        hook.project.followUpProjects.forEach(fUp => {
          expect(fUp.status).to.equal('FINISHED');
        });
      });
  });

  it('Should do nothing when PATCH is for a followUp project ("parentProject" property exists)', () => {
    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      },
      parentProject: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP"
      }
    });

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('RUNNING_FOLLOWUP');

        expect(hook.project.followUpProjects[0].status).to.equal('ON_HOLD');
        expect(hook.project.followUpProjects[1].status).to.equal('RUNNING');
      });
  });

  it('Should finish followUp projects when parent is in status FINISHED but followUps are not', () => {
    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "FINISHED",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.resolve([2, [
        { status: 'FINISHED' },
        { status: 'FINISHED' }
      ]]));

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('FINISHED');

        expect(hook.project.followUpProjects[0].status).to.equal('FINISHED');
        expect(hook.project.followUpProjects[1].status).to.equal('FINISHED');
      });
  });

  it('Should return error when the status of an updated followUp project has not actually been updated to FINISHED', () => {
    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "FINISHED"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.resolve([2, [
        { status: 'FINISHED' },
        { status: 'RUNNING' }
      ]]));

    return finishChildrenWithParent()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Updated follow-up project should have status FINISHED, but it does not');
        expect(err.data.followUpProjectStatus).to.equal('RUNNING');
        expect(err.data.errorCode).to.equal('E170');
      });
  });

  it('Should return error when Sequelize error has occurred performing the UPDATE query', () => {
    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "FINISHED"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.reject({ err: 'Some error' }));

    return finishChildrenWithParent()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not update one or more follow-up projects to status FINISHED');
        expect(err.data.followUpProjectIds).to.deep.equal([10029, 10030]);
        expect(err.data.errorCode).to.equal('E171');
      });
  });

  it('Should finish parent and its followUps when PATCH op is "add"', () => {
    mockHook.operations[1].op = 'add';

    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.resolve([2, [
        { status: 'FINISHED' },
        { status: 'FINISHED' }
      ]]));

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('FINISHED');

        hook.project.followUpProjects.forEach(fUp => {
          expect(fUp.status).to.equal('FINISHED');
        });
      });
  });

  it('Should do nothing when PATCH is for replacing other field than "status"', () => {
    mockHook.operations[1].path = '/name'; // the patch is about replacing "name" instead of "status" entity property

    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      },
      parentProject: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP"
      }
    });

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('RUNNING_FOLLOWUP');

        expect(hook.project.followUpProjects[0].status).to.equal('ON_HOLD');
        expect(hook.project.followUpProjects[1].status).to.equal('RUNNING');
      });
  });

  it('Should do nothing when PATCH is for replacing "status" with other value than "FINISHED"', () => {
    mockHook.operations[1].value = 'PENDING_INPUT';  // the patch is about setting to "PENDING_INPUT" instead of "FINISHED"

    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "ON_HOLD"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      },
      parentProject: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP"
      }
    });

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('RUNNING_FOLLOWUP');

        expect(hook.project.followUpProjects[0].status).to.equal('ON_HOLD');
        expect(hook.project.followUpProjects[1].status).to.equal('RUNNING');
      });
  });

  it('Should finish parent and its followUp projects when doing an internal PATCH call on the parent', () => {
    // remove the first operation which is the "test" one, thus simulating an internal patch call
    mockHook.operations.shift();

    Object.assign(mockHook, {
      project: {
        id: 10028,
        name: "Running parent to be finished thru PATCH",
        status: "RUNNING_FOLLOWUP",
        followUpProjects: [
          {
            id: 10029,
            parentProjectId: 10028,
            name: "Running child 1 to be finished thru parent patch",
            status: "FINISHED"
          },
          {
            id: 10030,
            parentProjectId: 10028,
            name: "Running child 2 to be finished thru parent patch",
            status: "RUNNING"
          }
        ]
      }
    });

    sandbox.stub(app.get('sequelize').models.project, 'update')
      .returns(Promise.resolve([2, [
        { status: 'FINISHED' },
        { status: 'FINISHED' }
      ]]));

    return finishChildrenWithParent()(mockHook)
      .then(hook => {
        expect(hook.project.status).to.equal('FINISHED');

        hook.project.followUpProjects.forEach(fUp => {
          expect(fUp.status).to.equal('FINISHED');
        });
      });
  });

});
