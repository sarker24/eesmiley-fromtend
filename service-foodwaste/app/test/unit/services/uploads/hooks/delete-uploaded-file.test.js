'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const fs = require('fs');

const deleteUploadedFile = require('../../../../../src/services/uploads/hooks/delete-uploaded-file').default;

describe('Uploads Service - delete-uploaded-file', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      type: 'success',
      params: {},
      data: {
        file: {
          path: 'some path'
        }
      },
      result: {
        fileId: 'some file ID'
      }
    }
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should log an error when deleting the physical uploaded file returns an error', () => {
    sandbox.stub(fs, 'unlink').yields(new Error('some error'));
    const errorStub = sandbox.stub(log, 'error');
    const infoStub = sandbox.stub(log, 'info');

    return deleteUploadedFile()(mockHook)
      .then(hook => {
        expect(hook).to.deep.equal(mockHook);

        expect(errorStub.calledOnce).to.equal(true);
        expect(infoStub.notCalled).to.equal(true);
      });
  });

  it('should log an info log when deleting the physical uploaded file is successful', () => {
    sandbox.stub(fs, 'unlink').yields(null, {});
    const errorStub = sandbox.stub(log, 'error');
    const infoStub = sandbox.stub(log, 'info');

    return deleteUploadedFile()(mockHook)
      .then(hook => {
        expect(hook).to.deep.equal(mockHook);

        expect(errorStub.notCalled).to.equal(true);
        expect(infoStub.calledOnce).to.equal(true);
      });
  });

  it('should take the filePath from the hook data object when the hook is an error', () => {
    sandbox.stub(fs, 'unlink').yields(null, {});
    const errorStub = sandbox.stub(log, 'error');
    const infoStub = sandbox.stub(log, 'info');

    mockHook.type = 'error';

    return deleteUploadedFile()(mockHook)
      .then(hook => {
        expect(hook).to.deep.equal(mockHook);

        expect(errorStub.notCalled).to.equal(true);
        expect(infoStub.calledOnce).to.equal(true);
      });
  });

});
