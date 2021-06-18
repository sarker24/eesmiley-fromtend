'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const getFollowUpProjects = require('../../../../../src/services/projects/hooks/get-follow-up-projects').default;
const expect = chai.expect;

describe('Projects Service - get-follow-up-projects hook', () => {
  const sandbox = sinon.createSandbox();


  afterEach(() => {
    sandbox.restore();
  });

  it('Should get a followUpProjects array with the children projects of a single project', () => {
    const mockHook = {
      type: 'after',
      method: 'find',
      app: app,
      params: {},
      result: {
        "id": "105",
        "parentProjectId": null,
        "name": "aaaaaaaa",
        "duration": {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        "status": "PENDING_START"
      }
    };

    sandbox.stub(app.service('projects'), 'find')
      .returns(Promise.resolve([
        {
          "id": "106",
          "parentProjectId": "105",
          "name": "aaaaaaaa",
          "duration": {
            "end": 1502440455,
            "type": "CALENDAR",
            "start": 1502143200
          },
          "status": "PENDING_START"
        }
      ]));

    return getFollowUpProjects()(mockHook)
      .then((result) => {
        expect(result.result.followUpProjects[0].id).to.equal('106');
      });
  });

  it('Should get a followUpProjects array with the children projects of an array of projects', () => {
    const mockHook = {
      type: 'after',
      method: 'find',
      app: app,
      params: {},
      result: [{
        "id": "105",
        "parentProjectId": null,
        "name": "aaaaaaaa",
        "duration": {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        "status": "PENDING_START"
      },
        {
          "id": "107",
          "parentProjectId": null,
          "name": "bbbbbbb",
          "duration": {
            "end": 1502440455,
            "type": "CALENDAR",
            "start": 1502143200
          },
          "status": "PENDING_START"
        }]
    };

    sandbox.stub(app.service('projects'), 'find')
      .returns(Promise.resolve([
        {
          "id": "106",
          "parentProjectId": "105",
          "name": "aaaaaaaa",
          "duration": {
            "end": 1502440455,
            "type": "CALENDAR",
            "start": 1502143200
          },
          "status": "PENDING_START"
        }
      ]));

    return getFollowUpProjects()(mockHook)
      .then((result) => {
        expect(result.result[0].followUpProjects[0].id).to.equal('106');
        expect(result.result[1].followUpProjects[0].id).to.equal('106');
      });
  });

  it('Should return a general error ', () => {
    const mockHook = {
      type: 'after',
      method: 'find',
      app: app,
      params: {},
      result: {
        "id": "105",
        "parentProjectId": null,
        "name": "aaaaaaaa",
        "duration": {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        "status": "PENDING_START"
      }
    };

    sandbox.stub(app.service('projects'), 'find')
      .returns(Promise.reject({
        error: 'Bad stuff'
      }));

    return getFollowUpProjects()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E152');
      });
  });
});
