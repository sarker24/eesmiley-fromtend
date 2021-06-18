'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const moment = require('moment');
const calculatePercentageOfCompletion = require('../../../../../src/services/projects/hooks/calculate-percentage-of-completion');
const expect = chai.expect;

describe('Projects Service - calculate-percentage-of-completion hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  afterEach(() => {
    sandbox.restore();
  });

  it('Should set percentage as 0 for PENDING_START projects', () => {
    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_START'
    };
    const mockHook = {
      result: project,
      id: 1,
      method: 'get',
      params: {},
      app
    };

    return calculatePercentageOfCompletion.default()(mockHook)
      .then((result) => {
        expect(result.result.percentage).to.equal(0);
      });
  });

  it('Should set percentage as 100 for PENDING_INPUT, PENDING_FOLLOWUP, RUNNING_FOLLOWUP, FINISHED projects', () => {
    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS'
      },
      status: 'PENDING_INPUT'
    };
    const mockHook = {
      result: project,
      id: 1,
      method: 'get',
      params: {},
      app
    };

    return calculatePercentageOfCompletion.default()(mockHook)
      .then((result) => {
        expect(result.result.percentage).to.equal(100);
      });
  });

  it('Should calculate percentage for duration.type = REGISTRATIONS', () => {
    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS',
        days: 10
      },
      status: 'RUNNING'
    };

    sandbox.stub(app.get('sequelize'), 'query')
      .returns(Promise.resolve([
        {},
        {},
        {}
      ]));

    return calculatePercentageOfCompletion.calculatePercentageByDurationRegistrations(project, app)
      .then((result) => {
        expect(result.percentage).to.equal(30);
      });
  });

  it('Should return error if there is a problem calculating percentage from registrations', () => {
    const project = {
      id: 1,
      duration: {
        type: 'REGISTRATIONS',
        days: 10
      },
      status: 'RUNNING'
    };

    sandbox.stub(app.get('sequelize'), 'query')
      .returns(Promise.reject({
        sad: 'but true'
      }));

    return calculatePercentageOfCompletion.calculatePercentageByDurationRegistrations(project, app)
      .catch((result) => {
        expect(result.data.errorCode).to.equal('E164');
      });
  });

  it('Should calculate percentage for duration.type = CALENDAR', () => {
    const project = {
      id: 1,
      duration: {
        type: 'CALENDAR',
        start: 1491000010,
        end: moment() + 9000
      },
      status: 'RUNNING'
    };


    return calculatePercentageOfCompletion.calculatePercentageByDurationCalendar(project)
      .then((result) => {
        const totalDurationOfProject = project.duration.end - project.duration.start;
        const elapsedTimeProject = moment().unix() - project.duration.start;
        const percentage = Math.round((elapsedTimeProject * 100) / totalDurationOfProject);
        expect(result.percentage).to.equal(percentage);
      });
  });

  it('Should calculate percentage for duration.type = CALENDAR 2', () => {
    const project = {
      id: 1,
      duration: {
        type: 'CALENDAR',
        start: moment.now() + 10,
        end: moment.now() + 3600
      },
      status: 'RUNNING'
    };


    return calculatePercentageOfCompletion.calculatePercentageByDurationCalendar(project)
      .then((result) => {
        expect(result.percentage).to.equal(0);
      });
  });


  it('Should route to calculatePercentageByDurationRegistrations', () => {
    const projects = [{
      id: 1,
      duration: {
        type: 'REGISTRATIONS',
        days: 10
      },
      status: 'RUNNING'
    }];

    const mockHook = {
      result: projects,
      id: 1,
      method: 'find',
      params: {},
      app
    };
    sandbox.stub(sequelize, 'query').resolves(Array(9));
    return calculatePercentageOfCompletion.default()(mockHook)
      .then((result) => {
        expect(result.result[0].percentage).to.equal(90);
      });
  });

  it('Should route to calculatePercentageByDurationCalendar', () => {
    const projects = [{
      id: 1,
      duration: {
        type: 'CALENDAR',
        start: 1491000010,
        end: 1600000000
      },
      status: 'RUNNING'
    }];

    const mockHook = {
      result: projects,
      id: 1,
      method: 'find',
      params: {},
      app
    };


    return calculatePercentageOfCompletion.default()(mockHook)
      .then((result) => {
        expect(result.result[0].percentage).to.equal(100);
      });
  });

  it('Should return error if calculation fails', () => {
    const projects = [{
      id: 1,
      duration: {
        type: 'DURATION',
        start: 1491000010,
        end: 1600000000
      },
      status: 'RUNNING'
    }];

    const mockHook = {
      result: projects,
      id: 1,
      method: 'find',
      params: {},
      app
    };

    sandbox.stub(sequelize, 'query')
      .rejects(new Error('oopsie'));

    return calculatePercentageOfCompletion.default()(mockHook)
      .then(() => assert.fail('expected error to be thrown'))
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E164');
      });
  });
});
