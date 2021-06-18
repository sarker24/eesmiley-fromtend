/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import { authVerifyToken, populateUserAndCostumer, validateSchema, verifyUserAllowedToQueryAccounts } from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('registration-improvements-find-request.json');

/**
 * @url /registrations/improvements
 */
export const before = {
  all: [
    (hook) => {
      delete hook.app.response.statusCode;
    },
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  /**
   * A object of data with total max waste cost, forecasted or improvement waste cost, with additional list of data
   * per account. If 'period' is provided, the past 5 periods (in terms of the 'period' value, eg. "week") from the
   * current start->end period will be provided as well with only max and improvement cost.
   * NOTE: might include the "accountsWithoutSettings", "accountsWithoutRegistrationPoints", "accountsWithoutEnoughRegs" props,
   * which include account IDs of the accounts which do not meet one of the requirements (they speak for themselves).
   *
   * @name Find Improvements
   * @requestSchema registration-improvements-find-request
   * @returns
   * {
   *     "maxCost": 2535900,
   *     "improvementCost": 440669,
   *     "expectedWeight": 321000,
   *     "actualCost": 2095231,
   *     "days": 7,
   *     "accounts": [
   *         {
   *             "accountId": "28143",
   *             "name": "Some test company shiiieeeeeet",
   *             "maxCost": 2535900,
   *             "improvementCost": 440669,
   *             "averageCost": 8,
   *             "expectedWeight": 321000,
   *             "actualCost": 2095231,
   *             "trend": [
   *                 {
   *                     "maxCost": 2088986,
   *                     "improvementCost": 0
   *                 },
   *                 {
   *                     "maxCost": -1,
   *                     "improvementCost": -1
   *                 },
   *                 {
   *                     "maxCost": 2474957,
   *                     "improvementCost": 208695
   *                 },
   *                 {
   *                     "maxCost": 3602400,
   *                     "improvementCost": 1249529
   *                 },
   *                 {
   *                     "maxCost": 3602400,
   *                     "improvementCost": 1090391
   *                 }
   *             ]
   *         }
   *     ],
   *     "accountsWithoutSettings": [],
   *     "accountsWithoutEnoughRegs": [
   *        {
   *            "id": "78946",
   *            "name": "Some company"
   *        }
   *     ]
   * }
   */
  find: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
    verifyUserAllowedToQueryAccounts()
  ],
  get: [disallow()],
  create: [disallow()],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [
    (hook) => {
      hook.result = JSON.parse(JSON.stringify(hook.result));
    }
  ],
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
