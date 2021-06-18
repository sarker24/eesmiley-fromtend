/* istanbul ignore file */

import {
  applyPatchOperations,
  authVerifyToken,
  cleanUpPatchResponse,
  formatUniqueViolationErrors,
  includeSoftDeletedData,
  initPatch,
  isSoftDeletedDataIncluded,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';
import { disallow, discard, discardQuery, unless } from 'feathers-hooks-common';

const findRequestSchema = schemas.get('action-find-request.json');
const getRequestSchema = schemas.get('action-get-request.json');
const createRequestSchema = schemas.get('action-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('action-patch-request.json');
/**
 * @url /actions
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    discardQuery('description')
  ],
  /**
   * A list of actions as JSON objects
   * @name Find actions
   * @requestSchema action-find-request
   * @returns
   * [{
   * "id": 11,
   * "name": "test action",
   * "description": "This a description for an action",
   * "userId": "1",
   * "customerId": "1"
   * }]
   */
  find: [
    unless((hook) => hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin ? true : false, validateSchema(findRequestSchema, { coerceTypes: true })),
    includeSoftDeletedData()
  ],
  /**
   * An actions as a JSON object
   * @name Get actions
   * @requestSchema action-get-request
   * @returns
   * {
   * "id": 11,
   * "name": "test action",
   * "description": "This a description for an action",
   * "userId": "1",
   * "customerId": "1"
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  create: [
    disallow('external'),
    validateSchema(createRequestSchema, { coerceTypes: true })
  ],
  update: [disallow()],
  patch: [
    disallow('external'),
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'actions', entityName: 'action' }),
    applyPatchOperations({ entityName: 'action' }),
    validateSchema(patchRequestSchema, { coerceTypes: true })
  ],
  remove: [disallow('external')]
};

export const after = {
  all: [
    /*
     * When a ORM such as Sequelize is Used, feathersJS returns the whole output
     * from it, following piece of code, cleans up the output
     */
    hook => {
      hook.result = JSON.parse(JSON.stringify(hook.result));
      return hook;
    },
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt'))
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [
    cleanUpPatchResponse()
  ],
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
