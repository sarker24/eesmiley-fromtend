'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const associateWithExistingRegistrations = require('../../../../../src/services/projects/hooks/associate-with-existing-registrations');
const expect = chai.expect;
const assert = chai.assert;

describe('Projects Service - associate-with-existing-registrations hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let project;
  let projectRegistrations;

  beforeEach(() => {
    // stub get registration points db call
    sandbox.stub(sequelize, 'query')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    project = {
      "id": "18",
      "duration": {
        "end": 1535587200,
        "type": "CALENDAR",
        "start": 1532995200
      },
      "registrationPoints": [
        {
          "id": 6,
          "name": "productA"
        }
      ],
      "actions": [],
      "customerId": "123456789",
    };

    projectRegistrations = {
      "id": "18",
      "duration": {
        "days": 12,
        "type": "REGISTRATIONS",
        "start": 1532995200
      },
      "registrationPoints": [
        {
          "id": 6,
          "name": "productA"
        }
      ],
      "actions": [],
      "customerId": "123456789",
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should associate registrations with a project', () => {

    const spy = sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.associateRegistrationWithinPeriod(project, sequelize)
      .then(() => {
        expect(spy.args[0][0].length).to.equal(3);
        expect(spy.args[0][0][0].project_id).to.equal('18');
        expect(spy.args[0][0][1].project_id).to.equal('18');
        expect(spy.args[0][0][2].project_id).to.equal('18');
        expect(spy.args[0][0][0].registration_id).to.equal('1');
        expect(spy.args[0][0][1].registration_id).to.equal('2');
        expect(spy.args[0][0][2].registration_id).to.equal('3');
      });
  });

  it('Should throw error when registrations could not be retrieved due to a database error', () => {

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.reject({ error: 'bad stuff' }));

    return associateWithExistingRegistrations.associateRegistrationWithinPeriod(project, sequelize)
      .catch(result => {
        expect(result.data.errorCode).to.equal('E181');
      });
  });

  it('Should throw error when association project_registration could not be created due to database error', () => {

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    return associateWithExistingRegistrations.associateRegistrationWithinPeriod(project, sequelize)
      .catch((result) => {
        expect(result.data.errorCode).to.equal('E181');
      });
  });

  it('Should associate registrations with a project', () => {

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1', date: '2018-09-09' },
        { id: '2', date: '2018-09-10' },
        { id: '3', date: '2018-09-11' }
      ]));

    const spy = sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.associateRegistrationWithinDays(
      projectRegistrations, sequelize)
      .then(() => {
        expect(spy.args[0][0].length).to.equal(3);
        expect(spy.args[0][0][0].project_id).to.equal('18');
        expect(spy.args[0][0][1].project_id).to.equal('18');
        expect(spy.args[0][0][2].project_id).to.equal('18');
        expect(spy.args[0][0][0].registration_id).to.equal('1');
        expect(spy.args[0][0][1].registration_id).to.equal('2');
        expect(spy.args[0][0][2].registration_id).to.equal('3');
      });
  });

  it('Should skip associating when given a project with REGISTRATION type and no registrations exist yet', async () => {

    sandbox.stub(sequelize.models.registration, 'findAll').onFirstCall().resolves([]);

    try {
      await associateWithExistingRegistrations.associateRegistrationWithinDays(projectRegistrations, sequelize);
    } catch(err) {
      assert.fail('should not throw exception', err);
    }
  });

  it('Should throw error E195 when registrations could not be retrieved due to a database error', async () => {

    sandbox.stub(sequelize.models.registration, 'findAll').onFirstCall().rejects({ error: 'bad stuff' });

    try {
      await associateWithExistingRegistrations.associateRegistrationWithinDays(projectRegistrations, sequelize);
      assert.fail('expected error to be thrown');
    } catch(result) {
        expect(result.data.errorCode).to.equal('E195');
      }
  });

  it('Should throw error E196 when registrations could not be retrieved due to a database error', async () => {

    const regStub = sandbox.stub(sequelize.models.registration, 'findAll');
    regStub.onFirstCall().resolves([{id: 1}]);
    regStub.onSecondCall().rejects({err: 'moms spaghetti'});

    try {
      await associateWithExistingRegistrations.associateRegistrationWithinDays(projectRegistrations, sequelize);
      assert.fail('expected error to be thrown');
    } catch(result) {
        expect(result.data.errorCode).to.equal('E196');
      }
  });

  it('Should throw error when association project_registration could not be created due to database error', () => {

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    const spy = sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.reject({
        thumbs: 'down'
      }));

    return associateWithExistingRegistrations.associateRegistrationWithinDays(project, sequelize)
      .catch((result) => {
        expect(result.data.errorCode).to.equal('E181');
      });
  });

  it('Should recreate associations between registrations and an edited project', () => {
    sandbox.stub(sequelize.models.project_registration, 'destroy')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.recreateAssociationsWithRegistrations(project, sequelize)
      .then((result) => {
        expect(result).to.deep.equal(project);
      });
  });

  it('Should return error if deletion of existing relationships fails', () => {
    sandbox.stub(sequelize.models.project_registration, 'destroy')
      .returns(Promise.reject({
        thumbs: 'down'
      }));


    return associateWithExistingRegistrations.recreateAssociationsWithRegistrations(project, sequelize)
      .catch((result) => {
        expect(result.data.errorCode).to.equal('E182');
      });
  });

  it('Should call function to create association for new project', () => {
    const mockHook = {
      app,
      params: {},
      result: project,
      method: 'create'
    };

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));


    return associateWithExistingRegistrations.default()(mockHook)
      .then((result) => {
        expect(result).to.deep.equal(mockHook);
      });
  });

  it('Should call function to create association for edited project', () => {
    const mockHook = {
      app,
      params: {},
      result: project,
      method: 'patch',
      project: {
        "duration": {
          "end": 1535587400,
          "type": "CALENDAR",
          "start": 1532995400
        },
        "registrationPoints": []
      }
    };

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]));

    sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    sandbox.stub(sequelize.models.project_registration, 'destroy')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.default()(mockHook)
      .then((result) => {
        expect(result).to.deep.equal(mockHook);
      });
  });

  it('Should call function to create association for edited project with change in registration points', () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": "18",
        "duration": {
          "days": 12,
          "type": "REGISTRATIONS",
          "start": 1532995200
        },
        "registrationPoints": [

        ],
        "actions": [],
        "customerId": "123456789",
      },
      method: 'patch',
      project: projectRegistrations
    };

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1', date: '2018-09-09' },
        { id: '2', date: '2018-09-10' },
        { id: '3', date: '2018-09-11' }
      ]));

    const spy = sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    sandbox.stub(sequelize.models.project_registration, 'destroy')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.default()(mockHook)
      .then((result) => {
        expect(result).to.deep.equal(mockHook);
        expect(spy.args[0][0].length).to.equal(3);
        expect(spy.args[0][0][0].project_id).to.equal('18');
        expect(spy.args[0][0][1].project_id).to.equal('18');
        expect(spy.args[0][0][2].project_id).to.equal('18');
        expect(spy.args[0][0][0].registration_id).to.equal('1');
        expect(spy.args[0][0][1].registration_id).to.equal('2');
        expect(spy.args[0][0][2].registration_id).to.equal('3');
      });
  });

  it('Should call function to create association for edited project with change in duration (TYPE REGISTRATIONS)', () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": "18",
        "duration": {
          "days": 15,
          "type": "REGISTRATIONS",
          "start": 1532995200
        },
        "registrationPoints": [
          {
            "id": 6,
            "name": "productA"
          }
        ],
        "actions": [],
        "customerId": "123456789",
      },
      method: 'patch',
      project: projectRegistrations
    };

    sandbox.stub(sequelize.models.registration, 'findAll')
      .returns(Promise.resolve([
        { id: '1', date: '2018-09-09' },
        { id: '2', date: '2018-09-10' },
        { id: '3', date: '2018-09-11' }
      ]));

    const spy = sandbox.stub(sequelize.models.project_registration, 'bulkCreate')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    sandbox.stub(sequelize.models.project_registration, 'destroy')
      .returns(Promise.resolve({
        thumbs: 'up'
      }));

    return associateWithExistingRegistrations.default()(mockHook)
      .then((result) => {
        expect(result).to.deep.equal(mockHook);
        expect(spy.args[0][0].length).to.equal(3);
        expect(spy.args[0][0][0].project_id).to.equal('18');
        expect(spy.args[0][0][1].project_id).to.equal('18');
        expect(spy.args[0][0][2].project_id).to.equal('18');
        expect(spy.args[0][0][0].registration_id).to.equal('1');
        expect(spy.args[0][0][1].registration_id).to.equal('2');
        expect(spy.args[0][0][2].registration_id).to.equal('3');
      });
  });

  it('Should throw correct error when recreating association fails', async () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": "18",
        "duration": {
          "days": 365,
          "type": "REGISTRATIONS",
          "start": 1532995200
        },
        "registrationPoints": [
          {
            "id": 9
          }
        ],
        "actions": [],
        "customerId": "123456789",
      },
      method: 'patch',
      project: projectRegistrations
    };

    sandbox.stub(sequelize.models.project_registration, 'destroy').rejects({err: 'whoooopsieeee'});

    try {
      await associateWithExistingRegistrations.default()(mockHook);
      assert.fail('expected error to be thrown');
    } catch (err) {
      expect(err.data.errorCode).to.equal('E183');
    }

  });

  it('Should skip associating when given a CREATE request and project type of REGISTRATIONS without a start date', async () => {
    const mockHook = {
      app,
      params: {},
      result: {
        "id": "18",
        "duration": {
          "days": 365,
          "type": "REGISTRATIONS"
        },
        "registrationPoints": [
          {
            "id": 9
          }
        ],
        "actions": [],
        "customerId": "123456789",
      },
      method: 'create',
      project: projectRegistrations
    };

    try {
      await associateWithExistingRegistrations.default()(mockHook);
    } catch (err) {
      assert.fail('should not throw exception', err);
    }
  });

  it('Should skip associating when given a PATCH request and duration or registration points have not changed', async () => {
    const mockHook = {
      app,
      params: {},
      result: projectRegistrations,
      method: 'patch',
      project: projectRegistrations
    };

    try {
      await associateWithExistingRegistrations.default()(mockHook);
    } catch (err) {
      assert.fail('should not throw exception', err);
    }
  });
});
