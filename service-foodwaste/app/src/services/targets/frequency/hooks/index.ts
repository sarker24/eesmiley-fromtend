/* istanbul ignore file */

import { disallow, iff, isProvider } from 'feathers-hooks-common';
import {
  authVerifyToken, populateUserAndCostumer, validateSchema
} from 'feathers-hooks-esmiley';

import parseJsonResult from '../../../../hooks/parse-json-result';
import parseDateParams from '../../../../hooks/parse-date-params';
import parseAccountParams from '../../../../hooks/parse-account-params';
import * as schemas from 'schemas';
const findRequestSchema = schemas.get('target-find-request');

export const before = {
  all: [
    iff(isProvider('external'),
      validateSchema(findRequestSchema),
      authVerifyToken(),
      populateUserAndCostumer(),
      parseAccountParams(),
      parseDateParams()
    )
  ],
  find: [],
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
