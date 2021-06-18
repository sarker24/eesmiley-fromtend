/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import {
  authVerifyToken, formatUniqueViolationErrors,
  populateUserAndCostumer, validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

import parseJsonResult from '../../../hooks/parse-json-result';
import updateBootstrapSettings from './update-bootstrap-settings-hook';

const createRequestSchema = schemas.get('bootstrap-task-create-request.json');

/**
 * @url /guest-types
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  find: [disallow()],
  get: [disallow()],
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true })
  ],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [parseJsonResult()],
  find: [],
  get: [],
  create: [updateBootstrapSettings()],
  update: [],
  patch: [],
  remove: []
};

export const error = {
  all: [formatUniqueViolationErrors()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
