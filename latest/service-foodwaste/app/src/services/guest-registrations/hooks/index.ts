/* istanbul ignore file */

import { disallow, discard, unless, iff } from 'feathers-hooks-common';
import {
  applyPatchOperations,
  authVerifyToken, formatUniqueViolationErrors,
  includeSoftDeletedData, initPatch, isSoftDeletedDataIncluded,
  populateUserAndCostumer, validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

import parseParameters from './parse-query-parameters';

import validateGuestRegistration from './validate-guest-registration';
import handleDateDuplicates from './handle-date-duplicates';
import handleCreateAndPatchResult from './handle-create-and-patch-result';
import parseJsonResult from '../../../hooks/parse-json-result';
import parseAccountParams from '../../../hooks/parse-account-params';
import parseGuestTypeParams from '../../../hooks/parse-guest-type-params';

const findRequestSchema = schemas.get('guest-registration-find-request.json');
const getRequestSchema = schemas.get('guest-registration-get-request.json');

const createRequestSchema = schemas.get('guest-registration-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('guest-registration-patch-request.json');

/**
 * @url /guest-registrations
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    hook => {
      hook.params.sequelize = {
        scope: 'includeGuestType'
      };
      return hook;
    }
  ],
  find: [
    unless(hook => !!(hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin),
      validateSchema(findRequestSchema, { coerceTypes: true }) as any
    ),
    parseParameters(),
    parseAccountParams(),
    parseGuestTypeParams(),
    includeSoftDeletedData(),
  ],
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],

  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    validateGuestRegistration(),
  ],
  update: [disallow()],
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'guest-registrations', entityName: 'guestRegistration' }),
    applyPatchOperations({ entityName: 'guestRegistration' }),
    validateSchema(patchRequestSchema, { coerceTypes: true }),
    validateGuestRegistration()
  ],
  remove: []
};

export const after = {
  all: [
    iff(hook => ['get', 'find'].includes((hook.method)),
      parseJsonResult(),
      /* Note: there's a bug in discard that yields error if guestType is null, the bug is only fixed
      *  in common feathers v4 & v5, which require updating feathers */
      discard('createdAt', 'guestType.createdAt'),
      discard('updatedAt', 'guestType.updatedAt'),
      unless(isSoftDeletedDataIncluded(), discard('deletedAt')))
  ],
  find: [],
  get: [],
  create: [
    handleDateDuplicates(),
    handleCreateAndPatchResult()
  ],
  update: [],
  patch: [handleCreateAndPatchResult()],
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
