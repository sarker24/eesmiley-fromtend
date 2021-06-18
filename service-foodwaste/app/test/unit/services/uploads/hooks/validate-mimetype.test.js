'use strict';

const app = require('../../../../../src/app').default;
const validateMimetype = require('../../../../../src/services/uploads/hooks/validate-mimetype').default;
const expect = require('chai').expect;

describe('Uploads Service - validate-mimetype', () => {

  it('Should reject if mimetype is not allowed', () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app,
      data: {
        "file": {
          "fieldname": "file",
          "originalname": "900kb.jpg",
          "encoding": "7bit",
          "mimetype": "image/jpeg",
          "destination": "/app/src/services/uploads/files",
          "filename": "f4253eb041fc8895ce38e9b8353f2ca6",
          "path": "/app/src/services/uploads/files/f4253eb041fc8895ce38e9b8353f2ca6",
          "size": 921338
        }
      }
    };

    return validateMimetype()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E143');
      });
  });

  it('Should reject if mimetype is not provided', () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app,
      data: {
        "file": {
          "fieldname": "file",
          "originalname": "900kb.jpg",
          "encoding": "7bit",
          "destination": "/app/src/services/uploads/files",
          "filename": "f4253eb041fc8895ce38e9b8353f2ca6",
          "path": "/app/src/services/uploads/files/f4253eb041fc8895ce38e9b8353f2ca6",
          "size": 921338
        }
      }
    };

    return validateMimetype()(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E142');
      });
  });

  it('Should succeed if mimetype is valid', () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      params: {},
      app,
      data: {
        "file": {
          "fieldname": "file",
          "originalname": "900kb.jpg",
          "encoding": "7bit",
          "mimetype": app.get('ingredientUploadAllowedMimeTypes')[0],
          "destination": "/app/src/services/uploads/files",
          "filename": "f4253eb041fc8895ce38e9b8353f2ca6",
          "path": "/app/src/services/uploads/files/f4253eb041fc8895ce38e9b8353f2ca6",
          "size": 921338
        }
      }
    };

    return validateMimetype()(mockHook)
      .then((result) => {
        expect(result.data.file).to.deep.equal(mockHook.data.file);
      });
  });

});
