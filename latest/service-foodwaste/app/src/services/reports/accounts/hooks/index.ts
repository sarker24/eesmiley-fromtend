/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import {
  authVerifyToken,
  includeSoftDeletedData,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

import parseJsonResult from '../../../../hooks/parse-json-result';
import decodeAccountQueryParams from './decode-account-query-params';
import parseDimensionParams from '../../../../hooks/parse-dimension-params';
import parseDateParams from '../../../../hooks/parse-date-params';
import parseAccountsQueryParams from './parse-accounts-query-params';
import parseResourceParams from '../../../../hooks/parse-resource-params';
import parseGuestTypeParams from '../../../../hooks/parse-guest-type-params';

const findRequestSchema = schemas.get('report-accounts-find-request');
const accountQuerySchema = schemas.get('report-accounts-query');

export const before = {
  all: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
    authVerifyToken(),
    populateUserAndCostumer(),
    parseDateParams(),
    parseDimensionParams(),
    parseGuestTypeParams(),
    decodeAccountQueryParams(),
    validateSchema(accountQuerySchema, { coerceTypes: true }),
    parseAccountsQueryParams(),
    parseResourceParams()
  ],
  find: [
    includeSoftDeletedData(),
  ],
  get: [disallow()],
  create: [disallow()],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [parseJsonResult()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
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
