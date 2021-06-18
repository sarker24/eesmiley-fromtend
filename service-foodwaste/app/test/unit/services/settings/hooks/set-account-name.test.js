'use strict';

const app = require('../../../../../src/app').default;
const setAccountName = require('../../../../../src/services/settings/hooks/set-account-name');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const commons = require('feathers-commons-esmiley');

describe('Settings Service - set-account-name hook', () => {
  const sandbox = sinon.createSandbox();
  const HOOK_TYPE_CREATE = 'create';
  const HOOK_TYPE_FIND = 'find';
  let currentSettings, settings, customerId, data, params, result;
  let legacyHttpCallStub, legacyResponse;

  beforeEach(() => {
    legacyHttpCallStub = sandbox.stub(commons, 'makeHttpRequest');
    legacyResponse = {
      current: { dealId: '1', company: 'Customer 1' },
      children: [
        { dealId: '123', company: 'Company A' },
        { dealId: '456', company: 'Company B' }
      ]
    };

    customerId = '33883';
    currentSettings = {
      unit: 'kg',
      currency: 'DKK',
      database: '',
      languageBootstrapData: 'dk'
    };
    settings = {
      id: 123,
      customerId,
      userId: customerId,
      current: currentSettings
    };
    data = {
      settings: currentSettings,
      customerId
    };
    params = {
      sessionId: 'session',
      requestId: 'request',
      query: {
        customerId
      },
      headers: 'asdf',
      provider: 'rest'
    };
    result = [settings];
  });

  afterEach(() => {
    sandbox.restore();
  });

  /*
   * =================================================================================
   * updateSettings()
   */
  describe('updateSettings()', () => {

    it('should throw an error when updating the settings returns an error', async () => {
      const mockHook = {
        app,
        result,
        params
      };
      sandbox.stub(app.service('settings'), 'patch').returns(Promise.reject({ error: 'some err' }));

      try {
        await setAccountName.updateSettings(mockHook, 'Some company');
      } catch (err) {
        expect(err.message).to.equal('Could not set a name in the settings of an account');
        expect(err.data.errorCode).to.equal('E218');
        expect(err.errors).to.deep.equal({ error: 'some err' });
      }
    });

  });

  /*
   * =================================================================================
   * setNameAtGetSettings()
   */
  describe('setNameAtGetSettings()', () => {

    it('should do nothing when the result at FIND already has name', async () => {
      currentSettings.name = 'Some company';

      const mockHook = {
        app,
        type: HOOK_TYPE_FIND,
        result,
        params
      };

      const res = await setAccountName.setNameAtGetSettings(mockHook);
      expect(res).to.deep.equal(mockHook);
      expect(legacyHttpCallStub.notCalled).to.equal(true);
    });

    it('should do nothing when the account has no settings (result is an empty array)', async () => {
      const mockHook = {
        app,
        type: HOOK_TYPE_FIND,
        result: [],
        params
      };

      const res = await setAccountName.setNameAtGetSettings(mockHook);
      expect(res).to.deep.equal(mockHook);
      expect(legacyHttpCallStub.notCalled).to.equal(true);
    });

    it('should throw an error when the call to Legacy returns an error', async () => {
      legacyHttpCallStub.returns(Promise.reject({ error: 'some err' }));

      const mockHook = {
        app,
        type: HOOK_TYPE_FIND,
        result,
        params
      };

      try {
        await setAccountName.setNameAtGetSettings(mockHook);
      } catch (err) {
        expect(legacyHttpCallStub.calledOnce).to.equal(true);
        expect(err.message).to.equal('Could not set a name in the settings of an account when retrieving settings');
        expect(err.data.errorCode).to.equal('E220');
        expect(err.errors).to.deep.equal({ error: 'some err' });
      }
    });

    it('should set a name in the settings when the result at FIND does not have a name', async () => {
      sandbox.stub(app.service('settings'), 'patch').returns(Promise.resolve({})); // not important what is returned
      legacyHttpCallStub.returns(Promise.resolve(legacyResponse));

      const mockHook = {
        app,
        type: HOOK_TYPE_FIND,
        result,
        params
      };

      const res = await setAccountName.setNameAtGetSettings(mockHook);

      expect(res.result[0].current).to.deep.equal({
        unit: 'kg',
        currency: 'DKK',
        database: '',
        languageBootstrapData: 'dk',
        name: 'Customer 1'
      });
      expect(legacyHttpCallStub.calledOnce).to.equal(true);
    });

    it('should set a name in the settings when the result at FIND has a name but it is an empty string', async () => {
      sandbox.stub(app.service('settings'), 'patch').returns(Promise.resolve({})); // not important what is returned
      legacyHttpCallStub.returns(Promise.resolve(legacyResponse));
      currentSettings.name = '';

      const mockHook = {
        app,
        type: HOOK_TYPE_FIND,
        result,
        params
      };

      const res = await setAccountName.setNameAtGetSettings(mockHook);

      expect(res.result[0].current).to.deep.equal({
        unit: 'kg',
        currency: 'DKK',
        database: '',
        languageBootstrapData: 'dk',
        name: 'Customer 1'
      });
      expect(legacyHttpCallStub.calledOnce).to.equal(true);
    });

  });

  /*
   * =================================================================================
   * setNameAtCreateSettings()
   */
  describe('setNameAtCreateSettings()', () => {

    it('should do nothing when the result at CREATE already has name', async () => {
      currentSettings.name = 'Some company';

      const mockHook = {
        app,
        type: HOOK_TYPE_CREATE,
        data,
        params
      };

      const res = await setAccountName.setNameAtCreateSettings(mockHook);
      expect(res).to.deep.equal(mockHook);
      expect(legacyHttpCallStub.notCalled).to.equal(true);
    });

    it('should throw an error when the call to Legacy returns an error', async () => {
      legacyHttpCallStub.returns(Promise.reject({ error: 'some err' }));

      const mockHook = {
        app,
        type: HOOK_TYPE_CREATE,
        data,
        params
      };

      try {
        await setAccountName.setNameAtCreateSettings(mockHook);
      } catch (err) {
        expect(legacyHttpCallStub.calledOnce).to.equal(true);
        expect(err.message).to.equal('Could not set a name in the settings of an account when creating settings');
        expect(err.data.errorCode).to.equal('E219');
        expect(err.errors).to.deep.equal({ error: 'some err' });
      }
    });

    it('should set a name in the settings when the input data at CREATE does not have a name', async () => {
      legacyHttpCallStub.returns(Promise.resolve(legacyResponse));

      const mockHook = {
        app,
        type: HOOK_TYPE_CREATE,
        data,
        params
      };

      const res = await setAccountName.setNameAtCreateSettings(mockHook);

      expect(res.data.settings).to.deep.equal({
        unit: 'kg',
        currency: 'DKK',
        database: '',
        languageBootstrapData: 'dk',
        name: 'Customer 1'
      });
      expect(legacyHttpCallStub.calledOnce).to.equal(true);
    });

    it('should set a name in the settings when the input data at CREATE has a name but it is an empty string', async () => {
      legacyHttpCallStub.returns(Promise.resolve(legacyResponse));
      currentSettings.name = '';

      const mockHook = {
        app,
        type: HOOK_TYPE_CREATE,
        data,
        params
      };

      const res = await setAccountName.setNameAtCreateSettings(mockHook);

      expect(res.data.settings).to.deep.equal({
        unit: 'kg',
        currency: 'DKK',
        database: '',
        languageBootstrapData: 'dk',
        name: 'Customer 1'
      });
      expect(legacyHttpCallStub.calledOnce).to.equal(true);
    });

  });

  /*
   * =================================================================================
   * default hook function
   */
  describe('default hook function', () => {

    it('should do nothing when the call is internal (no "provider" param is present)', async () => {
      delete params.provider;

      const mockHook = {
        app,
        type: HOOK_TYPE_CREATE,
        data,
        params
      };

      const res = await setAccountName.default()(mockHook);
      expect(res).to.deep.equal(mockHook);
      expect(legacyHttpCallStub.notCalled).to.equal(true);
    });

  });


});
