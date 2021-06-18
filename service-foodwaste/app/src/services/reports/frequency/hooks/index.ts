/* istanbul ignore file */

import { disallow, iff, isProvider } from 'feathers-hooks-common';
import {
  authVerifyToken,
  includeSoftDeletedData,
  populateUserAndCostumer, validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

import parseJsonResult from '../../../../hooks/parse-json-result';
import parseAccountParams from '../../../../hooks/parse-report-account-params';
import parseReportDateParams from '../../../../hooks/parse-date-params';
import parseOrderParams from '../../../../hooks/parse-sort-order-params';

const findRequestSchema = schemas.get('report-find-request');

/**
 * @url /reports/*
 */
export const before = {
  all: [
    iff(isProvider('external'),
      validateSchema(findRequestSchema, { coerceTypes: true }),
      authVerifyToken(),
      populateUserAndCostumer(),
      parseReportDateParams(),
      parseAccountParams(),
      parseOrderParams()
    )
  ],
  find: [
    includeSoftDeletedData()
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
