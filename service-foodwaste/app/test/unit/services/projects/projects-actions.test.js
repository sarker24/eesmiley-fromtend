'use strict';

const app = require('../../../../src/app').default;
const projectsActions = require('../../../../src/services/projects/projects-actions').default;
const chai = require('chai');
const sinon = require('sinon');
const serviceProjects = app.service('projects');
const serviceActions = app.service('actions');
const expect = chai.expect;
const longLiveAccessToken = app.get('testLongLivedAccessToken');

describe('Projects Service - projects/:id/actions', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.stub(serviceProjects, 'get')
      .returns(Promise.resolve({
        "id": 1,
        "name": "Project Name",
        "duration": {
          "type": "REGISTRATIONS",
          "days": 10
        },
        "userId": 1,
        "customerId": 1,
        "status": "PENDING_START",
        "areas": [
          {
            "id": 1,
            "name": "Kitchen"
          },
          {
            "id": 3,
            "name": "Coffee room"
          }
        ],
        "products": [
          {
            "id": 1,
            "name": "Hawaiian pizza"
          },
          {
            "id": 2,
            "name": "Chicken wings"
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "parentProjectId": 1
      }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should create an action and add it to the provided project', () => {
    const spyActionCreate = sandbox.stub(serviceActions, 'create')
      .returns(Promise.resolve({
        id: 3,
        name: "Action test"
      }));

    const spyActionPatch = sandbox.stub(serviceProjects, 'patch')
      .returns(Promise.resolve({}));

    const params = {
      projectId: 1
    };

    const data = {
      name: "Action test"
    };

    return projectsActions(app).create(data, params)
      .then((result) => {
        expect(spyActionPatch.args[0][1][0].op).to.equal('add');
        expect(spyActionPatch.args[0][1][0].value.id).to.equal(3);
        expect(spyActionPatch.args[0][1][0].value.name).to.equal('Action test');
      });
  });

  it('Should return 404 if project does not exist on create', () => {
    sandbox.restore();
    sandbox.stub(serviceProjects, 'get').returns(Promise.resolve(null));

    const params = {
      projectId: 1
    };

    const data = {
      name: "Action test"
    };

    return projectsActions(app).create(data, params)
      .catch((err) => {
        expect(err.code).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E039');
      });
  });

  it('Should return a bunch of actions filtered by provided criteria', () => {
    const params = {
      projectId: 1,
      query: {
        name: 'Use smaller plates'
      }
    };

    return projectsActions(app).find(params)
      .then((result) => {
        expect(result[0].id).to.equal(1);
        expect(result[0].name).to.equal('Use smaller plates');
      });
  });

  it('Should return 404 if project does not exist on find', () => {
    sandbox.restore();
    sandbox.stub(serviceProjects, 'get').returns(Promise.resolve(null));

    const params = {
      projectId: 1
    };

    return projectsActions(app).find(params)
      .catch((err) => {
        expect(err.code).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E040');
      });
  });

  it('Should return an action matching provided id', () => {
    const params = {
      projectId: 1
    };

    return projectsActions(app).get(1, params)
      .then((result) => {
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('Use smaller plates');
      });
  });

  it('Should return 404 if project does not exist on get', () => {
    sandbox.restore();
    sandbox.stub(serviceProjects, 'get').returns(Promise.resolve(null));
    const params = {
      projectId: 1
    };

    return projectsActions(app).get(1, params)
      .catch((err) => {
        expect(err.code).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E041');
      });
  });

  it('Should delete an action from the project', () => {
    const spyActionPatch = sandbox.stub(serviceProjects, 'patch').returns(Promise.resolve({}));

    const params = {
      projectId: 1
    };

    return projectsActions(app).remove(1, params)
      .then((result) => {
        expect(spyActionPatch.args[0][1][0].op).to.equal('remove');
        expect(spyActionPatch.args[0][1][0].path).to.equal('/actions/0');
      });
  });

  it('Should return 404 if project does not exist on remove', () => {
    sandbox.restore();
    sandbox.stub(serviceProjects, 'get').returns(Promise.resolve(null));

    const params = {
      projectId: 1
    };

    return projectsActions(app).remove(1, params)
      .catch((err) => {
        expect(err.code).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E042');
      });
  });

  it('Should not let do a request if no accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {},
      query: {}
    };

    return app.service('projects/:projectId/actions').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
      });
  });

  it('Should not let do a request if not valid accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer wrong.access.token`
      },
      query: {}
    };

    return app.service('projects/:projectId/actions').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);
      });
  });

  it('Should let do a request if valid accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    return app.service('projects/:projectId/actions').find(params)
      .then((result) => {
        expect(result.length).to.equal(2);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
