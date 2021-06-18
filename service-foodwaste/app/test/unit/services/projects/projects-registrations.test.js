'use strict';

const app = require('../../../../src/app').default;
const projectsRegistrations = require('../../../../src/services/projects/projects-registrations').default;
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const longLiveAccessToken = app.get('testLongLivedAccessToken');

describe('Projects Service - projects/:id/registrations', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const projectModel = sequelize.models.project;
  const projectRegistrationModel = sequelize.models.project_registration;

  let queryStub;

  beforeEach(() => {
    queryStub = sandbox.stub(projectModel, 'findOne')
      .resolves({
        getRegistrations: () => {
          return Promise.resolve([
            {
              "date": "2017-02-02",
              "createdAt": "2017-07-07 13:05:37",
              "updatedAt": "2017-07-07 13:05:37",
              "id": "1",
              "customerId": "1",
              "userId": "1",
              "amount": 10000,
              "unit": "kg",
              "currency": "DKK",
              "kgPerLiter": 1,
              "cost": 1000,
              "comment": null,
              "manual": true,
              "scale": null,
              "registrationPointId": "1",
              "project_registration": {
                "date": "2017-07-07",
                "createdAt": "2017-07-07 13:41:53",
                "updatedAt": "2017-07-07 13:41:53",
                "registration_id": "24",
                "project_id": "1"
              }
            },
            {
              "date": "2017-02-02",
              "createdAt": "2017-07-07 13:05:43",
              "updatedAt": "2017-07-07 13:05:43",
              "id": "2",
              "customerId": "1",
              "userId": "1",
              "amount": 10000,
              "unit": "kg",
              "currency": "DKK",
              "kgPerLiter": 1,
              "cost": 1000,
              "comment": null,
              "manual": true,
              "scale": null,
              "registrationPointId": "2",
              "project_registration": {
                "date": "2017-07-07",
                "createdAt": "2017-07-07 13:41:53",
                "updatedAt": "2017-07-07 13:41:53",
                "registration_id": "25",
                "project_id": "1"
              }
            }
          ]);
        },
        "registrationPoints": [
          {
            "id": 1,
            "goal": 20,
            "name": "pizza"
          },
          {
            "id": 2,
            "goal": 15,
            "name": "hotdogs"
          },
          {
            "id": 3,
            "goal": 30,
            "name": "kebab"
          }
        ],
      });

    sandbox.stub(app.service('projects'), 'find').returns(Promise.resolve([]));

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return a registration matching provided id', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    return projectsRegistrations(app).get(1, params)
      .then((result) => {
        expect(parseInt(result.id)).to.equal(1);
      });
  });

  it('Should return 404 if project does not exist', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    queryStub.resolves(null);

    return projectsRegistrations(app).get(1, params)
      .catch((err) => {
        expect(parseInt(err.code)).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E043');
      });
  });

  it('Should return an array of registrations', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    return projectsRegistrations(app).find(params)
      .then((result) => {
        expect(result.length).to.equal(2);
        expect(parseInt(result[0].id)).to.equal(1);
      });
  });

  it('Should return an array of registrations filtered according the criteria', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1,
        registrationPointId: 2
      }
    };

    return projectsRegistrations(app).find(params)
      .then((result) => {
        expect(result.length).to.equal(1);
        expect(parseInt(result[0].id)).to.equal(2);
      })
      .catch((err) => {
        console.log(err);
      })
  });

  it('Should return an array of registrations grouped by registration point id', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        group: true
      }
    };

    const registrationModel = app.get('sequelize').models.registration;

    sandbox.stub(registrationModel, 'findAll')
      .returns(Promise.resolve([
        {
          "cost": "90",
          "amount": "30",
          "registrationPointId": "3",
        },
        {
          "cost": "70",
          "amount": "40",
          "registrationPointId": "2",
        },
        {
          "cost": "90",
          "amount": "60",
          "registrationPointId": "1",
        }
      ]));

    return projectsRegistrations(app).find(params)
      .then((result) => {
        expect(result.length).to.equal(3);
        expect(result[0].registrationPoint.id).to.equal(3);
      });
  });

  it('Should return 404 if project does not exist', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    queryStub.resolves(null);

    return projectsRegistrations(app).find(params)
      .catch((err) => {
        expect(parseInt(err.code)).to.equal(404);
        expect(err.message).to.equal('Project not found.');
        expect(err.data.errorCode).to.equal('E044');
      });
  });

  it('Should delete a relationship between project and registration', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    sandbox.stub(projectRegistrationModel, 'findOne')
      .returns(Promise.resolve({
        destroy: function () {
          return Promise.resolve("success")
        }
      }));

    return projectsRegistrations(app).remove(1, params)
      .then((result) => {
        expect(result).to.equal("success");
      });
  });

  it('Should return 404 if project_registration does not exist', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        customerId: 1
      }
    };

    sandbox.stub(projectRegistrationModel, 'findOne').resolves(null);

    return projectsRegistrations(app).remove(1, params)
      .catch((err) => {
        expect(parseInt(err.code)).to.equal(404);
        expect(err.message).to.equal('Project or registration not found.');
        expect(err.data.errorCode).to.equal('E045');
      });
  });

  it('Should not let do a request if no accessToken is provided', () => {
    const params = {
      provider: 'rest',
      headers: {},
      query: {}
    };

    return app.service('projects/:projectId/registrations').find(params)
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

    return app.service('projects/:projectId/registrations').find(params)
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
      query: {},
      route: { projectId: 1 }
    };

    return app.service('projects/:projectId/registrations').find(params)
      .then((result) => {
        expect(result.length).to.equal(2);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  it('Should return a project object with an array of registrations associated', () => {
    const params = {
      route: { projectId: 1 },
      query: {
        includeProject: true
      }
    };

    return projectsRegistrations(app).find(params)
      .then((result) => {
        expect(result.registrations.length).to.equal(2);
        expect(parseInt(result.registrations[0].id)).to.equal(1);
        expect(parseInt(result.registrations[1].id)).to.equal(2);
      });
  });
});
