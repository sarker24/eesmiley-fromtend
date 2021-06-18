'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const addUniqueViolationErrorMsg = require('../../../../../src/services/sales/hooks/add-unique-violation-error-message').default;

describe('Sales Service - add-unique-violation-error-message', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      params: {},
      error: {
        message: 'some message',
        errorCode: 'E666',
        errors: [{ type: 'unique violation' }]
      }
    }
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should log an info log and change the error msg when the incoming error satisfies the conditions', () => {
    const infoStub = sandbox.stub(log, 'info');

    return addUniqueViolationErrorMsg()(mockHook)
      .then(hook => {
        expect(hook.error.errorCode).to.equal('E087');
        expect(hook.error.message).to.equal('unique violation');

        expect(infoStub.calledOnce).to.equal(true);
      });
  });

  it('should not log an info log and not change the error msg when there is no incoming "errors" property', () => {
    const infoStub = sandbox.stub(log, 'info');
    delete mockHook.error.errors;

    return addUniqueViolationErrorMsg()(mockHook)
      .then(hook => {
        expect(hook.error.errorCode).to.equal('E666');
        expect(hook.error.message).to.equal('some message');

        expect(infoStub.notCalled).to.equal(true);
      });
  });

  it('should not log an info log and not change the error msg when "errors" property is an empty object', () => {
    const infoStub = sandbox.stub(log, 'info');
    mockHook.error.errors = {};

    return addUniqueViolationErrorMsg()(mockHook)
      .then(hook => {
        expect(hook.error.errorCode).to.equal('E666');
        expect(hook.error.message).to.equal('some message');

        expect(infoStub.notCalled).to.equal(true);
      });
  });

  it('should not log an info log and not change the error msg when errors type is not "unique violation"', () => {
    const infoStub = sandbox.stub(log, 'info');
    mockHook.error.errors[0].type = 'something else';

    return addUniqueViolationErrorMsg()(mockHook)
      .then(hook => {
        expect(hook.error.errorCode).to.equal('E666');
        expect(hook.error.message).to.equal('some message');

        expect(infoStub.notCalled).to.equal(true);
      });
  });

});
