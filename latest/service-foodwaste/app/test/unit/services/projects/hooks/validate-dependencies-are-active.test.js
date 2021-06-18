'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const validateDependenciesAreActiveTest = require('../../../../../src/services/projects/hooks/validate-dependencies-are-active').default;

describe('projects service - validate-dependencies-are-active', () => {
  describe('hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let mockHook = {};

  beforeEach(() => {
    mockHook = {
      app,
      method: 'create',
      params: {},
      data: {
        "registrationPoints": [
          {
            "id": 1
          },
          {
            "id": 2
          }
        ]
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should prevent creating a Project when one of its Registration point does not exist', () => {

    const stub = sandbox.stub(sequelize.models.registration_point, 'findAll');
    stub.onFirstCall().returns(Promise.resolve([
      { id: 1, active: true }
    ]));

    return validateDependenciesAreActiveTest()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Cannot create Project with non-existent Registration Points');
        expect(err.data.registrationPointIds).to.deep.equal([2]);
        expect(err.data.errorCode).to.equal('E263');
      });
  });

  it('Should prevent creating a Project when one of its Registration point is inactive', () => {

    const stub = sandbox.stub(sequelize.models.registration_point, 'findAll');
    stub.onFirstCall().returns(Promise.resolve([
      { id: 1, active: false },
      { id: 2, active: true }
    ]));


    return validateDependenciesAreActiveTest()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Cannot create Project with inactive Registration Points');
        expect(err.data.registrationPointIds).to.deep.equal([1]);
        expect(err.data.errorCode).to.equal('E264');
      });
  });

  it('Should prevent creating a Project when one of its Registration point has inactive ancestor', () => {

    const stub = sandbox.stub(sequelize.models.registration_point, 'findAll');
    stub.onFirstCall().returns(Promise.resolve([
      { id: 1, active: true },
      { id: 2, active: true }
    ]));

    stub.onSecondCall().returns(Promise.resolve([
      { id: 10, active: false },
    ]));

    return validateDependenciesAreActiveTest()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Cannot create Project with inactive ancestor Registration Points');
        expect(err.data.registrationPointIds).to.deep.equal([10]);
        expect(err.data.errorCode).to.equal('E175');
      });
  });

  it('Should prevent patching a Project when one of its Registration point is inactive', () => {
    mockHook.method = 'patch';

    const stub = sandbox.stub(sequelize.models.registration_point, 'findAll');
    stub.onFirstCall().returns(Promise.resolve([
      { id: 1, active: true },
      { id: 2, active: false }
    ]));

    return validateDependenciesAreActiveTest()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Cannot patch Project with inactive Registration Points');
        expect(err.data.registrationPointIds).to.deep.equal([2]);
        expect(err.data.errorCode).to.equal('E264');
      });
  });

  it('Should return the same hook when all of the Project dependencies are active', () => {
    mockHook.method = 'patch';

    const stub = sandbox.stub(sequelize.models.registration_point, 'findAll');
    stub.onFirstCall()
      .returns(Promise.resolve([
        { id: 1, active: true },
        { id: 2, active: true }
      ]));

    stub.onSecondCall().returns(Promise.resolve([]));

    return validateDependenciesAreActiveTest()(mockHook)
      .then(hook => {
        expect(hook.data.registrationPoints).to.deep.equal(mockHook.data.registrationPoints);
      });
  });

  it('Should prevent creating/patching a Project when an error occurs during retrieving Registration point', () => {

    sandbox.stub(sequelize.models.registration_point, 'findAll')
      .returns(Promise.reject({ err: 'Some error' }));

    return validateDependenciesAreActiveTest()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not get Registration Points for the given Project');
        expect(err.data.errorCode).to.equal('E173');
        expect(err.data.registrationPointIds).to.deep.equal([1, 2]);
      });
  });
  });
});
