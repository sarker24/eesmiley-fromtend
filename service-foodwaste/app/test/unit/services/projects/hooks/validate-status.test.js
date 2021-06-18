'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const validateStatus = require('../../../../../src/services/projects/hooks/validate-status');
const expect = chai.expect;
const moment = require('moment');

describe('Projects Service - validate-status hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  afterEach(() => {
    sandbox.restore();
  });

  it('Should change status to RUUNING (dutations.type = REGISTRATIONS)', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_START'
    };

    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    return validateStatus.setToRunningStatus(project, app, params)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('RUNNING');
      });
  });

  it('Should NOT change status to RUUNING (dutations.type = REGISTRATIONS) when flag isFromAssociateRegistrationWithProject is not present', () => {
    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_START'
    };
    const params = {};

    return validateStatus.setToRunningStatus(project, app, params)
      .then((result) => {
        expect(result.status).to.equal('PENDING_START');
      });
  });

  it('Should change status to RUUNING (dutations.type = CALENDAR)', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    const project = {
      id: 1,
      duration: {
        type: 'CALENDAR',
        start: 1491000000,
        end: 4491000000
      },
      status: 'PENDING_START'
    };

    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    return validateStatus.setToRunningStatus(project, app, params)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('RUNNING');
      });
  });

  it('Should mark as PENDING_INPUT a project expired by CALENDAR', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    const project = {
      id: 1,
      percentage: 100,
      duration: {
        type: 'CALENDAR',
        start: 1491000000,
        end: 1491000001
      },
      status: 'RUNNING'
    };

    const params = {};

    return validateStatus.setToPendingInputStatus(project, app, params)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('PENDING_INPUT');
      });
  });

  it('Should mark as PENDING_INPUT a project expired by REGISTRATIONS', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    sandbox.stub(app.get('sequelize'), 'query')
      .returns(Promise.resolve([
        {
          date: '2017-01-01'
        },
        {
          date: '2017-01-02'
        }]));

    const project = {
      id: 1,
      percentage: 100,
      "duration": {
        "days": 2,
        "type": "REGISTRATIONS"
      },
      status: 'RUNNING'
    };

    const params = {};

    return validateStatus.setToPendingInputStatus(project, app, params)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('PENDING_INPUT');
      });
  });

  it('Should NOT mark as PENDING input a project if its on its last day of REGISTRATIONS', () => {
    sandbox.stub(app.get('sequelize'), 'query')
      .returns(Promise.resolve([
        {
          date: '2017-01-01'
        },
        {
          date: moment().format('YYYY-MM-DD')
        }]));

    const project = {
      id: 1,
      percentage: 100,
      "duration": {
        "days": 2,
        "type": "REGISTRATIONS"
      },
      status: 'RUNNING'
    };

    const params = {
      isFromAssociateRegistrationWithProject: true,
      registrationDate: moment().format('YYYY-MM-DD')
    };

    return validateStatus.validateSetToPendingInputDurationRegistrations(project, app, params)
      .then((result) => {
        expect(result).to.deep.equal(project);
      });
  });

  it('Should NOT mark as PENDING input a project if its on its last day of CALENDAR', () => {
    const project = {
      id: 1,
      percentage: 100,
      duration: {
        "start": moment('2018-05-05', 'YYYY-MM-DD').unix(),
        "end": moment().endOf('day').unix(),
        "type": "CALENDAR"
      },
      status: 'RUNNING'
    };

    const params = {};

    return validateStatus.setToPendingInputStatus(project, app, params)
      .then((result) => {
        expect(result).to.deep.equal(project);
      });
  });

  it('Should throw E172 if there is an error setting project to PENDING_INPUT with duration===REGISTRATIONS', () => {
    sandbox.stub(app.get('sequelize'), 'query')
      .returns(Promise.reject(new Error('BadStuff')));

    const project = {
      id: 1,
      percentage: 100,
      "duration": {
        "days": 2,
        "type": "REGISTRATIONS"
      },
      status: 'RUNNING'
    };

    const params = {};
    return validateStatus.setToPendingInputStatus(project, app, params)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E172');
      })
  });

  it('Should change status to PENDING_FOLLOWUP', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_START'
    };

    const operations = [{
      op: 'replace',
      path: '/actions',
      value: [{
        name: 'whathever action'
      }]
    }];

    const params = {};

    const mockHook = {
      app,
      operations,
      method: 'patch',
      params,
      id: 1
    };

    return validateStatus.setToPendingFollowUpStatus(project, mockHook)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('Should change status to RUNNING_FOLLOWUP', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({}));

    const project = {
      id: 1,
      duration: {
        type: 'CALENDAR',
        start: 1491000000,
        end: 1491000001
      },
      status: 'PENDING_INPUT',
      followUpProjects: [
        {
          id: 2,
          parentProjectId: 1,
          duration: {
            type: 'CALENDAR',
            start: 1491000000,
            end: 1491000001
          },
          status: 'RUNNING',
        }
      ]
    };

    const params = {};

    return validateStatus.setToRunningFollowUpStatus(project, app, params)
      .then((result) => {
        expect(spy.args[0][0]).to.equal(1);
        expect(spy.args[0][1][0].path).to.equal('/status');
        expect(spy.args[0][1][0].value).to.equal('RUNNING_FOLLOWUP');
      });
  });

  it('Should route to setToRunningStatus', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({
        yes: true
      }));

    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_START'
    };


    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    const mockHook = {
      app,
      method: 'get',
      result: project,
      params,
      id: 1
    };

    return validateStatus.route()(mockHook)
      .then((result) => {
        expect(result.result.yes).to.equal(true);
        expect(spy.args[0][0]).to.equal(1);
      });
  });

  it('Should route to setToPendingInput', () => {
    const queryStub = sandbox.stub(sequelize, 'query').resolves([{ date: '01-01-2020' }, { date: '01-02-2020' }]);
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({
        yes: true
      }));

    const projects = [{
      id: 1,
      duration: {
        type: 'REGISTRATIONS',
        days: 2
      },
      status: 'RUNNING'
    }];


    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    const mockHook = {
      app,
      method: 'find',
      result: projects,
      params
    };

    return validateStatus.route()(mockHook)
      .then((result) => {
        expect(result.result[0].yes).to.equal(true);
        expect(spy.args[0][0]).to.equal(1);
      });
  });

  it('Should route to setPendingFollowUP', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({
        yes: true
      }));

    const operations = [{
      op: 'replace',
      path: '/actions',
      value: [{
        name: 'Whatever action'
      }]
    }];

    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_INPUT'
    };


    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    const mockHook = {
      app,
      operations,
      method: 'patch',
      result: project,
      params,
      id: 1
    };

    return validateStatus.route()(mockHook)
      .then((result) => {
        expect(result.result.yes).to.equal(true);
        expect(spy.args[0][0]).to.equal(1);
      });
  });

  it('Should route to setRunningFollowUP', () => {
    const spy = sandbox.stub(app.service('projects'), 'patch')
      .returns(Promise.resolve({
        yes: true
      }));

    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_FOLLOWUP',
      followUpProjects: [{
        id: 2,
        parentProjectId: 1,
        duration: {
          type: 'REGISTRATIONS'
        },
        status: 'RUNNING'
      }]
    };

    const params = {
      isFromAssociateRegistrationWithProject: true
    };

    const mockHook = {
      app,
      method: 'patch',
      result: project,
      params,
      id: 1
    };

    return validateStatus.route()(mockHook)
      .then((result) => {
        expect(result.result.yes).to.equal(true);
        expect(spy.args[0][0]).to.equal(1);
      });
  });
});
