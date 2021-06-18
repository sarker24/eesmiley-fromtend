import {
  authVerifyToken,
  formatUniqueViolationErrors,
  includeSoftDeletedData,
  isSoftDeletedDataIncluded,
  validateSchema,  populateUserAndCostumer
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';
import { disallow, discard, unless, discardQuery } from 'feathers-hooks-common';
import parseJsonResult from '../../../hooks/parse-json-result';

const findRequestSchema = schemas.get('template-find-request.json');

/**
 * @url /actions
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    // populateUserAndCostumer injects customerId in to query, which in turn transforms into sequelize query.
    // this will cause error since our template table doesnt have customerId column
    discardQuery('customerId')
  ],
  find: [
    validateSchema(findRequestSchema),
    unless((hook) => hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin ? true : false, validateSchema(findRequestSchema, { coerceTypes: true })),
    includeSoftDeletedData()
  ],
  get: [disallow()],
  create: [disallow()],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [
    parseJsonResult(),
    discard('templateAccountId'),
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt'))
  ],
  // could later discard only if not admin
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
