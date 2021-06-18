'use strict';

const app = require('../../../../../src/app').default;
const checkSubscribedAccountsHaveSettings = require('../../../../../src/services/settings/hooks/check-subscribed-accounts-have-settings');
const util = require('../../../../../src/services/settings/util/util');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Settings Service - check-subscribed-accounts-have-settings hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const HOOK_TYPE_BEFORE = 'before';
  const HOOK_TYPE_AFTER = 'after';
  let settings, customerId, data, params, result, accounts;

  beforeEach(() => {
    customerId = '33883';
    settings = {
      unit: 'kg',
      currency: 'DKK',
      database: '',
      mandatory: [],
      lastUpload: null,
      bootstrapData: false,
      categoriesHidden: false,
      showDeactivatedAreas: false,
      languageBootstrapData: 'dk'
    };
    data = {
      settings,
      customerId
    };
    params = {
      sessionId: 'session',
      requestId: 'request',
      query: {
        customerId
      },
      provider: 'rest'
    };
    result = settings;
    accounts = [{ "id": 123, "name": "Hakuna matata" }, { "id": 456, "name": "Ugagagagaga" }];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an error when updating the settings returns an error', async () => {
    const mockHook = {
      app,
      result,
      params
    };
    sandbox.stub(sequelize.models.settings, 'update').returns(Promise.reject({ error: 'some err' }));

    try {
      await checkSubscribedAccountsHaveSettings.updateSettings(mockHook, []);
    } catch (err) {
      expect(err.message).to.equal('Could not update list of accounts with flag of whether they have settings set');
      expect(err.data.errorCode).to.equal('E185');
    }
  });

  it('should do nothing when the hook for BEFORE has no "accounts" property', async () => {
    const mockHook = {
      app,
      type: HOOK_TYPE_BEFORE,
      data,
      params
    };

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res).to.deep.equal(mockHook);
  });

  it('should do nothing when the hook for BEFORE has "accounts" property but is empty', async () => {
    data.settings.accounts = [];
    const mockHook = {
      app,
      type: HOOK_TYPE_BEFORE,
      data,
      params
    };

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res).to.deep.equal(mockHook);
  });

  it('should do nothing when the hook for AFTER has no "accounts" property', async () => {
    const mockHook = {
      app,
      type: HOOK_TYPE_AFTER,
      result,
      params
    };

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res).to.deep.equal(mockHook);
  });

  it('should do nothing when the hook for AFTER has "accounts" property but is empty', async () => {
    result.accounts = [];
    const mockHook = {
      app,
      type: HOOK_TYPE_AFTER,
      result,
      params
    };

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res).to.deep.equal(mockHook);
  });

  it('should throw an error when util function returns an error', async () => {
    data.settings.accounts = accounts;
    const mockHook = {
      app,
      type: HOOK_TYPE_BEFORE,
      data,
      params
    };
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.reject({
      message: 'Could not retrieve Settings or set flag for the subscribed accounts of the customer',
      data: { errorCode: 'E216' }
    }));

    try {
      await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    } catch (err) {
      expect(err.message).to.equal('Could not retrieve Settings or set flag for the subscribed accounts of the customer');
      expect(err.data.errorCode).to.equal('E216');
    }
  });

  it('should return a hook with updated "settingsAreSet" flags for BEFORE hook call', async () => {
    data.settings.accounts = accounts;
    const mockHook = {
      app,
      type: HOOK_TYPE_BEFORE,
      data,
      params
    };
    const subscribedAndCheckedAccounts = [
      { id: 123, name: 'Hakuna matata', settingsAreSet: false },
      { id: 456, name: 'Ugagagagaga', settingsAreSet: false }
    ];
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.resolve(subscribedAndCheckedAccounts));

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res).to.deep.equal(mockHook);
  });

  it('should return a hook with updated "settingsAreSet" flags for AFTER hook call when the existing list has no flags', async () => {
    result.accounts = accounts;
    const mockHook = {
      app,
      type: HOOK_TYPE_AFTER,
      result,
      params
    };
    const subscribedAndCheckedAccounts = [
      { id: 123, name: 'Hakuna matata', settingsAreSet: false },
      { id: 456, name: 'Ugagagagaga', settingsAreSet: false }
    ];
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.resolve(subscribedAndCheckedAccounts));
    const updateSettingsModelCallStub = sandbox.stub(sequelize.models.settings, 'update').returns(Promise.resolve({ good: 'stuff' }));

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res.result.accounts).to.deep.equal([
      { "id": 123, "name": "Hakuna matata", settingsAreSet: false },
      { "id": 456, "name": "Ugagagagaga", settingsAreSet: false }
    ]);
    // it's important to do the following check. This way we know the comparison of the objects was successful
    expect(updateSettingsModelCallStub.calledOnce).to.equal(true);
  });

  it('should return a hook with updated "settingsAreSet" flags for AFTER hook call when the existing and the constructed ' +
    'after the check lists of accounts are different', async () => {
    accounts[0].settingsAreSet = false;
    accounts[1].settingsAreSet = false;

    result.accounts = accounts;
    const mockHook = {
      app,
      type: HOOK_TYPE_AFTER,
      result,
      params
    };
    const subscribedAndCheckedAccounts = [
      { id: 123, name: 'Hakuna matata', settingsAreSet: true },
      { id: 456, name: 'Ugagagagaga', settingsAreSet: false }
    ];
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.resolve(subscribedAndCheckedAccounts));
    const updateSettingsModelCallStub = sandbox.stub(sequelize.models.settings, 'update').returns(Promise.resolve({ good: 'stuff' }));

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res.result.accounts).to.deep.equal([
      { "id": 123, "name": "Hakuna matata", settingsAreSet: true },
      { "id": 456, "name": "Ugagagagaga", settingsAreSet: false }
    ]);
    // it's important to do the following check. This way we know the comparison of the objects was successful
    expect(updateSettingsModelCallStub.calledOnce).to.equal(true);
  });

  it('should return a non-modified hook for AFTER hook call when the existing and the constructed after the check lists ' +
    'of accounts are the same', async () => {
    accounts[0].settingsAreSet = true;
    accounts[1].settingsAreSet = false;

    result.accounts = accounts;
    const mockHook = {
      app,
      type: HOOK_TYPE_AFTER,
      result,
      params
    };
    const subscribedAndCheckedAccounts = [
      { id: 123, name: 'Hakuna matata', settingsAreSet: true },
      { id: 456, name: 'Ugagagagaga', settingsAreSet: false }
    ];
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.resolve(subscribedAndCheckedAccounts));
    const updateSettingsModelCallStub = sandbox.stub(sequelize.models.settings, 'update').returns(Promise.resolve({ good: 'stuff' }));

    const res = await checkSubscribedAccountsHaveSettings.doCheckAndApplyChanges(mockHook);
    expect(res.result.accounts).to.deep.equal([
      { "id": 123, "name": "Hakuna matata", settingsAreSet: true },
      { "id": 456, "name": "Ugagagagaga", settingsAreSet: false }
    ]);
    // it's important to do the following check. This way we know the comparison of the objects was successful
    expect(updateSettingsModelCallStub.notCalled).to.equal(true);
  });

});
