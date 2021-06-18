import parseUploadedFile from './parse-uploaded-file';
import deleteUploadedFile from './delete-uploaded-file';
import validateMimetype from './validate-mimetype';
import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';

/**
 * @url /reports/registrations
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    validateMimetype()
  ]
};

export const after = {
  create: [
    parseUploadedFile(),
    deleteUploadedFile()
  ]
};

export const error = {
  create: [
    deleteUploadedFile()
  ]
};
