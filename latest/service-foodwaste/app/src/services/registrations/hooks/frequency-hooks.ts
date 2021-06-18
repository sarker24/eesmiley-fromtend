/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import { authVerifyToken, populateUserAndCostumer, validateSchema, verifyUserAllowedToQueryAccounts } from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('registration-frequency-find-request.json');

/**
 * @url /registrations/frequency
 */
export const before = {
  all: [authVerifyToken(), populateUserAndCostumer()],
  /**
   * Retrieve the frequency of registrations for the accounts to which the requesting user's account is subscribed.
   * If 'onTarget' is `true`, then the 'pointerLocation' (and thus the 'frequency' in the nested objects) is hardcoded
   * 150. Otherwise it is a calculated value form the expected and registered days.
   * @name Find registrations frequency
   * @requestSchema registrations-frequency-find-request
   * @returns
   * {
   *     "onTarget": true,
   *     "pointerLocation": 150,
   *     "accounts": [
   *         {
   *             "accountId": "28143",
   *             "onTarget": true,
   *             "frequency": 150,
   *             "name": "Some test company",
   *             "trend": [
   *                 {
   *                     "onTarget": false,
   *                     "percentage": 67
   *                 },
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 },
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 },
   *                 {
   *                     "onTarget": false,
   *                     "percentage": 83
   *                 },
   *                 {
   *                     "onTarget": false,
   *                     "percentage": 27
   *                 }
   *             ]
   *         },
   *         {
   *             "accountId": "33871",
   *             "onTarget": true,
   *             "frequency": 150,
   *             "name": "Some name",
   *             "trend": [
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 },
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 },
   *                 {
   *                     "onTarget": false,
   *                     "percentage": 67
   *                 },
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 },
   *                 {
   *                     "onTarget": true,
   *                     "percentage": 150
   *                 }
   *             ]
   *         }
   *     ],
   *     "accountsWithoutSettings": [
   *         "32039",
   *         "36742",
   *         "4959"
   *     ]
   * }
   */
  find: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
    verifyUserAllowedToQueryAccounts()
  ],
  get: [disallow()],
  create: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [],
  find: [],
  get: [],
  create: [],
  remove: []
};

export const error = {
  all: [],
  find: [],
  get: [],
  create: [],
  remove: []
};
