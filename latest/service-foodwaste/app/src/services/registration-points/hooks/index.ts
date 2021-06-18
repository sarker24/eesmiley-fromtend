/* istanbul ignore file */

import calculatecostPerkg from './calculate-cost-per-kg';
import assignPathToRegistrationPoint from './assign-path-to-registration-point';
import validateRegistrationPoint from './validate-registration-point';
import cascadeActivation from './cascade-activation-to-subtrees';
import cascadeRemoval from './cascade-removal-to-subtrees';
import cascadePathUpdate from './cascade-path-update-to-subtrees';

import validateLabel from './validate-label';

import parseJsonResult from '../../../hooks/parse-json-result';
import parseAccountParams from '../../../hooks/parse-account-params';

import {
  applyPatchOperations,
  authVerifyToken,
  buildImageLink,
  buildImageObject,
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

const findRequestSchema = schemas.get('registration-point-find-request.json');
const getRequestSchema = schemas.get('registration-point-get-request.json');
const createRequestSchema = schemas.get('registration-point-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('registration-point-patch-request.json');
/**
 * @url /registration-points
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    discardQuery('image')
  ],
  /**
   * A list of registration points as JSON objects
   * @name Find registration point
   * @requestSchema registration-point-find-request
   * @returns
   * [{
   * "id": "298",
   * "parentId": 100",
   * "path": "10.100",
   * "name": "Frugter AA",
   * "cost": 1607,
   * "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   * "userId": "71153",
   * "amount": 1000,
   * "costPerkg": 1607,
   * "customerId": "24749",
   * "active": true,
   * "bootstrapKey": null
   * }]
   */
  find: [
    unless(hook => !!(hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin),
      validateSchema(findRequestSchema, { coerceTypes: true })
    ),
    includeSoftDeletedData(),
    parseAccountParams()
  ],
  /**
   * A registration point as a JSON object
   * @name Get products
   * @requestSchema registration-point-get-request
   * @returns
   * {
   * "id": "298",
   * "parentId": 100",
   * "path": "10.100",
   * "name": "Frugter AA",
   * "cost": 1607,
   * "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   * "userId": "71153",
   * "amount": 1000,
   * "costPerkg": 1607,
   * "customerId": "24749",
   * "active": true,
   * "bootstrapKey": null
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  /**
   * Creates new registration point
   * @name Create registration point
   * @requestSchema registration-point-create-request
   * @example
   * {
   * "name": "test product",
   * "parentId": "192",
   * "cost": 2000,
   * "amount": 1000,
   * "ingredients": [
   *    {
   *      "id": 1,
   *      "name": "Ingredient Name 1",
   *      "cost": 1000,
   *      "unit": "kg",
   *      "amount": 1
   *    },
   *    {
   *      "id": 2,
   *      "name": "Ingredient Name 2",
   *      "cost": 1000,
   *      "unit": "bag",
   *      "amount": 1
   *    }
   *  ]
   * }
   * @returns
   * {
   * "id": "6",
   * "name": "test product",
   * "parent": "192",
   * "path": "192",
   * "cost": 2000,
   * "image": null,
   * "userId": "1",
   * "amount": 1000,
   * "costPerkg": 2000,
   * "customerId": "1",
   * "active": true,
   * "bootstrapKey": null,
   * "ingredients": [
   *    {
   *      "id": 1,
   *      "name": "Ingredient Name 1",
   *      "cost": 1000,
   *      "unit": "kg",
   *      "amount": 1
   *    },
   *    {
   *      "id": 2,
   *      "name": "Ingredient Name 2",
   *      "cost": 1000,
   *      "unit": "bag",
   *      "amount": 1
   *    }
   *  ]
   * }
   */
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    calculatecostPerkg(),
    buildImageObject(),
    validateLabel(),
    assignPathToRegistrationPoint()
  ],
  update: [disallow()],
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'registration-points', entityName: 'registration_point' }),
    validateLabel(),
    validateRegistrationPoint(),
    applyPatchOperations({ entityName: 'registration_point' }),
    buildImageObject(),
    calculatecostPerkg(),
    assignPathToRegistrationPoint(),
    validateSchema(patchRequestSchema, { coerceTypes: true })
  ],
  remove: [
    // a quick way to simplify validation (same validation logic as with patches)
    initPatch({ endpointName: 'registration-points', entityName: 'registration_point' }),
    validateRegistrationPoint()
  ]
};

export const after = {
  all: [
    parseJsonResult(),
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt')),
    /*
     * Bootstrap keys are removed from response to be able to edit/delete bootstrapped data in the Frontend
     * They can be added back to the response once a use case is clear for them
     */
    discard('bootstrapKey'),
    buildImageLink()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [
    cascadePathUpdate(),
    cascadeActivation(),
    // sequelize update (via patch) doesnt map table to model correctly.
    // now update seem to return area model instances.
    // when old models are removed, remove these
    discard('oldModelId'),
    discard('oldModelType'),
    discard('categoryId'),
    hook => {
      if ('parentProductId' in hook.result) {
        hook.result.parentId = hook.result.parentProductId;
        delete hook.result.parentProductId;
      }
      return hook;
    },
    cleanUpPatchResponse()
  ],
  remove: [cascadeRemoval()]
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
