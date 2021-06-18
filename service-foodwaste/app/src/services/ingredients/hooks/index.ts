/* istanbul ignore file */

import upsert from './upsert';
import parseJsonResult from '../../../hooks/parse-json-result';
import {
  applyPatchOperations,
  authVerifyToken,
  cleanUpPatchResponse,
  initPatch,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';

import * as schemas from 'schemas';
import { disallow, discard, discardQuery, unless } from 'feathers-hooks-common';

const findRequestSchema = schemas.get('ingredient-find-request.json');
const createRequestSchema = schemas.get('ingredient-create-request.json');
const getRequestSchema = schemas.get('ingredient-get-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('ingredient-patch-request.json');
/**
 * @url /ingredients
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    discardQuery('description'),
    discardQuery('image')
  ],
  /**
   * A list of ingredients as JSON objects
   * @name Find ingredients
   * @requestSchema ingredient-find-request
   * @returns
   * [{
   * "id": 1,
   * "customerId": 1,
   * "name": "Ingredient Name",
   * "amount": 1,
   * "cost": 123456,
   * "unit": "bag",
   * "currency": "DKK"
   * },
   * {
   * "id": 2,
   * "customerId": 1,
   * "name": "Ingredient Name 2",
   * "amount": 1,
   * "cost": 1237683,
   * "unit": "kg",
   * "currency": "DKK"
   *
   * }]
   */
  find: [
    (hook) => {
      delete hook.params.query.userId;
      return Promise.resolve(hook);
    },
    unless(hook => !!(hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin),
      validateSchema(findRequestSchema, { coerceTypes: true })
    ),
  ],
  /**
   * A ingredient as JSON object
   * @name Get ingredients
   * @requestSchema ingredient-get-request
   * @returns
   * {
   * "id": 1,
   * "customerId": 1,
   * "name": "Ingredient Name",
   * "amount": 1,
   * "cost": 123456,
   * "unit": "bag",
   * "currency": "DKK"
   * }
   */
  get: [
    (hook) => {
      if (hook.params.provider) {
        delete hook.params.query.userId;
      }
      return Promise.resolve(hook);
    },
    validateSchema(getRequestSchema, { coerceTypes: true })
  ],
  /**
   * Creates new ingredient
   * @name Create ingredient
   * @requestSchema ingredient-create-request
   * @example
   * {
   * "customerId": 1,
   * "name": "Ingredient Name",
   * "cost": 123456,
   * "unit": "kg",
   * "currency": "DKK"
   * }
   * @returns
   * {
   * "id": 1,
   * "customerId": 1,
   * "name": "Ingredient Name",
   * "amount: 1,
   * "cost": 123456,
   * "unit": "kg",
   * "currency": "DKK"
   * }
   */
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    upsert({ updateByKeys: ['customerId', 'name'] })
  ],
  update: [
    disallow()
  ],
  /**
   * Patches a ingredient
   * @name Patch ingredient
   * @requestSchema patch-operations-request
   * @example
   * [{
   * "op": "replace",
   * "path": "/cost",
   * "value": 2974237
   * }]
   * @returns
   * {
   * "id": 1,
   * "customerId": 1,
   * "name": "Ingredient Name",
   * "cost": 2974237,
   * "amount": 1,
   * "unit": "kg",
   * "currency": "DKK"
   * }
   */
  patch: [
    validateSchema(patchOperationsSchema),
    initPatch({ endpointName: 'ingredients', entityName: 'ingredient' }),
    applyPatchOperations({ entityName: 'ingredient' }),
    validateSchema(patchRequestSchema, { coerceTypes: true })
  ],
  remove: [disallow()]
};

export const after = {
  all: [
    parseJsonResult(),
    discard('createdAt'),
    discard('updatedAt'),
    discard('deletedAt'),
    /*
     * Bootstrap keys are removed from response to be able to edit/delete bootstrapped data in the Frontend
     * They can be added back to the response once a use case is clear for them
     */
    discard('bootstrapKey'),
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
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
