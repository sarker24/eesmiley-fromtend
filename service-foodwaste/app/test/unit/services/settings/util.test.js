'use strict';

const app = require('../../../../src/app').default;
const util = require('../../../../src/services/settings/util/util');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Settings Service - util', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let settingsPerAccount, mockHook, subscribedAccounts, subscribedAndCheckedAccounts;

  beforeEach(() => {
    mockHook = { app, params: { requestId: 'request', sessionId: 'session', query: { customerId: '123546' } } };
    subscribedAccounts = [
      { id: 123, name: 'Hakuna matata' },
      { id: 456, name: 'Ugagagagaga' }
    ];
    subscribedAndCheckedAccounts = [
      { id: 123, name: 'Hakuna matata', settingsAreSet: false },
      { id: 456, name: 'Ugagagagaga', settingsAreSet: false }
    ];
    settingsPerAccount = [
      {
        customerId: 123,
        current: {
          registrationsFrequency: {
            '0': [1, 2, 3, 4, 5]
          },
          expectedWeeklyWaste: {
            '0': 456000
          }
        }
      },
      {
        customerId: 456,
        current: {
          registrationsFrequency: {
            '0': [6, 0]
          },
          expectedWeeklyWaste: {
            '0': 123000
          }
        }
      }
    ]
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an error when retrieving settings returns an error', async () => {
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.reject({ error: 'some err' }));

    try {
      await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    } catch (err) {
      expect(err.message, mockHook.params).to.equal('Could not retrieve Settings or set flag for the subscribed accounts of the customer');
      expect(err.data.errorCode, mockHook.params).to.equal('E216');
    }
  });

  it('should return an array with "false" flag for each account when no settings are found for any account', async () => {
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([]));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "false" flag for each account when none has proper settings set', async () => {
    settingsPerAccount[0].current = {};
    settingsPerAccount[1].current = {};
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "false" flag for each account when they do not have frequency set', async () => {
    delete settingsPerAccount[0].current.registrationsFrequency;
    delete settingsPerAccount[1].current.registrationsFrequency;
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "false" flag for each account when they do not have weekly waste set', async () => {
    delete settingsPerAccount[0].current.expectedWeeklyWaste;
    delete settingsPerAccount[1].current.expectedWeeklyWaste;
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "false" flag for each account when they have frequency set as empty object', async () => {
    settingsPerAccount[0].current.registrationsFrequency = {};
    settingsPerAccount[1].current.registrationsFrequency = {};
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "false" flag for each account when they have weekly waste set as empty object', async () => {
    settingsPerAccount[0].current.expectedWeeklyWaste = {};
    settingsPerAccount[1].current.expectedWeeklyWaste = {};
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

  it('should return an array with "true" flag for each account when they have all settings properly set', async () => {
    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    subscribedAndCheckedAccounts[0].settingsAreSet = true;
    subscribedAndCheckedAccounts[1].settingsAreSet = true;

    const res = await util.checkAndSetAccountsHaveSettings(subscribedAccounts, sequelize, mockHook.params);
    expect(res).to.deep.equal(subscribedAndCheckedAccounts);
  });

});
