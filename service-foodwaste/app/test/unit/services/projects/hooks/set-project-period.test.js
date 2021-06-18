'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const setProjectPeriod = require('../../../../../src/services/projects/hooks/set-project-period').default;

describe('Projects Service - set-period-for-project hook', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should add a "period" to the hook object', async () => {
    sandbox.stub(app.service('projects'), 'patch').resolves({
      'id': 5,
      'name': 'Parent project',
      'period': 4
    });

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        'parentProjectId': 5,
        'name': 'New followUp project'
      },
      parentProject: {
        id: 5,
        followUpProjects: [
          {
            'period': 2,
            'parentProjectId': 5
          },
          {
            'period': 3,
            'parentProjectId': 5
          }
        ]
      }
    };

    const outHook = await setProjectPeriod()(mockHook);
    expect(outHook.data.name).to.equal('New followUp project');
    // Parent is the 1st period, then 2nd and 3rd are the currently existing followUps, which means that the new
    // followUp should be the 4th period.
    expect(outHook.data.period).to.equal(4);
  });

  it('Should skip when given project without parent', async () => {

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        'name': 'New followUp project'
      }
    };

    const expected = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        'name': 'New followUp project'
      }
    };

    const outHook = await setProjectPeriod()(mockHook);
    expect(outHook).to.deep.equal(expected);

  });

  it('Should return an error when patching the parent project with new period returns an error', async () => {
    sandbox.stub(app.service('projects'), 'patch').rejects({ err: 'Some error' });

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        'parentProjectId': 5,
        'name': 'New followUp project'
      },
      parentProject: {
        id: 5,
        followUpProjects: [
          {
            'period': 2,
            'parentProjectId': 5
          }
        ]
      }
    };

    try {
      await setProjectPeriod()(mockHook)
    } catch (err) {
      expect(err.message).to.equal('Could not update parent project with new period from new followUp project');
      expect(err.data.errorCode).to.equal('E176');
      expect(err.data.parentProjectId).to.equal(5);
      // Parent is the 1st period, then 2nd is the currently existing followUp, which means that the new
      // followUp should have been the 3rd period.
      expect(err.data.newPeriod).to.equal(3);
    }
  });
});
