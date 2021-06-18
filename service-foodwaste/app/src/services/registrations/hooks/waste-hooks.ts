/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import { authVerifyToken, populateUserAndCostumer, validateSchema, verifyUserAllowedToQueryAccounts } from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('registration-waste-find-request.json');

/**
 * @url /registrations/waste
 */
export const before = {
  all: [authVerifyToken(), populateUserAndCostumer()],
  /**
   * A report showing the food waste for a given period grouping by account and by registration point
   * @name Find registration/waste
   * @requestSchema registrations-waste-find-request
   * @returns
   * {
   * "actualCost": "153000",
   * "actualAmount": "25000",
   * "accountsWithoutSettings": [
   *     "33884"
   * ],
   * "expectedAmount": 2685714,
   * "registrationPoints": [
   *     {
   *     "cost": "38000",
   *     "amount": "4000",
   *     "name": "beef"
   *     },
   *   {
   *    "cost": "20000",
   *         "amount": "10000",
   *         "name": "broccoli"
   *     },
   *     {
   *         "cost": "80000",
   *         "amount": "10000",
   *         "name": "cheese"
   *    },
   *    {
   *         "cost": "15000",
   *         "amount": "1000",
   *         "name": "registrationPoint with ingredients edited name"
   *    }
   * ],
   * "accounts": [
   *    {
   *         "actualCost": "109500",
   *         "actualAmount": "21000",
   *         "accountId": "33883",
   *         "name": "Monikas burgers and FoodWaste",
   *         "expectedAmount": 1342857,
   *         "registrationPoints": [
   *             {
   *                "cost": "80000",
   *                "amount": "10000",
   *                "name": "Cheese",
   *                "accountId": "33883",
   *                "registrationPointId": "1485"
   *             },
   *             {
   *                "cost": "9500",
   *                "amount": "1000",
   *                "name": "Beef",
   *                "accountId": "33883",
   *                "registrationPointId": "1491"
   *             },
   *             {
   *                "cost": "20000",
   *                "amount": "10000",
   *                "name": "Broccoli",
   *                "accountId": "33883",
   *                "registrationPointId": "1497"
   *             }
   *         ]
   *    },
   *    {
   *         "actualCost": "43500",
   *         "actualAmount": "4000",
   *         "accountId": "33885",
   *         "name": "Juanillo alimana con mucha mana",
   *         "expectedAmount": 1342857,
   *         "registrationPoints": [
   *             {
   *                "cost": "28500",
   *                "amount": "3000",
   *                "name": "Beef",
   *                "accountId": "33885",
   *                "registrationPointId": "1356"
   *             },
   *             {
   *                "cost": "15000",
   *                "amount": "1000",
   *                "name": "Registration point with ingredients edited name",
   *                "accountId": "33885",
   *                "registrationPointId": "1482"
   *             }
   *         ]
   *    }
   * ]
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
  find: []
};

export const error = {
  all: [],
  find: []

};
