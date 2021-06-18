'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const projectRegistrationModel = app.get('sequelize').models.project_registration;
const associateRegistrationWithProjectHook = require('../../../../../src/services/registrations/hooks/associate-registration-with-projects');


describe('Registrations Service - associate-registration-with-projects hook', () => {
  const sandbox = sinon.createSandbox();

  const hookResult = {
    date: "2017-02-05",
    createdAt: "2017-07-17 13:42:11",
    updatedAt: "2017-07-17 13:42:11",
    manual: true,
    id: '37',
    amount: 2,
    cost: 20,
    currency: "DKK",
    customerId: 1,
    kgPerLiter: 1,
    registrationPointId: 3,
    unit: "kg",
    userId: 1,
    comment: null,
    scale: null
  };

  const DURATION_CALENDAR = 'CALENDAR';
  const DURATION_REGISTRATION_DAYS = 'REGISTRATION_DAYS';

  afterEach(() => {
    sandbox.restore();
  });

  it('should create an association between registration and projects', async () => {
    const mockHook = {
      type: 'after',
      method: 'create',
      params: {},
      data: {
        customerId: 123
      },
      app: app,
      result: hookResult
    };

    sandbox.stub(app.service('projects'), 'find').returns(Promise.resolve([
      {
        id: '2',
        duration: {
          type: DURATION_CALENDAR,
          start: 1485993600,
          end: 1486598400
        }
      },
      {
        id: '3',
        duration: {
          type: DURATION_REGISTRATION_DAYS,
          start: 1485993600,
          end: ''
        }
      },
      {
        id: '4',
        duration: {
          type: DURATION_CALENDAR,
          start: 1485993600,
          end: 1486166400
        }
      }
    ]));

    const spy = sandbox.stub(projectRegistrationModel, 'build')
      .returns({
        save: () => {
          return true;
        }
      });

    sandbox.stub(app.service('registration-points'), 'get').returns(Promise.resolve([
      {id: 37}
    ]));

    await associateRegistrationWithProjectHook.default()(mockHook);
    expect(spy.args.length).to.equal(2); // only the first 2 projects should have regs associations created for them
    expect(spy.args[0][0].project_id).to.equal('2');
    expect(spy.args[0][0].registration_id).to.equal('37');
    expect(spy.args[1][0].project_id).to.equal('3');
    expect(spy.args[1][0].registration_id).to.equal('37');
  });

  it('should not crash when an error happens while storing the relationship', () => {
    const mockHook = {
      type: 'after',
      method: 'create',
      params: {},
      data: {
        customerId: 123
      },
      app: app,
      result: hookResult
    };


    sandbox.stub(app.service('registration-points'), 'get').returns(Promise.resolve([
      {id: 37}
    ]));

    sandbox.stub(app.service('projects'), 'find').returns(Promise.reject(null));
    const errorLog = sandbox.stub(log, 'error');


    return associateRegistrationWithProjectHook.default()(mockHook)
      .then(() => {
        expect(errorLog.calledOnce).to.equal(true);
      });
  });

});
