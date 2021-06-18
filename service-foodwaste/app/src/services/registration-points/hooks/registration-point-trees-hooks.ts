/* istanbul ignore file */

import buildTree from './build-tree';

import parseJsonResult from '../../../hooks/parse-json-result';
import {
  authVerifyToken,
  buildImageLink,
  formatUniqueViolationErrors,
  includeSoftDeletedData,
  isSoftDeletedDataIncluded,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';

import * as schemas from 'schemas';
import { disallow, discard, discardQuery, unless } from 'feathers-hooks-common';
import getNodes from './get-registration-point-tree-nodes';

const findRequestSchema = schemas.get('registration-point-tree-find-request.json');
const getRequestSchema = schemas.get('registration-point-tree-get-request.json');

/**
 * @url /registration-point-trees
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    discardQuery('image')
  ],
  /**
   * A list of registration point trees as JSON objects
   * @name Find registration point tree
   * @requestSchema registration-point-tree-find-request
   * @returns
   * [{
   * "id": "10",
   * "parent: null,
   * "path": null",
   * "name": "Frugter AA",
   * "cost": 1607,
   * "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   * "userId": "71153",
   * "amount": 1000,
   * "costPerkg": 1607,
   * "customerId": "24749",
   * "active": true,
   * "bootstrapKey": null
   * "children": [
   *  "id": "192",
   *  "parent: "10",
   *  "path": "10",
   *  "name": "Frugter AA",
   *  "cost": 1607,
   *  "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   *  "userId": "71153",
   *  "amount": 1000,
   *  "costPerkg": 1607,
   *  "customerId": "24749",
   *  "active": true,
   *  "bootstrapKey": null,
   *  children: [
   *    "id": "298",
   *    "parent: "192",
   *    "path": "10.192",
   *    "name": "Frugter AA",
   *    "cost": 1607,
   *    "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   *    "userId": "71153",
   *    "amount": 1000,
   *    "costPerkg": 1607,
   *    "customerId": "24749",
   *    "active": true,
   *    "bootstrapKey": null,
   *  ]
   * ]
   * }]
   */
  find: [
    unless(hook => !!(hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin),
      validateSchema(findRequestSchema, { coerceTypes: true })
    ),
    includeSoftDeletedData()
  ],
  /**
   * A registration point tree as a JSON object
   * @name Get registration point tree
   * @requestSchema registration-point-tree-get-request
   * @returns
   * {
   * "id": "10",
   * "parent: null,
   * "path": null",
   * "name": "Frugter AA",
   * "cost": 1607,
   * "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   * "userId": "71153",
   * "amount": 1000,
   * "costPerkg": 1607,
   * "customerId": "24749",
   * "active": true,
   * "bootstrapKey": null
   * "children": [
   *  "id": "192",
   *  "parent: "10",
   *  "path": "10",
   *  "name": "Frugter AA",
   *  "cost": 1607,
   *  "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   *  "userId": "71153",
   *  "amount": 1000,
   *  "costPerkg": 1607,
   *  "customerId": "24749",
   *  "active": true,
   *  "bootstrapKey": null,
   *  children: [
   *    "id": "298",
   *    "parent: "192",
   *    "path": "10.192",
   *    "name": "Frugter AA",
   *    "cost": 1607,
   *    "image": "https://s3.eu-central-1.amazonaws.com/esmiley-dev-service-media/c24749_u71153_8dd8fa386f6cfcf625c6.jpeg",
   *    "userId": "71153",
   *    "amount": 1000,
   *    "costPerkg": 1607,
   *    "customerId": "24749",
   *    "active": true,
   *    "bootstrapKey": null,
   *  ]
   * ]
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  create: [disallow()],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [
    parseJsonResult(),
    getNodes(),
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt')),
    /*
     * Bootstrap keys are removed from response to be able to edit/delete bootstrapped data in the Frontend
     * They can be added back to the response once a use case is clear for them
     */
    discard('bootstrapKey'),
    buildImageLink(),
    buildTree()
  ],
  find: [],
  get: [],
  create: [],
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
