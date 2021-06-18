/* istanbul ignore file */

import { disallow, discard, discardQuery, unless, iff } from 'feathers-hooks-common';
import {
  applyPatchOperations,
  authVerifyToken, buildImageObject, formatUniqueViolationErrors,
  includeSoftDeletedData, initPatch, isSoftDeletedDataIncluded,
  populateUserAndCostumer, validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

import hasGuestTypesEnabled from './has-guest-types-enabled';
import validatePatch from './validate-patch';
import validateRemove from './validate-remove';
import parseJsonResult from '../../../hooks/parse-json-result';
import parseAccountParams from '../../../hooks/parse-account-params';
const findRequestSchema = schemas.get('guest-type-find-request.json');
const getRequestSchema = schemas.get('guest-type-get-request.json');
const createRequestSchema = schemas.get('guest-type-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('guest-type-patch-request.json');

/**
 * @url /guest-types
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    parseAccountParams(),
    discardQuery('image')
  ],
  find: [
    unless(hook => !!(hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin),
      validateSchema(findRequestSchema, { coerceTypes: true }) as any
    ),
    includeSoftDeletedData(),
  ],
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    buildImageObject()
  ],
  update: [disallow()],
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'guest-types', entityName: 'guestType' }),
    applyPatchOperations({ entityName: 'guestType' }),
    iff(hasGuestTypesEnabled(), validatePatch()),
    buildImageObject(),
    validateSchema(patchRequestSchema, { coerceTypes: true })

  ],
  remove: [iff(hasGuestTypesEnabled(), validateRemove())]
};

export const after = {
  all: [
    parseJsonResult(),
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt'))
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
