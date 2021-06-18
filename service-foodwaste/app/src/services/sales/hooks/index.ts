/* istanbul ignore file */

import addUniqueViolationErrorMessage from './add-unique-violation-error-message';
import addSalesQueryFilters from './add-sales-query-filters';
import includeGuestRegistrations from './include-guest-registrations';
import createGuestRegistration from './create-guest-registration';

import {
  authVerifyToken,
  applyPatchOperations,
  cleanUpPatchResponse,
  formatUniqueViolationErrors,
  includeSoftDeletedData,
  initPatch,
  isSoftDeletedDataIncluded,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('sale-find-request.json');
const getRequestSchema = schemas.get('sale-get-request.json');
const createRequestSchema = schemas.get('sale-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('sale-patch-request.json');
const common = require('feathers-hooks-common');
/**
 * @url /sales
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  /**
   * A list of sales as JSON objects
   * @name Find sales
   * @requestSchema sale-find-request
   * @returns
   * [{
   *  "id": 1,
   *  "userId": 1,
   *  "customerId": 1,
   *  "date": "2017-05-04",
   *  "income": 10000,
   *  "portions": 45,
   *  "portionPrice": 222,
   *  "guests": 45,
   *  "productionCost": 123,
   *  "productionWeight": 54
   * }]
   */
  find: [
    common.unless((hook) => hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin ? true : false, validateSchema(findRequestSchema, { coerceTypes: true })),
    addSalesQueryFilters(),
    includeSoftDeletedData()
  ],
  /**
   * Sales as a JSON object
   * @name Get sales
   * @requestSchema sale-get-request
   * @returns
   * {
   *  "id": 1,
   *  "userId": 1,
   *  "customerId": 1,
   *  "date": "2017-05-04",
   *  "income": 10000,
   *  "portions": 45,
   *  "portionPrice": 222,
   *  "guests": 45,
   *  "productionCost": 123,
   *  "productionWeight": 54
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  /**
   * Creates new sale
   * @name Create sale
   * @requestSchema sale-create-request
   * @example
   * {
   *  "userId": 1,
   *  "customerId": 1,
   *  "date": "2017-05-04",
   *  "income": 10000,
   *  "portions": 45,
   *  "portionPrice": 222,
   *  "guests": 45,
   *  "productionCost": 123,
   *  "productionWeight": 54
   * }
   * @returns
   * {
   *  "id": 1,
   *  "userId": 1,
   *  "customerId": 1,
   *  "date": "2017-05-04",
   *  "income": 10000,
   *  "portions": 45,
   *  "portionPrice": 222,
   *  "guests": 45,
   *  "productionCost": 123,
   *  "productionWeight": 54
   * }
   */
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    createGuestRegistration(),
  ],
  update: [common.disallow()],
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'sales', entityName: 'sale' }),
    applyPatchOperations({ entityName: 'sale' }),
    validateSchema(patchRequestSchema, { coerceTypes: true }),
    createGuestRegistration()
  ],
  remove: []
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
    common.discard('createdAt'),
    common.discard('updatedAt'),
    common.unless(isSoftDeletedDataIncluded(), common.discard('deletedAt')),
    includeGuestRegistrations()
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
  create: [
    addUniqueViolationErrorMessage()
  ],
  update: [],
  patch: [],
  remove: []
};
