'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../../../src/app').default;
const BootstrapService = require('../../../../src/services/bootstrap-tasks/bootstrap-task-service').default;
const sinon = require('sinon');

const longLiveAccessToken = app.get('testLongLivedAccessToken');

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Bootstrap Tasks Service', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  let templateStub;
  let bootstrapQueryStub;
  let bootstrapService;

  beforeEach(() => {
    bootstrapService = new BootstrapService();
    bootstrapService.setup(app, 'test-path');

    templateStub = sandbox.stub(sequelize.models.template, 'findOne');
    bootstrapQueryStub = sandbox.stub(sequelize, 'query');
    sandbox.stub(sequelize.models.registration_point, 'findAll').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return 404 if template not found', async () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    const data = {
      templateId: 99,
      customerId: 1,
      userId: 1
    };

    templateStub.resolves(null);

    try {
      await bootstrapService.create(data, params);
      assert('expected error to be thrown');
    } catch (error) {
      console.log(error);
      expect(error.code).to.equal(404);
    }
  });

  it('Should return 500 if database query fails', async () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    const data = {
      templateId: 1,
      customerId: 1,
      userId: 1
    };

    templateStub.resolves({ id: 1, templateAccountId: 2, name: 'template' });
    bootstrapQueryStub.rejects('whoops');

    try {
      await bootstrapService.create(data, params);
      assert('expected error to be thrown');
    } catch (error) {
      expect(error.code).to.equal(500);
    }
  });

  it('Should bootstrap data when no errors occur', async () => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {}
    };

    const data = {
      templateId: 99,
      customerId: 1,
      userId: 1
    };

    templateStub.resolves({ id: 1, templateAccountId: 2, name: 'template' });

    try {
      await bootstrapService.create(data, params);
    } catch (error) {
      assert('should not throw error');
    }
  });
});
