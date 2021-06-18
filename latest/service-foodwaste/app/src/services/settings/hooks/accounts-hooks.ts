/* istanbul ignore file */

import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';
import { disallow } from 'feathers-hooks-common';

/**
 * @url /settings/:customerId/accounts
 */
export const before = {
  all: [authVerifyToken(), populateUserAndCostumer()],
  /**
   * Retrieve the accounts to which a customer has subscribed from their own foodwaste settings
   * @name Get accounts from settings
   * @param customerId ^integer^ <required>
   * @returns
   * {
   *  "subscribed": [
   *    {
   *        "id": 123,
   *        "name": "Some firma",
   *        "settingsAreSet": true
   *    },
   *    {
   *        "id": 456,
   *        "name": "Another firma",
   *        "settingsAreSet": true
   *    },
   *    {
   *        "id": 789,
   *        "name": "Something else",
   *        "settingsAreSet": false
   *    }
   *  ],
   *  "notSubscribed": [
   *    {
   *        "id": 321,
   *        "name": "Firma 1"
   *    },
   *    {
   *        "id": 654,
   *        "name": "Firma 2"
   *    },
   *    {
   *        "id": 987,
   *        "name": "Firma 3"
   *    }
   *  ]
   * }
   */
  find: [],
  get: [disallow()],
  update: [disallow()],
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
