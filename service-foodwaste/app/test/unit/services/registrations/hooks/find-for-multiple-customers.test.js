'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');
const findForMultipleCustomers = require('../../../../../src/services/registrations/hooks/find-for-multiple-customers').default;


describe('Registrations Service - find-for-multiple-customers', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      app: app,
      service: app.service('registrations'),
      params: {
        query: {
          startDate: '2018-03-30',
          endDate: '2018-04-30',
          customerId: '1,2'
        }
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return a list of registrations when the input and the querying is fine', async () => {
    const stub = sandbox.stub(sequelize.models.registration, 'findAll').resolves([{ id: 1 }, { id: 2 }]);

    const hook = await findForMultipleCustomers()(mockHook);

    expect(hook.result).to.deep.equal([{ id: 1 }, { id: 2 }]);
    expect(stub.args[0][0].where['customerId']).to.deep.equal({ $in: [1, 2] });
  });

  it('should return an error when the querying returns an error', async () => {
    sandbox.stub(sequelize.models.registration, 'findAll').rejects({ err: 'some error' });

    try {
      await findForMultipleCustomers()(mockHook);
      assert.fail('expected error to be thrown');
    } catch(err) {
        expect(err.message).to.equal('Could not get registrations for multiple customers.');
        expect(err.data.errorCode).to.equal('E047');
      }
  });

  it('should return all registrations with registration points when user is admin and excludeTestAccount flag isnt set', async () => {
    delete mockHook.params.query.customerId;
    mockHook.params.accessTokenPayload = { isAdmin: true };

    const stub =sandbox.stub(sequelize.models.registration, 'findAll').resolves([{ id: 1 }, { id: 2 }]);

    const hook = await findForMultipleCustomers()(mockHook);

    expect(hook.result).to.deep.equal([{ id: 1 }, { id: 2 }]);
    expect(hook.params.hasOwnProperty('skipGetAsRichObjectHook')).to.equal(false);
    expect(stub.args[0][0].hasOwnProperty('include')).to.equal(true);
  });

  it('should filter out test registrations and registration points when user is admin and excludeTestAccount flag is set', async () => {
    mockHook.params.query.excludeTestAccounts = 'true';
    delete mockHook.params.query.customerId;
    mockHook.params.accessTokenPayload = { isAdmin: true };

    const stub = sandbox.stub(sequelize.models.registration, 'findAll').callsFake(({where}) => {
      const result = where.customerId['$notIn'].length > 0 ? [{ id: 2 }] : [[{ id: 1 }, { id: 2 }]];
      return Promise.resolve(result);
    });

    const hook = await findForMultipleCustomers()(mockHook);

    expect(hook.result).to.deep.equal([{ id: 2 }]);
    expect(hook.params.hasOwnProperty('skipGetAsRichObjectHook')).to.equal(true);
    expect(hook.params.skipGetAsRichObjectHook).to.equal(true);

    expect(stub.args[0][0].hasOwnProperty('include')).to.equal(false);
  });

  it('should query correct customerIds when input is in query format', async () => {
    mockHook.params.query.customerId = { $in: [1,2] };

    const stub = sandbox.stub(sequelize.models.registration, 'findAll').resolves({ hello: 'world' });

    const hook = await findForMultipleCustomers()(mockHook);

    expect(hook.result).to.deep.equal({ hello: 'world' });
    expect(stub.args[0][0].where['customerId']).to.deep.equal({ $in: [1, 2]});
  });

  it('should not filter out fields when reportFormat parameter is not present', async () => {
    const stub = sandbox.stub(sequelize.models.registration, 'findAll').resolves({});
    await findForMultipleCustomers()(mockHook);

    const registrationOptions = stub.args[0][0];
    const registrationPointOptions = stub.args[0][0].include[0];

    expect(registrationOptions.attributes).to.deep.equal({ exclude: ['registrationPointId']});
    expect(registrationPointOptions.hasOwnProperty('attributes')).to.equal(false);
  });

  it('should filter out fields when reportFormat parameter is present', async () => {
    mockHook.params.query.reportFormat = 'true';
    const expectedRegistrationAttributes =  ['id', 'customerId', 'date'];
    const expectedRegistrationPointAttributes = ['id', 'parentId', 'path', 'name', 'label'];

    const stub = sandbox.stub(sequelize.models.registration, 'findAll').resolves({});
    await findForMultipleCustomers()(mockHook);

    const registrationAttributes = stub.args[0][0].attributes;
    const registrationPointAttributes = stub.args[0][0].include[0].attributes;
    expect(registrationAttributes.length).to.equal(expectedRegistrationAttributes.length);
    expect(registrationAttributes.every(attr => expectedRegistrationAttributes.includes(attr))).to.equal(true);
    expect(registrationPointAttributes.length).to.equal(expectedRegistrationPointAttributes.length);
    expect(registrationPointAttributes.every(attr => expectedRegistrationPointAttributes.includes(attr))).to.equal(true);
  });
});
