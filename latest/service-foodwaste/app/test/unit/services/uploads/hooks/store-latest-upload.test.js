'use strict';

const app = require('../../../../../src/app').default;
const storeLatestUpload = require('../../../../../src/services/uploads/hooks/store-latest-upload').default;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Uploads Service - store-latest-upload', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should store the latest upload in settings', () => {
    const findSettingsStub = sandbox.stub(app.service('settings'), 'find')
      .returns(Promise.resolve({ settings: 'some settings' }));
    const createSettingsStub = sandbox.stub(app.service('settings'), 'create')
      .returns(Promise.resolve({ settings: 'some settings' }));

    const mockHook = {
      app,
      params: {},
      data: {
        customerId: 1,
      }
    };

    return storeLatestUpload()(mockHook)
      .then(hook => {
        expect(hook.data.customerId).to.equal(1);

        expect(findSettingsStub.calledOnce).to.equal(true);
        expect(createSettingsStub.calledOnce).to.equal(true);
      });
  });

  it('should return an error when settings for customer were not found', () => {
    const findSettingsStub = sandbox.stub(app.service('settings'), 'find')
      .returns(Promise.reject({ err: 'some error' }));
    const createSettingsStub = sandbox.stub(app.service('settings'), 'create')
      .returns(Promise.resolve({ settings: 'some settings' }));

    const mockHook = {
      app,
      params: {},
      data: {
        customerId: 1,
      }
    };

    return storeLatestUpload()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not store timestamp for last ingredients file upload in settings.');
        expect(err.data.errorCode).to.equal('E127');
        expect(err.errors).to.deep.equal({ err: 'some error' });

        expect(findSettingsStub.calledOnce).to.equal(true);
        expect(createSettingsStub.notCalled).to.equal(true);
      });
  });

  it('should return an error when storing the settings returns an error', () => {
    const findSettingsStub = sandbox.stub(app.service('settings'), 'find')
      .returns(Promise.resolve({ settings: 'some settings' }));
    const createSettingsStub = sandbox.stub(app.service('settings'), 'create')
      .returns(Promise.reject({ err: 'some error' }));

    const mockHook = {
      app,
      params: {},
      data: {
        customerId: 1,
      }
    };

    return storeLatestUpload()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not store timestamp for last ingredients file upload in settings.');
        expect(err.data.errorCode).to.equal('E127');
        expect(err.errors).to.deep.equal({ err: 'some error' });

        expect(findSettingsStub.calledOnce).to.equal(true);
        expect(createSettingsStub.calledOnce).to.equal(true);
      });
  });

});
