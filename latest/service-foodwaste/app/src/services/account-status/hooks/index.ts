import {
  authVerifyToken,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';
import { disallow } from 'feathers-hooks-common';

const findRequestSchema = schemas.get('account-status-find-request.json');

export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  /**
   * A object containing the account status for the selected account ids
   * @name Find actions
   * @requestSchema account-status-find-request
   * @returns
   * {
   *    "registrationDaysPerAccount": {
   *        "37286": {
   *            "name": "Dansk FoodWaste Demo ",
   *            "expectedDays": 22,
   *            "registeredDays": 1,
   *            "subscribedAccounts": {
   *                "37313": {
   *                    "name": "Engelsk FoodWaste Demo",
   *                    "expectedDays": 17,
   *                    "registeredDays": 0
   *                }
   *            }
   *        }
   *    }
   * }
   */
  find: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
  ],
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
