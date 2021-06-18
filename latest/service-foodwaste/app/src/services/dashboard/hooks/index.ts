/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import { authVerifyToken, populateUserAndCostumer, validateSchema } from 'feathers-hooks-esmiley';
import parseDateParams from '../../../hooks/parse-date-params';
import parseRegistrationPointsParams from '../../../hooks/parse-registration-points-params';
import parseReportAccountParams from '../../../hooks/parse-report-account-params';
import parseSortOrderParams from '../../../hooks/parse-sort-order-params';
import parseDimensionParams from '../../../hooks/parse-dimension-params';
import * as schemas from 'schemas';
const findRequestSchema = schemas.get('dashboard-find-request');

export const before = {
  all: [
    validateSchema(findRequestSchema),
    authVerifyToken(),
    populateUserAndCostumer(),
    parseDateParams(),
    parseRegistrationPointsParams(),
    parseReportAccountParams(),
    parseSortOrderParams(),
    parseDimensionParams()
  ],
  find: [],
  get: [disallow()],
  create: [disallow()],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
